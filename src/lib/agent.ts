/**
 * Orchestrator – chains all phases into a single governed response
 */
import { retrieveDocuments } from "./search";
import { buildSources, Source } from "./sources";
import { calculateRAGMetrics, RAGMetrics } from "./metrics";
import { isHarmful } from "./safety";
import { trackInteraction, trackException } from "./audit";
import { getOpenAIClient } from "./openai-client";
import { config } from "./config";

export interface GovernedResponse {
  response: string;
  sources: Source[];
  metrics: RAGMetrics;
  blocked: boolean;
  blockReason?: string;
  data?: any;
}

const SYSTEM_PROMPT = `Você é o EscoPilot, um assistente corporativo de IA. Responda APENAS com base no contexto fornecido.
Se a resposta não estiver no contexto, diga claramente que não possui informações suficientes nos documentos disponíveis.
Sempre cite as fontes relevantes na sua resposta.
Responda em português do Brasil.`;

export async function processQuery(
  query: string,
  userId = "anonymous"
): Promise<GovernedResponse> {
  const startTime = Date.now();

  try {
    // ── Phase 4a: Input safety check ──
    const inputCheck = await isHarmful(query);
    if (inputCheck.harmful) {
      const result: GovernedResponse = {
        response:
          "Sua pergunta contém conteúdo que viola nossas políticas de segurança e não pode ser processada.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: true,
        blockReason: `Input Harmful: ${inputCheck.reason}`,
      };
      //logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    }

    // ── Phase 1: Retrieve documents ──
    const chunks = await retrieveDocuments(query);

    // ── Phase 2: Build sources with SAS URLs ──
    const sources = buildSources(chunks);
    const context = chunks.map((c) => c.content).join("\n\n");

    // ── LLM generation ──
    const openai = getOpenAIClient();
    const chatResult = await openai.chat.completions.create({
      model: config.chatDeployment,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexto:\n${context || "(Nenhum documento relevante encontrado)"}\n\nPergunta: ${query}`,
        },
      ],
    });


    /* const answer =
      chatResult.choices[0]?.message?.content ??
      "Não foi possível gerar uma resposta."; */

    const result: GovernedResponse = {
      response:
        "Teste OK",
      sources: [],
      metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
      blocked: false,
      blockReason: `Input Harmful: ${inputCheck.reason}`,
      data: chatResult,
    };

    return result;


    // ── Phase 4b: Output safety check ──
    //const outputCheck = await isHarmful(answer);

    /* if (outputCheck.harmful) {
      const result: GovernedResponse = {
        response:
          "A resposta gerada contém conteúdo que viola nossas políticas de segurança e foi bloqueada.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: true,
        blockReason: `Output Harmful: ${outputCheck.reason}`,
      };
      logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    } */

    // ── Phase 3: Calculate RAG metrics ──
    //const metrics = await calculateRAGMetrics(query, context, answer);

    // ── Governance: block low-faithfulness with existing sources ──
    /* if (metrics.faithfulness < 0.5 && sources.length > 0) {
      const result: GovernedResponse = {
        response:
          "Não foi possível fundamentar a resposta com alta confiança nos documentos disponíveis. Por favor, reformule sua pergunta ou consulte um especialista.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: false,
        blockReason: "Low Faithfulness",
      };
      logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    } */

    /* const result: GovernedResponse = {
      response: answer,
      sources,
      metrics,
      blocked: false,
    }; */

    //logInteraction(result, query, userId, Date.now() - startTime);

    //return result;

  } catch (error) {
    console.error("processQuery INTERNAL ERROR:", error);
    trackException(error instanceof Error ? error : new Error(String(error)), {
      query,
      userId,
    });
    return {
      response: "Ocorreu um erro inesperado ao processar sua solicitação.",
      sources: [],
      metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
      blocked: true,
      blockReason: "Internal Error",
    };
  }
}

/* function logInteraction(
  result: GovernedResponse,
  query: string,
  userId: string,
  durationMs: number
) {
  trackInteraction({
    userId,
    query,
    response: result.response,
    blocked: result.blocked,
    blockReason: result.blockReason,
    faithfulness: result.metrics.faithfulness,
    answerRelevance: result.metrics.answerRelevance,
    contextPrecision: result.metrics.contextPrecision,
    sources: JSON.stringify(
      result.sources.map((s) => ({
        title: s.title,
        page: s.page,
        url: s.url,
      }))
    ),
    durationMs,
  });
} */
