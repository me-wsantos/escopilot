import { NextRequest, NextResponse } from "next/server";
import { calculateRAGMetrics } from "@/lib/metrics";

/**
 * POST /api/test/metrics
 * Body: { "query": "...", "context": "...", "response": "..." }
 *
 * Calls calculateRAGMetrics() with the provided inputs
 * and returns the faithfulness, answerRelevance, and contextPrecision scores.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, response } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Campo 'query' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }
    if (typeof context !== "string") {
      return NextResponse.json(
        { error: "Campo 'context' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }
    if (!response || typeof response !== "string") {
      return NextResponse.json(
        { error: "Campo 'response' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }

    const metrics = await calculateRAGMetrics(query, context, response);

    return NextResponse.json({
      query,
      context,
      response,
      metrics,
    });
  } catch (err) {
    console.error("Metrics Test error:", err);
    return NextResponse.json(
      { error: "Erro interno ao testar calculateRAGMetrics." },
      { status: 500 }
    );
  }
}