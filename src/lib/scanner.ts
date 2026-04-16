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

/**
 * Fetch GitHub repo star count.
 */
async function fetchGitHubStars(repoUrl: string): Promise<number | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const apiUrl = `https://api.github.com/repos/${match[1]}`;
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
    const data = (await res.json()) as { stargazers_count: number };
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

/**
 * Format star count as "347K+", "1.2M+", etc.
 */
function formatStars(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M+`;
  }
  if (count >= 1_000) {
    return `${Math.floor(count / 1_000)}K+`;
  }
  return `${count}`;
}

function getCurrentVersion(product: Product): string | undefined {
  if (product.changelog && product.changelog.length > 0) {
    return product.changelog[0].version;
  }
  return undefined;
}

export interface StarUpdate {
  productId: string;
  stars: string;
}

export async function checkProductUpdates(
  product: Product,
): Promise<{ versionChange?: VersionChange; starUpdate?: StarUpdate }> {
  const result: { versionChange?: VersionChange; starUpdate?: StarUpdate } = {};

  if (product.github) {
    // Fetch stars in parallel with release check
    const [release, starCount] = await Promise.all([
      checkGitHubRelease(product.github),
      fetchGitHubStars(product.github),
    ]);

    if (starCount !== null) {
      const formatted = formatStars(starCount);
      if (formatted !== product.stars) {
        result.starUpdate = { productId: product.id, stars: formatted };
      }
    }

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
 * Combined Gemini search: find new products AND news in a single API call.
 * Returns enough detail to create full Product entries for new products.
 */
interface CombinedSearchResult {
  newProducts: {
    name: string;
    company: string;
    description: string;
    website: string;
    category: string;
    pricingSummary: string;
    platforms: string[];
    source: string;
  }[];
  news: { productName: string; news: string; source: string }[];
}

/**
 * Data returned for new products — enough to create a full Product entry.
 */
export interface NewProductDetail extends NewProductFound {
  company: string;
  description: string;
  website: string;
  category: string;
  pricingSummary: string;
  platforms: string[];
}

export async function searchProductsAndNews(
  products: Product[],
): Promise<{ found: NewProductDetail[]; news: NewsChange[] }> {
  const existingList = products.slice(0, 40).map((p) => p.name).join(", ");
  const topProducts = products
    .filter((p) => p.stars || p.category === "coding-agent")
    .slice(0, 15)
    .map((p) => p.name)
    .join(", ");

  const validCategories = "open-source, framework, consumer, enterprise, coding-agent, developer, hardware";

  const prompt = `Search the web for the latest AI agent ecosystem updates (last 7 days).

I already track these products: ${existingList}

Do TWO things:
1. Find NEW AI agent/coding products NOT in my list (max 3). For each, provide FULL details.
2. Find LATEST NEWS about these top products: ${topProducts} (max 5)

Return JSON:
{
  "newProducts": [{
    "name": "Product Name",
    "company": "Company Name",
    "description": "2-3 sentence description of what it does",
    "website": "https://...",
    "category": "one of: ${validCategories}",
    "pricingSummary": "e.g. Free / $20/mo / Open Source",
    "platforms": ["Web", "macOS", "Linux", etc],
    "source": "URL where you found this"
  }],
  "news": [{"productName": "exact name from my list", "news": "1 sentence summary", "source": "URL"}]
}

Only include verified, recently launched products. Empty arrays if nothing found.
Return ONLY the JSON, no other text.`;

  try {
    const { text, sources } = await geminiSearch(prompt);
    const result = parseJsonFromResponse<CombinedSearchResult>(text);

    if (!result) {
      return { found: [], news: [] };
    }

    const found: NewProductDetail[] = (result.newProducts ?? [])
      .filter((r) => r.name && r.company)
      .map((r) => ({
        productId: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: r.name,
        company: r.company,
        description: r.description || `${r.name} by ${r.company}`,
        website: r.website || "",
        category: r.category || "consumer",
        pricingSummary: r.pricingSummary || "Unknown",
        platforms: r.platforms || ["Web"],
        source: r.source || sources[0] || "Gemini web search",
      }));

    const news = (result.news ?? [])
      .filter((r) => r.productName && r.news)
      .map((r) => ({
        productId: r.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        news: r.news,
        source: r.source || sources[0] || "Gemini web search",
      }));

    return { found, news };
  } catch (error) {
    console.error("Gemini combined search failed:", error);
    return { found: [], news: [] };
  }
}

// ===== Full Scan (GitHub + Gemini) =====

/**
 * Run a full scan: GitHub releases + Gemini web search.
 */
export interface ScanResult {
  entry: ScanEntry;
  newProductDetails: NewProductDetail[];
  starUpdates: StarUpdate[];
}

export async function runFullScan(
  products: Product[],
): Promise<ScanResult> {
  const today = new Date().toISOString().split("T")[0];
  const versionChanges: VersionChange[] = [];
  const newsChanges: NewsChange[] = [];
  const newProducts: NewProductFound[] = [];
  const starUpdates: StarUpdate[] = [];
  const searchQueries: string[] = [];

  // 1. Check GitHub releases + stars (parallel, batch of 10)
  const githubProducts = products.filter((p) => p.github);
  const batchSize = 10;

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
        if (result.value.starUpdate) {
          starUpdates.push(result.value.starUpdate);
        }
      }
    }
  }
  searchQueries.push(
    `GitHub: checked ${githubProducts.length} repos (releases + stars)`,
  );

  // 2. Gemini: combined search for new products + news (single API call)
  let newProductDetails: NewProductDetail[] = [];
  if (process.env.GEMINI_API_KEY) {
    try {
      const { found, news } = await searchProductsAndNews(products);
      newProductDetails = found;
      newProducts.push(...found.map((f) => ({
        productId: f.productId,
        name: f.name,
        source: f.source,
      })));
      newsChanges.push(...news);
      searchQueries.push(
        `Gemini: found ${found.length} new products, ${news.length} news items`,
      );
    } catch (error) {
      searchQueries.push(
        `Gemini: search failed — ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  } else {
    searchQueries.push("Gemini: skipped (GEMINI_API_KEY not set)");
  }

  if (starUpdates.length > 0) {
    searchQueries.push(`Stars: ${starUpdates.length} products have updated star counts`);
  }

  return {
    entry: {
      date: today,
      newProducts,
      versionChanges,
      priceChanges: [],
      newsChanges,
      searchQueries,
    },
    newProductDetails,
    starUpdates,
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
 * Apply scan results to products:
 * - Add new products discovered by Gemini
 * - Update versions and changelogs
 * - Update latest news
 * - Update GitHub star counts
 */
export function applyUpdatesToProducts(
  products: Product[],
  scan: ScanEntry,
  newProductDetails?: NewProductDetail[],
  starUpdates?: StarUpdate[],
): Product[] {
  const updated = [...products];
  const dateStr = new Date(scan.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 1. Add new products
  if (newProductDetails) {
    for (const np of newProductDetails) {
      // Skip if product already exists
      if (updated.some((p) => p.id === np.productId)) continue;

      const newProduct: Product = {
        id: np.productId,
        name: np.name,
        tagline: np.description.split(".")[0] || np.name,
        description: np.description,
        company: np.company,
        website: np.website || "#",
        logo: "🆕",
        category: np.category,
        pricingSummary: np.pricingSummary,
        pricingTiers: [{ name: "Default", price: np.pricingSummary, features: ["See website for details"] }],
        platforms: np.platforms,
        models: [],
        features: [],
        tags: ["auto-discovered", scan.date],
        launchDate: dateStr,
        lastUpdate: dateStr,
        latestNews: `Discovered by automated scan on ${scan.date}`,
      };
      updated.push(newProduct);
    }
  }

  // 2. Update versions
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
    product.lastUpdate = dateStr;
    updated[idx] = product;
  }

  // 3. Update news
  for (const nc of scan.newsChanges) {
    const idx = updated.findIndex((p) => p.id === nc.productId);
    if (idx < 0) continue;

    const product = { ...updated[idx] };
    product.latestNews = nc.news;
    updated[idx] = product;
  }

  // 4. Update GitHub star counts
  if (starUpdates) {
    for (const su of starUpdates) {
      const idx = updated.findIndex((p) => p.id === su.productId);
      if (idx < 0) continue;

      const product = { ...updated[idx] };
      product.stars = su.stars;
      updated[idx] = product;
    }
  }

  return updated;
}
