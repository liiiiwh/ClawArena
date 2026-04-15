/**
 * Gemini API client with Google Search grounding.
 * Uses Gemini 2.5 Pro (free tier) to search the web and analyze results.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

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
 * Call Gemini with Google Search grounding enabled.
 */
export async function geminiSearch(
  prompt: string,
  apiKey?: string,
): Promise<{ text: string; sources: string[] }> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${key}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.1 },
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini error: ${data.error.message}`);
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";

    const sources =
      data.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c) => c.web?.uri ?? "")
        .filter(Boolean) ?? [];

    return { text, sources };
  } finally {
    clearTimeout(timer);
  }
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
