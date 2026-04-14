import { NewsFeed } from "@/components/NewsFeed";
import { getNewsSources } from "@/lib/kv";
import { fetchAllFeeds } from "@/lib/rss";
import type { NewsItem } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News — ClawArena",
  description: "Latest news from the AI Agent and Claw ecosystem",
};

async function getAllNews(): Promise<NewsItem[]> {
  try {
    const sources = await getNewsSources();
    return await fetchAllFeeds(sources, 15, 50);
  } catch {
    return [];
  }
}

// Fully static — rebuilt daily via cron
export const dynamic = "force-static";

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4">
          <a
            href="/"
            className="font-mono text-xs text-text-dim transition-colors hover:text-cyan"
          >
            ← Back to Home
          </a>
        </div>
        <h1 className="font-mono text-3xl font-bold text-text-bright">
          News <span className="text-cyan">Feed</span>
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Auto-aggregated from TechCrunch, The Verge, Ars Technica, and Hacker
          News. Refreshed hourly.
        </p>
      </div>
      <NewsFeed news={news} showHeader={false} />
    </div>
  );
}
