import { google } from "@ai-sdk/google";

/**
 * The primary LLM model used for this app. This model supports tool calling and is cost-effective.
 * You can change the model string to use a different version or provider if needed.
 *
 * @see https://ai.google.dev/gemini-api/docs/models/gemini
 */
export const model = google("gemini-2.0-flash-001"); 