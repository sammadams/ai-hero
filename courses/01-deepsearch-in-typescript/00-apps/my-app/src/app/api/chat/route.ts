import { env } from "~/env";
import { Langfuse } from "langfuse";
import { appendResponseMessages } from "ai";
import type { Message } from "ai";
import {
  streamText,
  createDataStreamResponse,
} from "ai";
import { model } from "~/models";
import { auth } from "~/server/auth/index.ts";
import { z } from "zod";
import { searchSerper } from "~/serper";
import { scrapePages } from "~/server/llm-tools/scrape-pages";
import { db } from "~/server/db/index";
import { users, requests, chats } from "~/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { upsertChat } from "~/server/db/queries";

export const maxDuration = 60;

const langfuse = new Langfuse({
  environment: env.NODE_ENV,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Create a Langfuse trace for this chat session (sessionId will be updated if needed)
  const trace = langfuse.trace({
    name: "chat",
    userId: session.user.id,
  });

  // Rate limiting logic
  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Fetch user and check admin
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const isAdmin = user?.isAdmin;
  const MAX_REQUESTS_PER_DAY = 50;

  let requestCount = [];
  if (!isAdmin) {
    requestCount = await db
      .select()
      .from(requests)
      .where(and(
        eq(requests.userId, userId),
        gte(requests.createdAt, today),
        lte(requests.createdAt, tomorrow)
      ));
    if (requestCount.length >= MAX_REQUESTS_PER_DAY) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  await db.insert(requests).values({ userId });

  const body = (await request.json()) as {
    messages: Array<Message>;
    chatId: string;
    isNewChat: boolean;
  };

  const { messages, chatId: chatIdFromBody, isNewChat } = body;
  // Always use the chatId from the body if present, otherwise generate a new one
  const currentChatId = chatIdFromBody || crypto.randomUUID();
  let chatTitle = messages[0]?.content?.toString().slice(0, 100) || "New Chat";

  if (isNewChat) {
    // --- create-new-chat span ---
    const createChatSpan = trace.span({
      name: "create-new-chat",
      input: { userId, chatId: currentChatId, title: chatTitle, messages: messages.map((msg, idx) => ({ role: msg.role, order: idx })) },
    });
    try {
      await upsertChat({
        userId,
        chatId: currentChatId,
        title: chatTitle,
        messages: messages.map((msg, idx) => ({ ...msg, order: idx })),
      });
      createChatSpan.end({ output: { chatId: currentChatId } });
      trace.update({ sessionId: currentChatId });
    } catch (err) {
      createChatSpan.end({ output: { error: err instanceof Error ? err.message : err } });
      throw err;
    }
  } else {
    // --- verify-chat-ownership span ---
    const verifyOwnershipSpan = trace.span({
      name: "verify-chat-ownership",
      input: { userId, chatId: currentChatId },
    });
    try {
      const chat = await db.query.chats.findFirst({ where: eq(chats.id, currentChatId) });
      if (!chat || chat.userId !== userId) {
        verifyOwnershipSpan.end({ output: { error: "Chat not found or unauthorized" } });
        return new Response("Chat not found or unauthorized", { status: 404 });
      }
      verifyOwnershipSpan.end({ output: { chatId: currentChatId, userId: chat.userId } });
      trace.update({ sessionId: currentChatId });
    } catch (err) {
      verifyOwnershipSpan.end({ output: { error: err instanceof Error ? err.message : err } });
      throw err;
    }
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      if (isNewChat) {
        dataStream.writeData({
          type: "NEW_CHAT_CREATED",
          chatId: currentChatId,
        });
      }
      const result = streamText({
        model,
        messages,
        system: `You are an AI assistant with access to a web search tool. 
        Always use the searchWeb tool to answer questions, and always cite your sources with inline markdown links.
        The formatting should be:
        [Title](Link)

        You should find the latest news on the web. Today is ${new Date().toLocaleDateString()}.
        
        You also have access to a scrapePages tool, which can fetch the full content of web pages as markdown. Use this tool when you need more information than what is provided in search result snippets, or when you need to analyze the full content of a page. Only use this tool for URLs you are allowed to crawl, and only when necessary, as it is more resource intensive.
        ALWAYS USE THE SCRAPEPAGES TOOL on multiple pages. Use it at least 4-6 times per query UNTIL you have the information you need. Use a diverse set of domains.
        `,
        tools: {
          searchWeb: {
            parameters: z.object({
              query: z.string().describe("The query to search the web for"),
            }),
            execute: async ({ query }, { abortSignal }) => {
              const results = await searchSerper({ q: query, num: 10 }, abortSignal);
              return results.organic.map((result) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
                date: result.date,
              }));
            },
          },
          scrapePages: {
            parameters: z.object({
              urls: z.array(z.string()).describe("The URLs to scrape for full page content as markdown"),
            }),
            execute: async ({ urls }) => {
              const { results } = await scrapePages(urls);
              return results;
            },
          },
        },
        maxSteps: 10,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "agent",
          metadata: {
            langfuseTraceId: trace.id,
          },
        },
        onFinish: async ({ response }) => {
          const responseMessages = response.messages;
          const updatedMessages = appendResponseMessages({
            messages,
            responseMessages,
          });
          // --- save-chat-history span ---
          const saveChatHistorySpan = trace.span({
            name: "save-chat-history",
            input: { userId, chatId: currentChatId, title: chatTitle, messages: updatedMessages.map((msg, idx) => ({ role: msg.role, order: idx })) },
          });
          try {
            await upsertChat({
              userId,
              chatId: currentChatId,
              title: chatTitle,
              messages: updatedMessages.map((msg, idx) => ({ ...msg, order: idx })),
            });
            saveChatHistorySpan.end({ output: { chatId: currentChatId } });
            await langfuse.flushAsync();
          } catch (err) {
            saveChatHistorySpan.end({ output: { error: err instanceof Error ? err.message : err } });
            throw err;
          }
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
    onError: (e) => {
      console.error(e);
      return "Oops, an error occured!";
    },
  });
} 