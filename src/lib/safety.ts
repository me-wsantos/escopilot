/**
 * Phase 4 – Azure AI Content Safety (input/output moderation via REST API)
 */
import { config } from "./config";

interface ContentSafetyCategory {
  category: string;
  severity: number;
}

interface ContentSafetyResult {
  categoriesAnalysis: ContentSafetyCategory[];
}

/**
 * Calls Azure Content Safety REST API to analyze text
 */
async function analyzeText(text: string): Promise<ContentSafetyResult> {
  const url = `${config.contentSafetyEndpoint.replace(/\/$/, "")}/contentsafety/text:analyze?api-version=2024-09-01`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": config.contentSafetyKey,
    },
    body: JSON.stringify({
      text,
      categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
      outputType: "FourSeverityLevels",
    }),
  });

  if (!response.ok) {
    console.error("Content Safety API error:", response.status, await response.text());
    // Fail open — allow the request if the safety service is unavailable
    return { categoriesAnalysis: [] };
  }

  return (await response.json()) as ContentSafetyResult;
}

/**
 * Returns true if the text contains harmful content (severity >= 4)
 */
export async function isHarmful(text: string): Promise<{ harmful: boolean; reason?: string }> {
  try {
    const result = await analyzeText(text);
    const harmful = result.categoriesAnalysis?.find((c) => c.severity >= 4);
    if (harmful) {
      return { harmful: true, reason: `${harmful.category} (severity ${harmful.severity})` };
    }
    return { harmful: false };
  } catch (err) {
    console.error("Content Safety check failed:", err);
    return { harmful: false }; // fail open
  }
}
