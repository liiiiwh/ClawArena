import { requireAdmin } from "@/lib/auth";
import {
  putProducts,
  putInsights,
  putScanLog,
  putNewsSources,
} from "@/lib/kv";

export const runtime = "edge";

/**
 * One-time data seeding endpoint.
 * Reads from static data files and writes them to KV.
 * POST /api/seed (requires admin auth)
 */
// Debug: detect how EdgeOne injects KV
export async function GET() {
  const checks: Record<string, unknown> = {
    // Check globalThis
    globalThis_CLAWARENA_KV: typeof (globalThis as any).CLAWARENA_KV,
    // Check process.env
    env_CLAWARENA_KV: typeof process.env.CLAWARENA_KV,
    env_CLAWARENA_KV_value: process.env.CLAWARENA_KV?.substring(0, 30),
    // Check if it's a direct global (declare const style)
    hasAdminKey: !!process.env.ADMIN_API_KEY,
  };

  // List all env vars that contain "KV" or "CLAW"
  const kvEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.toUpperCase().includes("KV") || key.toUpperCase().includes("CLAW")) {
      kvEnvVars[key] = typeof value === "string" ? value.substring(0, 50) : String(value);
    }
  }
  checks.kvRelatedEnvVars = kvEnvVars;

  // Check all globalThis keys that might be KV
  const globalKeys: string[] = [];
  try {
    for (const key of Object.getOwnPropertyNames(globalThis)) {
      if (key.toUpperCase().includes("KV") || key.toUpperCase().includes("CLAW")) {
        globalKeys.push(key);
      }
    }
  } catch {}
  checks.kvRelatedGlobals = globalKeys;

  return Response.json(checks);
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
