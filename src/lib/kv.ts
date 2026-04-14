/**
 * EdgeOne Pages KV access layer.
 *
 * The KV namespace is bound as a global variable `CLAWARENA_KV`
 * via the EdgeOne Pages console. In local dev, we fall back to
 * reading from the static data files in src/data/.
 */

import type {
  Product,
  Insight,
  ScanEntry,
  NewsItem,
  NewsSource,
} from "@/types";
import { parseLooseDate } from "@/types";

// ===== EdgeOne KV Type Declaration =====

interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get(key: string, type: "json"): Promise<unknown | null>;
  get(
    key: string,
    type: "arrayBuffer",
  ): Promise<ArrayBuffer | null>;
  get(key: string, type: "stream"): Promise<ReadableStream | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
  ): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    keys: { name: string }[];
    cursor?: string;
    list_complete: boolean;
  }>;
}

declare const CLAWARENA_KV: KVNamespace | undefined;

// ===== KV Helper =====

function getKV(): KVNamespace | null {
  if (typeof CLAWARENA_KV !== "undefined" && CLAWARENA_KV) {
    return CLAWARENA_KV;
  }
  return null;
}

// ===== Products =====

export async function getProducts(): Promise<Product[]> {
  const kv = getKV();
  if (kv) {
    const data = await kv.get("products:all", "json");
    if (data) return data as Product[];
  }
  // Fallback to static data for local dev
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
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put("products:all", JSON.stringify(products));
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
  const kv = getKV();
  if (kv) {
    const data = await kv.get("insights:all", "json");
    if (data) return data as Insight[];
  }
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
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put("insights:all", JSON.stringify(insights));
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
  const kv = getKV();
  if (kv) {
    const data = await kv.get("scanlog:all", "json");
    if (data) return data as ScanEntry[];
  }
  const { scanLog } = await import("@/data/scan-log");
  return scanLog;
}

export async function putScanLog(entries: ScanEntry[]): Promise<void> {
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put("scanlog:all", JSON.stringify(entries));
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
  const kv = getKV();
  if (!kv) return null;
  const data = await kv.get("news:cache", "json");
  return data as NewsCacheData | null;
}

export async function putNewsCache(items: NewsItem[]): Promise<void> {
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put(
    "news:cache",
    JSON.stringify({ fetchedAt: Date.now(), items }),
  );
}

// ===== News Sources =====

export async function getNewsSources(): Promise<NewsSource[]> {
  const kv = getKV();
  if (kv) {
    const data = await kv.get("news:sources", "json");
    if (data) return data as NewsSource[];
  }
  const { newsSources } = await import("@/data/news-sources");
  return newsSources;
}

export async function putNewsSources(
  sources: NewsSource[],
): Promise<void> {
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put("news:sources", JSON.stringify(sources));
}

// ===== Cron Status =====

export interface CronStatus {
  lastRun: string; // ISO timestamp
  status: "success" | "error";
  summary: string;
  duration: number; // ms
}

export async function getCronStatus(): Promise<CronStatus | null> {
  const kv = getKV();
  if (!kv) return null;
  const data = await kv.get("cron:last-run", "json");
  return data as CronStatus | null;
}

export async function putCronStatus(status: CronStatus): Promise<void> {
  const kv = getKV();
  if (!kv) throw new Error("KV not available");
  await kv.put("cron:last-run", JSON.stringify(status));
}
