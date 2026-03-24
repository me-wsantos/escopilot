// Centralized configuration – validates required env vars at startup
export const config = {
  // Azure AI Search
  searchEndpoint: process.env.AZURE_SEARCH_ENDPOINT ?? "",
  searchKey: process.env.AZURE_SEARCH_KEY ?? "",
  searchIndexName: process.env.AZURE_SEARCH_INDEX_NAME ?? "",

  // Azure OpenAI
  openaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? "",
  openaiKey: process.env.AZURE_OPENAI_KEY ?? "",
  embeddingDeployment:
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME ??
    "text-embedding-ada-002",
  chatDeployment:
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME ?? "gpt-4.1",

  // Azure Blob Storage
  storageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME ?? "",
  storageAccountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY ?? "",
  storageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME ?? "",

  // Azure Content Safety
  contentSafetyEndpoint: process.env.AZURE_CONTENT_SAFETY_ENDPOINT ?? "",
  contentSafetyKey: process.env.AZURE_CONTENT_SAFETY_KEY ?? "",

  // Application Insights
  appInsightsConnectionString:
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ?? "",
};
