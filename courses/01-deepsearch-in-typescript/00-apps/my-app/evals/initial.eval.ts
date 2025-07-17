import { evalite } from "evalite";
import { askDeepSearch } from "~/deep-search";
import type { Message } from "ai";

/**
 * Evalite test for Deep Search LLM agent.
 * Each test case provides a Message[] as input and expects a string response.
 */
evalite("Deep Search Eval", {
  data: async (): Promise<{ input: Message[] }[]> => {
    return [
      {
        input: [
          {
            id: "1",
            role: "user",
            content: "What is the latest version of TypeScript?",
          },
        ],
      },
      {
        input: [
          {
            id: "2",
            role: "user",
            content: "What are the main features of Next.js 15?",
          },
        ],
      },
      {
        input: [
          {
            id: "3",
            role: "user",
            content: "Who won the Turing Award in 2023?",
          },
        ],
      },
      {
        input: [
          {
            id: "4",
            role: "user",
            content: "List three popular JavaScript frameworks released after 2020.",
          },
        ],
      },
      {
        input: [
          {
            id: "5",
            role: "user",
            content: "Summarize the latest research on quantum computing breakthroughs.",
          },
        ],
      },
    ];
  },
  task: async (input) => {
    return askDeepSearch(input);
  },
  scorers: [
    {
      name: "Contains Links",
      description:
        "Checks if the output contains any markdown links.",
      scorer: ({ output }) => {
        // Regex for markdown links: [text](url)
        const markdownLinkRegex = /\[[^\]]+\]\([^\)]+\)/g;
        const containsLinks = typeof output === "string" && markdownLinkRegex.test(output);
        return containsLinks ? 1 : 0;
      },
    },
  ],
});