/**
 * POST /api/chat – Unified EscoPilot endpoint
 */
import { NextRequest, NextResponse } from "next/server";
import { processQuery } from "@/lib/agent";

export const runtime = "nodejs"; // required for Azure SDKs

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body as { query?: string; userId?: string };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Campo 'query' é obrigatório." },
        { status: 400 }
      );
    }

    const result = await processQuery(query.trim(), userId ?? "anonymous");
    return NextResponse.json(result);
  } catch (error) {
    console.error("API /chat error:", error);
    return NextResponse.json(
      {
        response: "Erro interno do servidor.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: true,
        blockReason: "Internal Error",
      },
      { status: 500 }
    );
  }
}
