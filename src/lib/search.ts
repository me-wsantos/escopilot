/**
 * Phase 1 – Azure AI Search integration (hybrid + semantic search)
 */
import {
  SearchClient,
  AzureKeyCredential,
} from "@azure/search-documents";
import { config } from "./config";
import { getOpenAIClient } from "./openai-client";

// ---- types ----
export interface SearchChunk {
  title: string;
  content: string;
  pageNumber: number;
  chunkId: string;
  score: number;
}

// ---- search client (singleton) ----
let _searchClient: SearchClient<Record<string, unknown>> | null = null;

function getSearchClient() {
  if (!_searchClient) {
    _searchClient = new SearchClient<Record<string, unknown>>(
      config.searchEndpoint,
      config.searchIndexName,
      new AzureKeyCredential(config.searchKey)
    );
  }
  return _searchClient;
}

// ---- embeddings ----
async function generateEmbeddings(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const result = await openai.embeddings.create({
    model: config.embeddingDeployment,
    input: text,
  });
  return result.data[0].embedding;
}

// ---- retrieve documents ----
export async function retrieveDocuments(
  query: string,
  topK = 5
): Promise<SearchChunk[]> {
  const client = getSearchClient();

  let queryVector: number[] | undefined;
  try {
    queryVector = await generateEmbeddings(query);
  } catch {
    // If embeddings fail, fall back to text-only search
    console.warn("Embedding generation failed, using text-only search");
  }

  const searchOptions: Record<string, unknown> = {
    top: topK,
    queryType: "semantic" as const,
    semanticSearchOptions: {
      configurationName: "escopilot-search-data-semantic-configuration",
    },
    select: ["id", "title", "content", "page_number", "chunk", "chunk_id"],
  };

  if (queryVector) {
    searchOptions.vectorSearchOptions = {
      queries: [
        {
          vector: queryVector,
          kNearestNeighborsCount: topK,
          fields: ["contentVector"],
          kind: "vector",
        },
      ],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchResults = await client.search(query, searchOptions as any);

  const results: SearchChunk[] = [];
  for await (const result of searchResults.results) {
    const doc = result.document as Record<string, unknown>;

    results.push({
      title: (doc.title as string) || "",
      content: (doc.chunk as string) || "",
      pageNumber: extractPageNumberFromChunkId((doc.chunk_id as string) || ""),
      chunkId: (doc.chunk_id as string) || "",
      score: result.score ?? 0,
    });
  }
  return results;
}

function extractPageNumberFromChunkId(chunkId: string): number {
  // Procura por "pages_X" no chunk_id
  const match = chunkId.match(/_pages_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
