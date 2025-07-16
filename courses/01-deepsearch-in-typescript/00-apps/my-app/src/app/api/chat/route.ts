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
import { db } from "~/server/db/index";
import { users, requests } from "~/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { upsertChat } from "~/server/db/queries";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  if (!isAdmin) {
    const requestCount = await db
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

  // Insert request record
  await db.insert(requests).values({ userId });

  const body = (await request.json()) as {
    messages: Array<Message>;
    chatId: string;
    isNewChat: boolean;
  };

  const { messages, chatId, isNewChat } = body;
  let chatTitle = messages[0]?.content?.toString().slice(0, 100) || "New Chat";

  if (isNewChat) {
    await upsertChat({
      userId,
      chatId,
      title: chatTitle,
      messages: messages.map((msg, idx) => ({ ...msg, order: idx })),
    });
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      if (isNewChat) {
        dataStream.writeData({
          type: "NEW_CHAT_CREATED",
          chatId,
        });
      }
      const result = streamText({
        model,
        messages,
        system: `You are an AI assistant with access to a web search tool. 
        Always use the searchWeb tool to answer questions, and always cite your sources with inline markdown links.
        The fomatting should be:
        [Title](Link)`,
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
              }));
            },
          },
        },
        maxSteps: 10,
        experimental_telemetry: { isEnabled: true },
        onFinish: async ({ response }) => {
          const responseMessages = response.messages;
          const updatedMessages = appendResponseMessages({
            messages,
            responseMessages,
          });
          // Save the updated messages to the database (only parts property is required)
          await upsertChat({
            userId,
            chatId,
            title: chatTitle,
            messages: updatedMessages.map((msg, idx) => ({ ...msg, order: idx })),
          });
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