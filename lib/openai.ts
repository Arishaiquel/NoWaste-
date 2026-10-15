import OpenAI from "openai";

let client: OpenAI | undefined;
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  return client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
  });
}

export function openAIModel(): string {
  if (!process.env.OPENAI_MODEL) throw new Error("OPENAI_MODEL is not configured");
  return process.env.OPENAI_MODEL;
}
