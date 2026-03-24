/**
 * Phase 2 – SAS Token source citations (Azure Blob Storage)
 */
import {
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { config } from "./config";
import type { SearchChunk } from "./search";

export interface Source {
  title: string;
  page: number;
  chunkId: string;
  url: string;
  content: string;
}

function getSharedKeyCredential(): StorageSharedKeyCredential {
  return new StorageSharedKeyCredential(
    config.storageAccountName,
    config.storageAccountKey
  );
}

/**
 * Generates a time-limited SAS URL for a blob
 */
function generateSasUrl(
  blobName: string,
  expiryMinutes = 60
): string {
  const credential = getSharedKeyCredential();
  const startsOn = new Date();
  const expiresOn = new Date(
    startsOn.valueOf() + expiryMinutes * 60 * 1000
  );

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName: config.storageContainerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    credential
  );

  return `https://${config.storageAccountName}.blob.core.windows.net/${config.storageContainerName}/${blobName}?${sasParams.toString()}`;
}

/**
 * Converts search chunks into Source objects with SAS URLs
 */
export function buildSources(chunks: SearchChunk[]): Source[] {
  return chunks.map((chunk) => ({
    title: chunk.title,
    page: chunk.pageNumber,
    chunkId: chunk.chunkId,
    url: generateSasUrl(chunk.title),
    content: chunk.content,
  }));
}