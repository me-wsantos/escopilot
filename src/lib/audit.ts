/**
 * Phase 5 – Audit Trail Logger (Application Insights)
 */
import { config } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appInsightsClient: any = null;

function getClient() {
  if (appInsightsClient) return appInsightsClient;
  if (!config.appInsightsConnectionString) return null;

  try {
    // Dynamic import to avoid issues in edge environments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appInsights = require("applicationinsights");
    appInsights
      .setup(config.appInsightsConnectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .start();

    appInsightsClient = appInsights.defaultClient;
    return appInsightsClient;
  } catch (err) {
    console.error("Application Insights setup failed:", err);
    return null;
  }
}

export interface AuditPayload {
  userId: string;
  query: string;
  response: string;
  blocked: boolean;
  blockReason?: string;
  faithfulness: number;
  answerRelevance: number;
  contextPrecision: number;
  sources: string; // JSON stringified
  durationMs: number;
}

export function trackInteraction(payload: AuditPayload) {
  const client = getClient();
  if (!client) return;

  try {
    client.trackEvent({
      name: "EscoPilotInteraction",
      properties: {
        userId: payload.userId,
        query: payload.query,
        response: payload.response,
        blocked: String(payload.blocked),
        blockReason: payload.blockReason ?? "",
        faithfulness: String(payload.faithfulness),
        answerRelevance: String(payload.answerRelevance),
        contextPrecision: String(payload.contextPrecision),
        sources: payload.sources,
        durationMs: String(payload.durationMs),
      },
    });
  } catch (err) {
    console.error("Audit tracking failed:", err);
  }
}

export function trackException(error: Error, properties?: Record<string, string>) {
  const client = getClient();
  if (!client) return;
  client.trackException({ exception: error, properties });
}
