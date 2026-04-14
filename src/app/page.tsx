import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { DailyInsights } from "@/components/DailyInsights";
import { NewsFeed } from "@/components/NewsFeed";
import { CompareTable } from "@/components/CompareTable";
import { getProductsSorted, getInsights, getNewsSources } from "@/lib/kv";
import { fetchAllFeeds } from "@/lib/rss";
import { categories } from "@/types";
import type { NewsItem } from "@/types";

// Fully static — rebuilt daily via cron, no Cloud Function at runtime
export const dynamic = "force-static";

async function getNews(): Promise<NewsItem[]> {
  try {
    const sources = await getNewsSources();
    return await fetchAllFeeds(sources, 5, 6);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [products, insights, news] = await Promise.all([
    getProductsSorted(),
    getInsights(),
    getNews(),
  ]);

  return (
    <>
      <Hero />
      <ProductGrid products={products} categories={categories} />
      <DailyInsights insights={insights} />
      <NewsFeed news={news} limit={6} />
      <CompareTable products={products} categories={categories} />
    </>
  );
}
