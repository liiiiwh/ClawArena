import type { NewsItem } from "@/types";
import { NewsCard } from "./NewsCard";

interface NewsFeedProps {
  news: NewsItem[];
  limit?: number;
  showHeader?: boolean;
}

export function NewsFeed({ news, limit, showHeader = true }: NewsFeedProps) {
  const items = limit ? news.slice(0, limit) : news;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {showHeader && (
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-mono text-2xl font-bold text-text-bright">
              Latest News
            </h2>
            <p className="mt-1 text-sm text-text-dim">
              Auto-aggregated from top AI & tech sources
            </p>
          </div>
          {limit && (
            <a
              href="/news"
              className="rounded-lg border border-border px-4 py-1.5 font-mono text-xs text-text-dim transition-all hover:border-cyan hover:text-cyan"
            >
              View all →
            </a>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <p className="font-mono text-sm text-text-dim">
            Loading latest news...
          </p>
          <p className="mt-2 text-xs text-text-dim">
            News is fetched from RSS feeds. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <NewsCard key={`${item.link}-${i}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
