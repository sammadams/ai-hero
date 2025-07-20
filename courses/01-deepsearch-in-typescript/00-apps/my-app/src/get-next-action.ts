import { generateObject } from "ai";
import { z } from "zod";
import { model } from "~/models";
import type { SystemContext } from "./system-context";

/**
 * Action types for the agent loop
 */
export interface SearchAction {
  type: "search";
  query: string;
}

export interface ScrapeAction {
  type: "scrape";
  urls: string[];
}

export interface AnswerAction {
  type: "answer";
}

export type Action = SearchAction | ScrapeAction | AnswerAction;

/**
 * Zod schema for structured action output
 * Using a single object with optional fields instead of z.union for better LLM compatibility
 */
export const actionSchema = z.object({
  type: z
    .enum(["search", "scrape", "answer"])
    .describe(
      `The type of action to take.
      - 'search': Search the web for more information.
      - 'scrape': Scrape a URL.
      - 'answer': Answer the user's question and complete the loop.`,
    ),
  query: z
    .string()
    .describe(
      "The query to search for. Required if type is 'search'.",
    )
    .optional(),
  urls: z
    .array(z.string())
    .describe(
      "The URLs to scrape. Required if type is 'scrape'.",
    )
    .optional(),
});

/**
 * Determines the next action for the agent loop based on current context.
 * Uses structured outputs to ensure reliable action selection.
 */
export const getNextAction = async (
  context: SystemContext,
): Promise<Action> => {
  const result = await generateObject({
    model,
    schema: actionSchema,
    system: `
    You are an AI assistant with access to web search and scraping tools. Your job is to determine the next action to take based on the current context.

    You can perform three types of actions:

    1. **SEARCH**: Search the web for more information when you need to find additional facts, recent updates, or specific details that aren't in your current context.

    2. **SCRAPE**: Scrape specific URLs when you have found relevant pages but need to extract the full content to get complete information.

    3. **ANSWER**: Answer the user's question when you have gathered sufficient information to provide a comprehensive and accurate response.

    ## Decision Guidelines:

    - **Search** when:
    - You need more recent information
    - You're missing key facts or details
    - You need to verify information
    - You need to find specific examples or cases

    - **Scrape** when:
    - You have found relevant URLs in search results
    - You need the full content of a page
    - The search snippets aren't sufficient for your answer

    - **Answer** when:
    - You have comprehensive information to answer the question
    - You've gathered enough context from searches and scrapes
    - You can provide a complete and accurate response
    `,
    prompt: `
    ## Current Context:

    ${context.getStepInfo()}

    ${context.getContext()}

    Based on the current context, determine the next action. If you choose to search, provide a specific and targeted query. If you choose to scrape, provide the URLs you want to scrape. If you choose to answer, you're ready to provide the final response.
    `,
  });

  return result.object as Action;
}; 