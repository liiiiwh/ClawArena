import { geminiSearch, parseJsonFromResponse } from "@/lib/gemini";

/**
 * Test endpoint to verify Gemini API works from Cloud Function.
 * GET /api/test-gemini
 */
export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyPrefix = process.env.GEMINI_API_KEY?.slice(0, 10) ?? "NOT SET";

  if (!hasKey) {
    return Response.json({ error: "GEMINI_API_KEY not set", keyPrefix });
  }

  try {
    const { text, sources } = await geminiSearch(
      "List 2 AI agent products launched in April 2026. Return JSON array: [{name, company}]. Only JSON, no other text.",
    );

    const parsed = parseJsonFromResponse<{ name: string; company: string }[]>(text);

    return Response.json({
      success: true,
      rawTextPreview: text.slice(0, 500),
      parsed,
      parseSuccess: !!parsed,
      sourcesCount: sources.length,
    });
  } catch (error) {
    return Response.json({
      error: "Gemini call failed",
      detail: error instanceof Error ? error.message : String(error),
      keyPrefix,
    });
  }
}
