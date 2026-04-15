/**
 * Product scanner — uses Gemini 2.5 Pro + Google Search to:
 * 1. Check existing products for version updates (via GitHub API)
 * 2. Search the web for new AI agent products
 * 3. Generate intelligent daily insights
 */

import type {
  Product,
  VersionChange,
  NewsChange,
  NewProductFound,
  ScanEntry,
  Insight,
} from "@/types";
import { geminiSearch, parseJsonFromResponse } from "./gemini";

// ===== GitHub Release Checking (no Gemini needed) =====

async function checkGitHubRelease(
  repoUrl: string,
): Promise<{ tag: string; body: string; date: string } | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const apiUrl = `https://api.github.com/repos/${match[1]}/releases/latest`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "ClawArena/1.0 Scanner",
        Accept: "application/vnd.github.v3+json",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

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

function getCurrentVersion(product: Product): string | undefined {
  if (product.changelog && product.changelog.length > 0) {
    return product.changelog[0].version;
  }
  return undefined;
}

export async function checkProductUpdates(
  product: Product,
): Promise<{ versionChange?: VersionChange }> {
  const result: { versionChange?: VersionChange } = {};

  if (product.github) {
    const release = await checkGitHubRelease(product.github);
    if (release) {
      const currentVersion = getCurrentVersion(product);
      if (currentVersion && release.tag && release.tag !== currentVersion) {
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

// ===== Gemini-Powered Web Search for New Products =====

interface GeminiProductResult {
  name: string;
  company: string;
  description: string;
  website?: string;
  source: string;
}

interface GeminiNewsResult {
  productName: string;
  news: string;
  source: string;
}

/**
 * Use Gemini + Google Search to find new AI agent products.
 */
export async function searchNewProducts(
  existingNames: string[],
): Promise<NewProductFound[]> {
  const existingList = existingNames.slice(0, 50).join(", ");

  const prompt = `Search the web for NEW AI agent products, AI coding tools, or AI assistant platforms launched or announced in the last 7 days (April 2026).

I already track these products: ${existingList}

Find products that are NOT in my list above. Focus on:
- New AI agent/assistant products
- New AI coding tools or IDEs
- New enterprise AI agent platforms
- Significant new open-source AI agent frameworks

Return a JSON array (max 5 items) with these fields:
- name: product name
- company: company name
- description: 1-sentence description
- source: URL where you found this info

Only include products you are confident are real and recently launched. If you find nothing new, return an empty array [].
Return ONLY the JSON array, no other text.`;

  try {
    const { text, sources } = await geminiSearch(prompt);
    const results = parseJsonFromResponse<GeminiProductResult[]>(text);
    if (!results || !Array.isArray(results)) return [];

    return results
      .filter((r) => r.name && r.company)
      .map((r) => ({
        productId: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: r.name,
        source: r.source || sources[0] || "Gemini web search",
      }));
  } catch (error) {
    console.error("Gemini new product search failed:", error);
    return [];
  }
}

/**
 * Use Gemini + Google Search to find news about existing products.
 */
export async function searchProductNews(
  productNames: string[],
): Promise<NewsChange[]> {
  const namesList = productNames.slice(0, 30).join(", ");

  const prompt = `Search the web for the LATEST NEWS (last 7 days, April 2026) about these AI agent products: ${namesList}

Look for: version updates, funding rounds, major feature launches, acquisitions, partnerships.

Return a JSON array (max 10 items) with:
- productName: exact product name from my list
- news: 1-sentence summary of the news
- source: URL source

Only include verified, recent news. If nothing new, return [].
Return ONLY the JSON array.`;

  try {
    const { text, sources } = await geminiSearch(prompt);
    const results = parseJsonFromResponse<GeminiNewsResult[]>(text);
    if (!results || !Array.isArray(results)) return [];

    return results
      .filter((r) => r.productName && r.news)
      .map((r) => ({
        productId: r.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        news: r.news,
        source: r.source || sources[0] || "Gemini web search",
      }));
  } catch (error) {
    console.error("Gemini search for product news failed:", error);
    return [];
  }
}

// ===== Full Scan (GitHub + Gemini) =====

/**
 * Run a full scan: GitHub releases + Gemini web search.
 */
export async function runFullScan(
  products: Product[],
): Promise<ScanEntry> {
  const today = new Date().toISOString().split("T")[0];
  const versionChanges: VersionChange[] = [];
  const newsChanges: NewsChange[] = [];
  const newProducts: NewProductFound[] = [];
  const searchQueries: string[] = [];

  // 1. Check GitHub releases (parallel, batch of 10, no delays)
  const githubProducts = products.filter((p) => p.github);
  const batchSize = 10;

  for (let i = 0; i < githubProducts.length; i += batchSize) {
    const batch = githubProducts.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((p) => checkProductUpdates(p)),
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.versionChange) {
        versionChanges.push(result.value.versionChange);
      }
    }
  }
  searchQueries.push(
    `GitHub: checked ${githubProducts.length} repos for releases`,
  );

  // 2. Gemini: search for new products
  if (process.env.GEMINI_API_KEY) {
    try {
      const existingNames = products.map((p) => p.name);
      const found = await searchNewProducts(existingNames);
      newProducts.push(...found);
      searchQueries.push(
        `Gemini: searched for new AI agent products (found ${found.length})`,
      );
    } catch (error) {
      searchQueries.push(
        `Gemini: new product search failed — ${error instanceof Error ? error.message : "unknown"}`,
      );
    }

    // 3. Gemini: search for news about top products
    try {
      const topProducts = products
        .filter((p) => p.stars || p.category === "coding-agent")
        .slice(0, 20)
        .map((p) => p.name);
      const news = await searchProductNews(topProducts);
      newsChanges.push(...news);
      searchQueries.push(
        `Gemini: searched news for ${topProducts.length} products (found ${news.length})`,
      );
    } catch (error) {
      searchQueries.push(
        `Gemini: news search failed — ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  } else {
    searchQueries.push("Gemini: skipped (GEMINI_API_KEY not set)");
  }

  return {
    date: today,
    newProducts,
    versionChanges,
    priceChanges: [],
    newsChanges,
    searchQueries,
  };
}

// ===== Insight Generation (Gemini-Powered) =====

/**
 * Generate an intelligent daily insight using Gemini.
 */
export async function generateInsightFromScan(
  scan: ScanEntry,
): Promise<Insight | null> {
  const totalChanges =
    scan.newProducts.length +
    scan.versionChanges.length +
    scan.priceChanges.length +
    scan.newsChanges.length;

  if (totalChanges === 0) return null;

  // Build a summary of changes for Gemini to analyze
  const changeSummary = [];
  for (const np of scan.newProducts) {
    changeSummary.push(`New product: ${np.name} (source: ${np.source})`);
  }
  for (const vc of scan.versionChanges) {
    changeSummary.push(
      `Version update: ${vc.productId} ${vc.oldVersion ?? "?"} → ${vc.newVersion}: ${vc.highlights.join(", ")}`,
    );
  }
  for (const nc of scan.newsChanges) {
    changeSummary.push(`News: ${nc.productId} — ${nc.news}`);
  }

  // Try Gemini for smart insight, fall back to basic
  try {
    const prompt = `Based on today's AI agent ecosystem scan results, write a brief analysis.

Today's changes:
${changeSummary.join("\n")}

Return JSON with:
{
  "title_en": "Short title in English (max 80 chars)",
  "title_zh": "标题中文翻译",
  "summary_en": "2-3 sentence analysis in English. Note any trends.",
  "summary_zh": "分析内容中文翻译"
}

Be factual and concise. Only reference the data above. Return ONLY the JSON.`;

    const { text } = await geminiSearch(prompt);
    const parsed = parseJsonFromResponse<{
      title_en: string;
      title_zh: string;
      summary_en: string;
      summary_zh: string;
    }>(text);

    if (parsed) {
      return buildInsight(scan, {
        title: { en: parsed.title_en, zh: parsed.title_zh },
        summary: { en: parsed.summary_en, zh: parsed.summary_zh },
      });
    }
  } catch {
    // Fall back to basic insight
  }

  // Fallback: basic insight without Gemini
  return buildInsight(scan, null);
}

function buildInsight(
  scan: ScanEntry,
  geminiContent: {
    title: { en: string; zh: string };
    summary: { en: string; zh: string };
  } | null,
): Insight {
  const totalChanges =
    scan.newProducts.length +
    scan.versionChanges.length +
    scan.newsChanges.length;

  const dateStr = new Date(scan.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const observations: Insight["observations"] = [];

  for (const np of scan.newProducts) {
    observations.push({
      fact: {
        en: `New product discovered: ${np.name}`,
        zh: `发现新产品：${np.name}`,
      },
      source: np.source,
      type: "new-product",
    });
  }

  for (const vc of scan.versionChanges) {
    observations.push({
      fact: {
        en: `${vc.productId} updated from ${vc.oldVersion ?? "unknown"} to ${vc.newVersion}: ${vc.highlights.join(", ")}`,
        zh: `${vc.productId} 从 ${vc.oldVersion ?? "未知"} 更新到 ${vc.newVersion}：${vc.highlights.join("、")}`,
      },
      source: vc.source,
      type: "version-update",
    });
  }

  for (const nc of scan.newsChanges) {
    observations.push({
      fact: {
        en: `${nc.productId}: ${nc.news}`,
        zh: `${nc.productId}：${nc.news}`,
      },
      source: nc.source,
      type: "news",
    });
  }

  return {
    id: scan.date,
    date: dateStr,
    title: geminiContent?.title ?? {
      en: `Daily Scan: ${totalChanges} Change${totalChanges > 1 ? "s" : ""} Detected`,
      zh: `每日扫描：检测到 ${totalChanges} 项变更`,
    },
    summary: geminiContent?.summary ?? {
      en: `Automated scan detected ${scan.versionChanges.length} version updates, ${scan.newsChanges.length} news changes, and ${scan.newProducts.length} new products.`,
      zh: `自动扫描检测到 ${scan.versionChanges.length} 个版本更新、${scan.newsChanges.length} 条新闻变更、${scan.newProducts.length} 个新产品。`,
    },
    observations,
    hotProducts: [
      ...scan.newProducts.map((n) => n.productId),
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
