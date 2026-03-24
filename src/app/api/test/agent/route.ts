import { NextRequest, NextResponse } from "next/server";
import { processQuery } from "@/lib/agent";

/**
 * POST /api/test/agent
 * Body: { "query": "...", "userId": "optional-user-id" }
 *
 * Executes the full governed RAG pipeline via processQuery()
 * and returns the GovernedResponse (response, sources, metrics, blocked status).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, userId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Campo 'query' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }

    const result = await processQuery(query, userId ?? "test-user");

    return NextResponse.json({
      query,
      userId: userId ?? "test-user",
      ...result,
    });
  } catch (err) {
    console.error("Agent Test error:", err);
    return NextResponse.json(
      { error: "Erro interno ao testar processQuery." },
      { status: 500 }
    );
  }
}