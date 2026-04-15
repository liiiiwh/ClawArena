/**
 * Gemini API client with Google Search grounding.
 * Includes rate limiting and automatic retry with exponential backoff.
 *
 * Gemini 2.5 Flash free tier limits:
 *   RPM: 10 requests/minute
 *   TPM: 250,000 tokens/minute
 *   RPD: 500 requests/day
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// ===== Rate Limiter =====

const RATE_LIMIT = {
  maxRPM: 10, // Match free tier limit
  minIntervalMs: (60 / 10) * 1000, // 6s between requests
};

let lastRequestTime = 0;

/**
 * Wait if needed to stay under RPM limit.
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT.minIntervalMs) {
    const waitMs = RATE_LIMIT.minIntervalMs - elapsed;
    await new Promise((r) => setTimeout(r, waitMs));
  }
  lastRequestTime = Date.now();
}

// ===== Retry Logic =====

const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 3000, // 3s, 6s
  retryableStatusCodes: [429, 503, 500],
};

/**
 * Sleep for exponential backoff.
 */
function backoffDelay(attempt: number): Promise<void> {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return new Promise((r) => setTimeout(r, delay));
}

// ===== Gemini API =====

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text?: string }[];
    };
    groundingMetadata?: {
      groundingChunks?: { web?: { uri: string; title: string } }[];
      searchEntryPoint?: { renderedContent: string };
    };
  }[];
  error?: { message: string; code: number };
}

/**
 * Call Gemini with Google Search grounding, rate limiting, and auto-retry.
 */
export async function geminiSearch(
  prompt: string,
  apiKey?: string,
): Promise<{ text: string; sources: string[] }> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.1 },
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    // Rate limit: wait between requests
    await rateLimit();

    // Retry backoff (skip on first attempt)
    if (attempt > 0) {
      await backoffDelay(attempt - 1);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
        body: requestBody,
      });
      clearTimeout(timer);

      // Retryable error
      if (RETRY_CONFIG.retryableStatusCodes.includes(res.status)) {
        const errText = await res.text();
        lastError = new Error(
          `Gemini API ${res.status} (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}): ${errText.slice(0, 100)}`,
        );
        continue; // Retry
      }

      // Non-retryable error
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as GeminiResponse;

      if (data.error) {
        if (RETRY_CONFIG.retryableStatusCodes.includes(data.error.code)) {
          lastError = new Error(`Gemini error ${data.error.code}: ${data.error.message}`);
          continue; // Retry
        }
        throw new Error(`Gemini error: ${data.error.message}`);
      }

      // Success
      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      const sources =
        data.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((c) => c.web?.uri ?? "")
          .filter(Boolean) ?? [];

      return { text, sources };
    } catch (error) {
      clearTimeout(timer);

      // Abort/timeout errors are retryable
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error(`Gemini timeout (attempt ${attempt + 1})`);
        continue;
      }

      // Other fetch errors might be retryable
      if (error instanceof TypeError) {
        lastError = error;
        continue;
      }

      // Non-retryable error
      throw error;
    }
  }

  // All retries exhausted
  throw lastError ?? new Error("Gemini request failed after all retries");
}

/**
 * Parse a JSON code block from Gemini's response.
 */
export function parseJsonFromResponse<T>(text: string): T | null {
  try {
    // Try to extract JSON from code block
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    }
    // Try direct parse
    return JSON.parse(text.trim()) as T;
  } catch {
    return null;
  }
}
