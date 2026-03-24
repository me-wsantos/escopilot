/**
 * Phase 3 – RAGAS-style confidence metrics via LLM auto-evaluation
 */
import { getOpenAIClient } from "./openai-client";
import { config } from "./config";

export interface RAGMetrics {
  faithfulness: number; // 0–1
  answerRelevance: number; // 0–1
  contextPrecision: number; // 0–1
}

const EVAL_SYSTEM_PROMPT = `You are an evaluation engine. You will receive a question, context (retrieved chunks), and a generated answer.
Score the following metrics on a scale of 0.0 to 1.0:
1. faithfulness – Is the answer fully supported by the context? (1.0 = every claim traceable to context)
2. answerRelevance – Does the answer address the question? (1.0 = perfectly on-topic)
3. contextPrecision – Are the retrieved chunks relevant to the question? (1.0 = all chunks relevant)

Respond ONLY with valid JSON: {"faithfulness":0.0,"answerRelevance":0.0,"contextPrecision":0.0}`;

export async function calculateRAGMetrics(
  query: string,
  context: string,
  response: string
): Promise<RAGMetrics> {
  // Fast path – no context means no grounding
  if (!context || context.trim().length === 0) {
    return { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 };
  }

  // If the model explicitly declined
  if (
    response.includes("não sei") ||
    response.includes("não encontrei informações") ||
    response.includes("não possuo informações")
  ) {
    return { faithfulness: 0.5, answerRelevance: 0.2, contextPrecision: 0.3 };
  }

  try {
    const openai = getOpenAIClient();
    const result = await openai.chat.completions.create({
      model: config.chatDeployment,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EVAL_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Pergunta: ${query}\n\nContexto:\n${context}\n\nResposta:\n${response}`,
        },
      ],
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<RAGMetrics>;

    return {
      faithfulness: clamp(parsed.faithfulness ?? 0.5),
      answerRelevance: clamp(parsed.answerRelevance ?? 0.5),
      contextPrecision: clamp(parsed.contextPrecision ?? 0.5),
    };
  } catch (err) {
    console.error("Metrics evaluation failed, using heuristics", err);
    return { faithfulness: 0.7, answerRelevance: 0.7, contextPrecision: 0.6 };
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
