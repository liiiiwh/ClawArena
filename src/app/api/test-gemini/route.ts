import { geminiSearch, parseJsonFromResponse } from "@/lib/gemini";
import { searchProductsAndNews } from "@/lib/scanner";
import { getProducts } from "@/lib/kv";

/**
 * Test endpoint — simulates the full Gemini search pipeline.
 * GET /api/test-gemini         — basic test
 * GET /api/test-gemini?full=1  — full product+news search
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const full = url.searchParams.get("full");

  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return Response.json({ error: "GEMINI_API_KEY not set" });
  }

  // Full search test
  if (full) {
    try {
      const products = await getProducts();
      const { found, news } = await searchProductsAndNews(products);
      return Response.json({
        success: true,
        newProducts: found,
        newsChanges: news,
      });
    } catch (error) {
      return Response.json({
        error: "Full search failed",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Basic test
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
    });
  }
}
