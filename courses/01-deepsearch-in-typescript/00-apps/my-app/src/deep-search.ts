import { streamText, type Message, type TelemetrySettings, type StreamTextOnFinishCallback } from "ai";
import { model } from "~/models";
import { z } from "zod";
import { searchSerper } from "~/serper";
import { scrapePages } from "~/server/llm-tools/scrape-pages";

/**
 * The system prompt used for Deep Search LLM calls.
 */
const SYSTEM_PROMPT = `You are an AI assistant with access to a web search tool. 
Always use the searchWeb tool to answer questions, and always cite your sources with inline markdown links.
The formatting should be:
[Title](Link)

You should find the latest news on the web. Today is ${new Date().toLocaleDateString()}.

You also have access to a scrapePages tool, which can fetch the full content of web pages as markdown. Use this tool when you need more information than what is provided in search result snippets, or when you need to analyze the full content of a page. Only use this tool for URLs you are allowed to crawl, and only when necessary, as it is more resource intensive.
ALWAYS USE THE SCRAPEPAGES TOOL on multiple pages. Use it at least 4-6 times per query UNTIL you have the information you need. Use a diverse set of domains.
`;

/**
 * The tools available to the Deep Search LLM agent.
 */
const TOOLS = {
  searchWeb: {
    parameters: z.object({
      query: z.string().describe("The query to search the web for"),
    }),
    execute: async (
      { query }: { query: string },
      { abortSignal }: { abortSignal?: AbortSignal }
    ) => {
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
    execute: async ({ urls }: { urls: string[] }) => {
      const { results } = await scrapePages(urls);
      return results;
    },
  },
};

type ToolSet = typeof TOOLS;

/**
 * Calls the Deep Search LLM agent with the provided messages and options.
 * Allows injection of onFinish and telemetry for flexible usage (API, eval, etc).
 */
export function streamFromDeepSearch(opts: {
  messages: Message[];
  onFinish?: StreamTextOnFinishCallback<ToolSet>;
  telemetry?: TelemetrySettings;
}) {
  return streamText<ToolSet>({
    model,
    messages: opts.messages,
    maxSteps: 10,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    onFinish: opts.onFinish,
    experimental_telemetry: opts.telemetry,
  });
}

/**
 * Simple function for evaluation: takes messages, returns the LLM's text response.
 * Used in evals and tests.
 */
export async function askDeepSearch(messages: Message[]): Promise<string> {
  const result = streamFromDeepSearch({
    messages,
    onFinish: undefined, // No-op for evals
    telemetry: { isEnabled: false },
  });
  await result.consumeStream();
  return await result.text;
} 