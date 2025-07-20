import { searchSerper } from "~/serper";
import { scrapePages } from "~/server/llm-tools/scrape-pages";
import { env } from "~/env";
import { SystemContext } from "./system-context";
import { getNextAction, type Action } from "./get-next-action";
import { answerQuestion } from "./answer-question";
import type { StreamTextResult } from "ai";

/**
 * Executes a web search and returns formatted results
 */
async function searchWeb(query: string) {
  const results = await searchSerper({ q: query, num: env.SEARCH_RESULTS_COUNT }, undefined);
  return results.organic.map((result) => ({
    date: result.date || "Unknown date",
    title: result.title,
    url: result.link,
    snippet: result.snippet,
  }));
}

/**
 * Executes URL scraping and returns formatted results
 */
async function scrapeUrl(urls: string[]) {
  const { results } = await scrapePages(urls);
  return results.map((result) => ({
    url: result.url,
    result: result.markdown || result.error || "No content available",
  }));
}

/**
 * Runs the agent loop to answer a user's question
 */
export async function runAgentLoop(userQuestion: string): Promise<StreamTextResult<{}, string>> {
  // A persistent container for the state of our system
  const ctx = new SystemContext(userQuestion);

  // A loop that continues until we have an answer
  // or we've taken 10 actions
  while (!ctx.shouldStop()) {
    // We choose the next action based on the state of our system
    const nextAction = await getNextAction(ctx);

    // We execute the action and update the state of our system
    if (nextAction.type === "search") {
      const results = await searchWeb(nextAction.query);
      ctx.reportQueries([{ query: nextAction.query, results }]);
    } else if (nextAction.type === "scrape") {
      const results = await scrapeUrl(nextAction.urls);
      ctx.reportScrapes(results);
    } else if (nextAction.type === "answer") {
      return answerQuestion(ctx);
    }

    // We increment the step counter
    ctx.incrementStep();
  }

  // If we've taken 10 actions and still don't have an answer,
  // we ask the LLM to give its best attempt at an answer
  return answerQuestion(ctx, { isFinal: true });
} 