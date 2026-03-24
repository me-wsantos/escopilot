import { NextRequest, NextResponse } from "next/server";
import { retrieveDocuments } from "@/lib/search";
import {
  SearchIndexClient,
  AzureKeyCredential,
} from "@azure/search-documents";
import { config } from "@/lib/config";

/**
 * GET /api/test/search
 * Returns the index schema (field names, types, and attributes).
 */
export async function GET() {
  try {
    const indexClient = new SearchIndexClient(
      config.searchEndpoint,
      new AzureKeyCredential(config.searchKey)
    );

    const index = await indexClient.getIndex(config.searchIndexName);

    const fields = index.fields.map((f) => {
      const field = f as unknown as Record<string, unknown>;
      return {
        title: field.title,
        chunk: field.chunk,
        text_vector: field.text_vector,
      };
    });

    return NextResponse.json({
      indexName: index.name,
      totalFields: fields.length,
      fields,
    });
  } catch (err) {
    console.error("Index schema inspection error:", err);
    return NextResponse.json(
      { error: "Erro ao inspecionar o schema do índice." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/search
 * Body: { "text": "query string", "topK": 5 }
 * Returns the result of retrieveDocuments() for the given query.
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

    const results = await retrieveDocuments(text, topK ?? 5);

    return NextResponse.json({
      query: text,
      totalResults: results.length,
      results,
    });
  } catch (err) {
    console.error("Search Test error:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar documentos." },
      { status: 500 }
    );
  }
}