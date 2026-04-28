import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 1024;

export async function analyze(query: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: `You are MintAI's analysis service. Provide concise, structured insights for: ${query}`,
      },
    ],
  });
  return response.content;
}

export async function generate(prompt: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: `You are MintAI's content generation service. Produce high-quality content for: ${prompt}`,
      },
    ],
  });
  return response.content;
}

export async function predict(topic: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: `You are MintAI's market prediction service. Provide a forward-looking forecast and trend analysis for: ${topic}`,
      },
    ],
  });
  return response.content;
}

export async function chat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const systemPrompt =
    "You are MintAI, an autonomous AI agent that earns micropayments via the x402 protocol on Solana and persists its memory to Filecoin. " +
    "You have three paid capabilities: analyze ($0.01), generate ($0.005), and predict ($0.02). " +
    "Reply concisely and helpfully. When the user's request maps to one of those capabilities, mention which one you're using.";

  return anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ],
  });
}
