/**
 * KV access layer for ClawArena.
 *
 * EdgeOne Pages KV is only accessible in /edge-functions/ directory,
 * not in Next.js API routes. We use the edge function at /edgekv
 * as a proxy to read/write KV from Next.js server components and routes.
 *
 * In local dev (when KV proxy is unavailable), falls back to static data files.
 */

import type {
  Product,
  Insight,
  ScanEntry,
  NewsItem,
  NewsSource,
} from "@/types";
import { parseLooseDate } from "@/types";

// ===== KV Proxy Helper =====

const KV_PROXY_BASE =
  process.env.KV_PROXY_URL || // Allow override for local dev
  (typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://clawarena.edgeone.dev"
    : "");

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${KV_PROXY_BASE}/edgekv?key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function kvPut(key: string, value: unknown): Promise<void> {
  const adminKey = process.env.ADMIN_API_KEY;
  const res = await fetch(`${KV_PROXY_BASE}/edgekv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
    },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KV put failed: ${err}`);
  }
}

// ===== Products =====

export async function getProducts(): Promise<Product[]> {
  const data = await kvGet<Product[]>("products:all");
  if (data) return data;
  // Fallback to static data
  const { products } = await import("@/data/products");
  return products;
}

export async function getProductsSorted(): Promise<Product[]> {
  const products = await getProducts();
  return [...products].sort(
    (a, b) => parseLooseDate(b.lastUpdate) - parseLooseDate(a.lastUpdate),
  );
}

export async function getProductById(
  id: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function putProducts(products: Product[]): Promise<void> {
  await kvPut("products:all", products);
}

export async function upsertProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.push(product);
  }
  await putProducts(products);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  await putProducts(filtered);
}

// ===== Insights =====

export async function getInsights(): Promise<Insight[]> {
  const data = await kvGet<Insight[]>("insights:all");
  if (data) return data;
  const { insights } = await import("@/data/insights");
  return insights;
}

export async function getInsightById(
  id: string,
): Promise<Insight | undefined> {
  const insights = await getInsights();
  return insights.find((i) => i.id === id);
}

export async function putInsights(insights: Insight[]): Promise<void> {
  await kvPut("insights:all", insights);
}

export async function appendInsight(insight: Insight): Promise<void> {
  const insights = await getInsights();
  const idx = insights.findIndex((i) => i.id === insight.id);
  if (idx >= 0) {
    insights[idx] = insight;
  } else {
    insights.push(insight);
  }
  await putInsights(insights);
}

// ===== Scan Log =====

export async function getScanLog(): Promise<ScanEntry[]> {
  const data = await kvGet<ScanEntry[]>("scanlog:all");
  if (data) return data;
  const { scanLog } = await import("@/data/scan-log");
  return scanLog;
}

export async function putScanLog(entries: ScanEntry[]): Promise<void> {
  await kvPut("scanlog:all", entries);
}

export async function appendScanEntry(entry: ScanEntry): Promise<void> {
  const entries = await getScanLog();
  const idx = entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  await putScanLog(entries);
}

// ===== News Cache =====

export interface NewsCacheData {
  fetchedAt: number;
  items: NewsItem[];
}

export async function getNewsCache(): Promise<NewsCacheData | null> {
  return kvGet<NewsCacheData>("news:cache");
}

export async function putNewsCache(items: NewsItem[]): Promise<void> {
  await kvPut("news:cache", { fetchedAt: Date.now(), items });
}

// ===== News Sources =====

export async function getNewsSources(): Promise<NewsSource[]> {
  const data = await kvGet<NewsSource[]>("news:sources");
  if (data) return data;
  const { newsSources } = await import("@/data/news-sources");
  return newsSources;
}

export async function putNewsSources(
  sources: NewsSource[],
): Promise<void> {
  await kvPut("news:sources", sources);
}

// ===== Cron Status =====

export interface CronStatus {
  lastRun: string;
  status: "success" | "error";
  summary: string;
  duration: number;
}

export async function getCronStatus(): Promise<CronStatus | null> {
  return kvGet<CronStatus>("cron:last-run");
}

export async function putCronStatus(status: CronStatus): Promise<void> {
  await kvPut("cron:last-run", status);
}
