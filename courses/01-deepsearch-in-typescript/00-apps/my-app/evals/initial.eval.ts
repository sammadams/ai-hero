import { evalite } from "evalite";
import { askDeepSearch } from "~/deep-search";
import type { Message } from "ai";
import { Factuality } from "./factuality-scorer";
import { AnswerRelevancy } from "./answer-relevancy-scorer";
import { devData } from "./dev";
import { ciData } from "./ci";
import { regressionData } from "./regression";
import { env } from "~/env";

/**
 * Evalite test for Deep Search LLM agent.
 * Each test case provides a question as input and expects a string response.
 * Dataset size is determined by the EVAL_DATASET environment variable.
 */
evalite("Deep Search Eval - Golf", {
  data: async (): Promise<
    { input: string; expected: string }[]
  > => {
    let data = [...devData];

    // If CI, add the CI data
    if (env.EVAL_DATASET === "ci") {
      data.push(...ciData);
    }
    // If Regression, add the regression data AND the CI data
    else if (env.EVAL_DATASET === "regression") {
      data.push(...ciData, ...regressionData);
    }

    return data;
  },
  task: async (input) => {
    // Convert the string input to a Message array for askDeepSearch
    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: input,
      },
    ];
    return askDeepSearch(messages);
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
    Factuality,
    AnswerRelevancy,
  ],
});