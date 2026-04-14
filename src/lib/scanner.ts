/**
 * Product scanner — checks product websites and GitHub for updates.
 * Used by the daily cron job to detect version changes, news, etc.
 */

import type {
  Product,
  VersionChange,
  NewsChange,
  ScanEntry,
  Insight,
} from "@/types";

/**
 * Check a GitHub repository for the latest release version.
 * Returns the tag name (e.g., "v2.1.91") or null if unavailable.
 */
async function checkGitHubRelease(
  repoUrl: string,
): Promise<{ tag: string; body: string; date: string } | null> {
  try {
    // Extract owner/repo from URL like "https://github.com/owner/repo"
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const apiUrl = `https://api.github.com/repos/${match[1]}/releases/latest`;
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "ClawArena/1.0 Scanner",
        Accept: "application/vnd.github.v3+json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      tag_name: string;
      body: string;
      published_at: string;
    };
    return {
      tag: data.tag_name,
      body: (data.body ?? "").slice(0, 500),
      date: data.published_at,
    };
  } catch {
    return null;
  }
}

/**
 * Extract version-like strings from a product's changelog or GitHub releases.
 */
function getCurrentVersion(product: Product): string | undefined {
  if (product.changelog && product.changelog.length > 0) {
    return product.changelog[0].version;
  }
  return undefined;
}

/**
 * Check a single product for updates.
 */
export async function checkProductUpdates(
  product: Product,
): Promise<{
  versionChange?: VersionChange;
  newsChange?: NewsChange;
}> {
  const result: {
    versionChange?: VersionChange;
    newsChange?: NewsChange;
  } = {};

  // Check GitHub releases if the product has a GitHub URL
  if (product.github) {
    const release = await checkGitHubRelease(product.github);
    if (release) {
      const currentVersion = getCurrentVersion(product);
      if (currentVersion && release.tag !== currentVersion) {
        // Extract highlights from release body
        const highlights = release.body
          .split("\n")
          .filter((line) => line.startsWith("- ") || line.startsWith("* "))
          .map((line) => line.replace(/^[-*]\s*/, "").trim())
          .filter((line) => line.length > 0)
          .slice(0, 5);

        result.versionChange = {
          productId: product.id,
          oldVersion: currentVersion,
          newVersion: release.tag,
          highlights:
            highlights.length > 0
              ? highlights
              : [`Updated to ${release.tag}`],
          source: `${product.github}/releases/tag/${release.tag}`,
        };
      }
    }
  }

  return result;
}

/**
 * Run a full scan across all products.
 */
export async function runFullScan(
  products: Product[],
): Promise<ScanEntry> {
  const today = new Date().toISOString().split("T")[0];

  const versionChanges: VersionChange[] = [];
  const newsChanges: NewsChange[] = [];

  // Check products with GitHub URLs (parallel, batch of 5 to avoid rate limits)
  const githubProducts = products.filter((p) => p.github);
  const batchSize = 5;

  for (let i = 0; i < githubProducts.length; i += batchSize) {
    const batch = githubProducts.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((p) => checkProductUpdates(p)),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.versionChange) {
          versionChanges.push(result.value.versionChange);
        }
        if (result.value.newsChange) {
          newsChanges.push(result.value.newsChange);
        }
      }
    }

    // Small delay between batches to be respectful of rate limits
    if (i + batchSize < githubProducts.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return {
    date: today,
    newProducts: [],
    versionChanges,
    priceChanges: [],
    newsChanges,
    searchQueries: [
      `Automated scan: checked ${githubProducts.length} GitHub repos for releases`,
    ],
  };
}

/**
 * Generate an Insight entry from a scan result.
 */
export function generateInsightFromScan(scan: ScanEntry): Insight | null {
  const totalChanges =
    scan.newProducts.length +
    scan.versionChanges.length +
    scan.priceChanges.length +
    scan.newsChanges.length;

  if (totalChanges === 0) return null;

  const observations: Insight["observations"] = [];

  // Add version change observations
  for (const vc of scan.versionChanges) {
    observations.push({
      fact: {
        en: `${vc.productId} updated from ${vc.oldVersion ?? "unknown"} to ${vc.newVersion}: ${vc.highlights.join(", ")}`,
        zh: `${vc.productId} \u4ece ${vc.oldVersion ?? "\u672a\u77e5"} \u66f4\u65b0\u5230 ${vc.newVersion}\uff1a${vc.highlights.join("\u3001")}`,
      },
      source: vc.source,
      type: "version-update",
    });
  }

  // Add news change observations
  for (const nc of scan.newsChanges) {
    observations.push({
      fact: {
        en: `${nc.productId}: ${nc.news}`,
        zh: `${nc.productId}\uff1a${nc.news}`,
      },
      source: nc.source,
      type: "news",
    });
  }

  // Add new product observations
  for (const np of scan.newProducts) {
    observations.push({
      fact: {
        en: `New product discovered: ${np.name}`,
        zh: `\u53d1\u73b0\u65b0\u4ea7\u54c1\uff1a${np.name}`,
      },
      source: np.source,
      type: "new-product",
    });
  }

  const dateStr = new Date(scan.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: scan.date,
    date: dateStr,
    title: {
      en: `Daily Scan: ${totalChanges} Change${totalChanges > 1 ? "s" : ""} Detected`,
      zh: `\u6bcf\u65e5\u626b\u63cf\uff1a\u68c0\u6d4b\u5230 ${totalChanges} \u9879\u53d8\u66f4`,
    },
    summary: {
      en: `Automated scan detected ${scan.versionChanges.length} version updates, ${scan.newsChanges.length} news changes, and ${scan.newProducts.length} new products.`,
      zh: `\u81ea\u52a8\u626b\u63cf\u68c0\u6d4b\u5230 ${scan.versionChanges.length} \u4e2a\u7248\u672c\u66f4\u65b0\u3001${scan.newsChanges.length} \u6761\u65b0\u95fb\u53d8\u66f4\u3001${scan.newProducts.length} \u4e2a\u65b0\u4ea7\u54c1\u3002`,
    },
    observations,
    hotProducts: [
      ...scan.versionChanges.map((v) => v.productId),
      ...scan.newsChanges.map((n) => n.productId),
    ],
    tags: ["automated-scan", scan.date],
  };
}

/**
 * Apply scan results to products — update versions, changelogs, lastUpdate.
 */
export function applyUpdatesToProducts(
  products: Product[],
  scan: ScanEntry,
): Product[] {
  const updated = [...products];

  for (const vc of scan.versionChanges) {
    const idx = updated.findIndex((p) => p.id === vc.productId);
    if (idx < 0) continue;

    const product = { ...updated[idx] };
    // Add to changelog
    const newEntry = {
      version: vc.newVersion,
      date: scan.date,
      highlights: vc.highlights,
    };
    product.changelog = [newEntry, ...(product.changelog ?? [])];
    product.lastUpdate = new Date(scan.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    updated[idx] = product;
  }

  for (const nc of scan.newsChanges) {
    const idx = updated.findIndex((p) => p.id === nc.productId);
    if (idx < 0) continue;

    const product = { ...updated[idx] };
    product.latestNews = nc.news;
    updated[idx] = product;
  }

  return updated;
}
