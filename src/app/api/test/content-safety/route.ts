import { NextRequest, NextResponse } from "next/server";
import { isHarmful } from "@/lib/safety";

/**
 * POST /api/content-safety-test
 * Body: { "text": "string to analyze" }
 * Returns the result of isHarmful() for the given text.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    console.log("body", body);
    console.log("text", text);

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Campo 'text' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }

    const result = await isHarmful(text);

    return NextResponse.json({
      text,
      harmful: result.harmful,
      reason: result.reason ?? null,
    });
  } catch (err) {
    console.error("Content Safety Test error:", err);
    return NextResponse.json(
      { error: "Erro interno ao analisar o texto." },
      { status: 500 }
    );
  }
}
