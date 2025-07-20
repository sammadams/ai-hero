import { generateText } from "ai";
import { model } from "~/models";
import type { SystemContext } from "./system-context";

/**
 * Options for the answer question function
 */
interface AnswerQuestionOptions {
  isFinal?: boolean;
}

/**
 * Answers the user's question based on the gathered context
 */
export async function answerQuestion(
  context: SystemContext,
  userQuestion: string,
  options: AnswerQuestionOptions = {}
): Promise<string> {
  const { isFinal = false } = options;

  const systemPrompt = `You are a helpful AI assistant that answers questions based on the information gathered from web searches and page scraping.

You must provide accurate, well-sourced answers using the information available in the context. Always cite your sources using inline markdown links.

# Markdown Link Formatting Instructions
You must format all links as inline markdown links using the exact syntax: '[link text](URL)'

**Requirements:**
- Always use inline link format, never reference-style links
- Link text should be descriptive and meaningful
- URLs must be complete and functional
- No spaces between the closing bracket ']' and opening parenthesis '('
- Ensure proper escaping of special characters in URLs if needed

${isFinal ? `
**IMPORTANT**: You may not have all the information needed to provide a complete answer, but you should make your best effort based on the available information. Be transparent about any limitations or uncertainties in your response.
` : ''}

Please provide a comprehensive answer to the user's question based on the available information. Use the search and scrape history to support your response with proper citations.`;

const prompt = `
## Available Context:
${context.getContext()}

## User Question:
${userQuestion}
`;

  const result = await generateText({
    model,
    system: systemPrompt,
    prompt
  });

  return result.text;
} 