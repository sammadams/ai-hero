import { createScorer } from "evalite";
import { generateObject } from "ai";
import { z } from "zod";
import { factualityModel } from "~/models";

/**
 * Evaluates the factuality of a response by comparing it to ground truth.
 * Uses an LLM as a judge to determine accuracy.
 */
export const checkFactuality = async (opts: {
  question: string;
  groundTruth: string;
  submission: string;
}) => {
  const { object } = await generateObject({
    model: factualityModel,
    /**
     * Prompt taken from autoevals:
     *
     * {@link https://github.com/braintrustdata/autoevals/blob/5aa20a0a9eb8fc9e07e9e5722ebf71c68d082f32/templates/factuality.yaml}
     */
    prompt: `
      You are a meticulous AI evaluator. Your primary task is to compare the factual information in a [Submission] to a trusted [Expert] answer, in the context of a given [Question].

      Your evaluation must be strictly focused on factuality and completeness. Ignore all differences in style, grammar, punctuation, or phrasing.

      [BEGIN DATA]
      ************
      [Question]: ${opts.question}
      ************
      [Expert]: ${opts.groundTruth}
      ************
      [Submission]: ${opts.submission}
      ************
      [END DATA]

      First, provide a step-by-step rationale for your decision by following these steps:
      1.  **Expert Facts:** Briefly list the core factual claims from the [Expert] answer.
      2.  **Submission Analysis:** Analyze the [Submission]. Identify its factual claims, but **explicitly disregard any information that merely repeats or rephrases the [Question]**. List only the facts intended as the answer.
      3.  **Comparison:** Compare the filtered submission facts (from Step 2) to the expert facts (from Step 1). Note any overlaps, omissions, additions, or contradictions.
      4.  **Conclusion:** State which category best describes the submission based on your comparison.

      After providing your rationale, answer by selecting **one** of the following options:

      (A) **Equivalent:** The submission contains the exact same set of facts as the expert answer.
      (B) **Subset:** The submission is factually correct but is less complete than the expert answer (i.e., it omits one or more facts).
      (C) **Superset:** The submission contains all facts from the expert answer AND includes additional, relevant, and correct facts that were not in the question.
      (D) **Conflict:** The submission contains at least one factual claim that directly contradicts the expert answer.
      (E) **Irrelevant / No Overlap:** The submission's claims are factually unrelated to the expert answer or fail to address the question.
    `,
    schema: z.object({
      answer: z
        .enum(["A", "B", "C", "D", "E"])
        .describe("Your selection."),
      rationale: z
        .string()
        .describe(
          "Why you chose this answer. Be very detailed.",
        ),
    }),
  });

  /**
   * LLM's are well documented at being poor at generating
   */
  const scores = {
    A: 1,
    B: 0.4,
    C: 0.8,
    D: 0.3,
    E: 0,
  };

  return {
    score: scores[object.answer],
    metadata: {
      rationale: object.rationale,
    },
  };
};

/**
 * Factuality scorer that can be used in Evalite evaluations.
 * Compares the output against expected ground truth.
 */
export const Factuality = createScorer<
  string,
  string,
  string
>({
  name: "Factuality",
  scorer: async ({ input, expected, output }) => {
    return checkFactuality({
      question: input,
      groundTruth: expected!,
      submission: output,
    });
  },
}); 