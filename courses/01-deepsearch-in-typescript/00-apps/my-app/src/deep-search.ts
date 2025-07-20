import { streamText, type Message, type TelemetrySettings, type StreamTextOnFinishCallback, type StreamTextResult } from "ai";
import { model } from "~/models";
import { runAgentLoop } from "./run-agent-loop";

/**
 * Calls the Deep Search LLM agent with the provided messages and options.
 * Uses the new agent loop approach instead of tool-based execution.
 */
export function streamFromDeepSearch(opts: {
  messages: Message[];
  onFinish?: StreamTextOnFinishCallback<{}>;
  telemetry?: TelemetrySettings;
}): Promise<StreamTextResult<{}, string>> {
  // Extract the user's question from the messages
  const userQuestion = opts.messages[opts.messages.length - 1]?.content || "";
  
  // Run the agent loop and return the result
  return runAgentLoop(userQuestion);
}

/**
 * Simple function for evaluation: takes messages, returns the LLM's text response.
 * Used in evals and tests.
 */
export async function askDeepSearch(messages: Message[]): Promise<string> {
  const result = await streamFromDeepSearch({
    messages,
    onFinish: undefined, // No-op for evals
    telemetry: { isEnabled: false },
  });
  await result.consumeStream();
  return await result.text;
} 