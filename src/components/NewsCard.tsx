import type { NewsItem } from "@/types";

export function NewsCard({ item }: { item: NewsItem }) {
  const date = new Date(item.pubDate);
  const timeAgo = getTimeAgo(date);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-bg-card p-4 transition-all hover:border-border-hover hover:bg-bg-hover"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">{item.sourceIcon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-text-bright transition-colors group-hover:text-cyan">
            {item.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs text-text-dim">
            {item.snippet}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-cyan">
              {item.source}
            </span>
            <span className="text-[10px] text-text-dim">&middot;</span>
            <span className="text-[10px] text-text-dim">{timeAgo}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
