import { requireAdmin } from "@/lib/auth";
import {
  putProducts,
  putInsights,
  putScanLog,
  putNewsSources,
} from "@/lib/kv";

// Use node runtime for seed (needs access to static data files + env vars)
// export const runtime = "edge";

/**
 * One-time data seeding endpoint.
 * Reads from static data files and writes them to KV.
 * POST /api/seed (requires admin auth)
 */
// Debug: check if env vars are available
export async function GET() {
  return Response.json({
    hasAdminKey: !!process.env.ADMIN_API_KEY,
    adminKeyLength: process.env.ADMIN_API_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  });
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const results: Record<string, string> = {};

    // Seed products
    const { products } = await import("@/data/products");
    await putProducts(products);
    results.products = `${products.length} products seeded`;

    // Seed insights
    const { insights } = await import("@/data/insights");
    await putInsights(insights);
    results.insights = `${insights.length} insights seeded`;

    // Seed scan log
    const { scanLog } = await import("@/data/scan-log");
    await putScanLog(scanLog);
    results.scanLog = `${scanLog.length} scan entries seeded`;

    // Seed news sources
    const { newsSources } = await import("@/data/news-sources");
    await putNewsSources(newsSources);
    results.newsSources = `${newsSources.length} news sources seeded`;

    return Response.json({
      success: true,
      results,
      seededAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to seed data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
