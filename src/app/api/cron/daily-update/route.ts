import { requireCron } from "@/lib/auth";
import {
  getProducts,
  putProducts,
  putNewsCache,
  getNewsSources,
  appendScanEntry,
  appendInsight,
  putCronStatus,
} from "@/lib/kv";
import { fetchAllFeeds } from "@/lib/rss";
import {
  runFullScan,
  generateInsightFromScan,
  applyUpdatesToProducts,
} from "@/lib/scanner";

// export const runtime = "edge";

/**
 * Daily update endpoint triggered by EdgeOne Cron.
 * Performs:
 * 1. Refresh RSS news cache
 * 2. Scan products for version/news changes
 * 3. Generate scan log entry
 * 4. Generate daily insight
 * 5. Update product data
 */
export async function GET(request: Request) {
  // Allow both cron auth and admin auth
  const authError = requireCron(request);
  if (authError) return authError;

  const startTime = Date.now();

  try {
    const results: string[] = [];

    // 1. Refresh RSS news cache
    const sources = await getNewsSources();
    const newsItems = await fetchAllFeeds(sources);
    await putNewsCache(newsItems);
    results.push(`RSS: ${newsItems.length} news items cached`);

    // 2. Scan products for updates
    const products = await getProducts();
    const scanEntry = await runFullScan(products);
    results.push(
      `Scan: ${scanEntry.versionChanges.length} version changes, ${scanEntry.newsChanges.length} news changes`,
    );

    // 3. Save scan log
    await appendScanEntry(scanEntry);
    results.push(`Scan log saved for ${scanEntry.date}`);

    // 4. Generate insight if there are changes
    const insight = generateInsightFromScan(scanEntry);
    if (insight) {
      await appendInsight(insight);
      results.push(`Insight generated: ${insight.title.en}`);
    } else {
      results.push("No changes detected, no insight generated");
    }

    // 5. Apply updates to products
    const totalChanges =
      scanEntry.versionChanges.length + scanEntry.newsChanges.length;
    if (totalChanges > 0) {
      const updatedProducts = applyUpdatesToProducts(products, scanEntry);
      await putProducts(updatedProducts);
      results.push(`Products updated: ${totalChanges} changes applied`);
    }

    const duration = Date.now() - startTime;

    // 6. Record cron status
    await putCronStatus({
      lastRun: new Date().toISOString(),
      status: "success",
      summary: results.join("; "),
      duration,
    });

    return Response.json({
      success: true,
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record error status
    try {
      await putCronStatus({
        lastRun: new Date().toISOString(),
        status: "error",
        summary: error instanceof Error ? error.message : "Unknown error",
        duration,
      });
    } catch {
      // Can't write to KV, ignore
    }

    return Response.json(
      {
        error: "Daily update failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      },
      { status: 500 },
    );
  }
}
