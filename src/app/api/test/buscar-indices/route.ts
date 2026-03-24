import { NextResponse } from "next/server";
import {
  SearchIndexClient,
  AzureKeyCredential,
} from "@azure/search-documents";
import { config } from "@/lib/config";

/**
 * GET /api/test/buscar-indices
 * Returns all available indexes in the Azure AI Search service.
 */
export async function GET() {
  try {
    const indexClient = new SearchIndexClient(
      config.searchEndpoint,
      new AzureKeyCredential(config.searchKey)
    );

    const indices: { name: string; fields: string[] }[] = [];
    for await (const index of indexClient.listIndexes()) {
      indices.push({
        name: index.name,
        fields: index.fields.map((f) => f.name),
      });
    }

    return NextResponse.json({
      totalIndices: indices.length,
      indices,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar índices:", error);
    return NextResponse.json(
      { error: "Erro ao buscar índices." },
      { status: 500 }
    );
  }
}