import { NextRequest, NextResponse } from "next/server";
import { retrieveDocuments } from "@/lib/search";
import { buildSources } from "@/lib/sources";

/**
 * POST /api/test/sources
 * Body: { "text": "query string", "topK": 5 }
 * 1. Retrieves search chunks via retrieveDocuments()
 * 2. Converts them into Source objects (with SAS URLs) via buildSources()
 * 3. Returns both raw chunks and the built sources for comparison
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, topK } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Campo 'text' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }

    const chunks = await retrieveDocuments(text, topK ?? 5);
    const sources = buildSources(chunks);

    return NextResponse.json({
      query: text,
      totalChunks: chunks.length,
      totalSources: sources.length,
      chunks,
      sources,
    });
  } catch (err) {
    console.error("Sources Test error:", err);
    return NextResponse.json(
      { error: "Erro interno ao testar buildSources." },
      { status: 500 }
    );
  }
}