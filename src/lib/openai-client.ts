/**
 * Shared OpenAI client configured for Azure OpenAI
 */
import OpenAI from "openai";
import { config } from "./config";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: config.openaiKey,
      baseURL: `${config.openaiEndpoint.replace(/\/$/, "")}/openai/deployments`,
      defaultQuery: { "api-version": "2024-06-01" },
      defaultHeaders: { "api-key": config.openaiKey },
    });
  }
  return _client;
}
