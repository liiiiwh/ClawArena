/**
 * Edge-compatible RSS feed parser.
 * Uses fetch() + regex XML parsing instead of rss-parser (Node.js only).
 */

import type { NewsSource, NewsItem } from "@/types";

interface RSSRawItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

/**
 * Extract a tag value from XML, handling both CDATA and plain text.
 */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
  );
  const match = xml.match(regex);
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

/**
 * Strip HTML tags and decode common entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse RSS/Atom XML into items.
 */
function parseXML(xml: string): RSSRawItem[] {
  const items: RSSRawItem[] = [];

  // Try RSS <item> format
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    items.push({
      title: stripHtml(extractTag(content, "title")),
      link: extractTag(content, "link"),
      pubDate: extractTag(content, "pubDate"),
      description: extractTag(content, "description"),
    });
  }

  // If no RSS items, try Atom <entry> format
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = entryRegex.exec(xml)) !== null) {
      const content = match[1];
      // Atom link is in <link href="..." />
      const linkMatch = content.match(
        /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/,
      );
      items.push({
        title: stripHtml(extractTag(content, "title")),
        link: linkMatch?.[1] ?? "",
        pubDate:
          extractTag(content, "published") ||
          extractTag(content, "updated"),
        description:
          extractTag(content, "summary") ||
          extractTag(content, "content"),
      });
    }
  }

  return items;
}

/**
 * Fetch and parse a single RSS feed.
 */
export async function parseRSSFeed(
  feedUrl: string,
  maxItems = 10,
): Promise<RSSRawItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "ClawArena/1.0 RSS Reader" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseXML(xml).slice(0, maxItems);
  } catch {
    return [];
  }
}

/**
 * Fetch all RSS feeds in parallel and return merged, sorted news items.
 */
export async function fetchAllFeeds(
  sources: NewsSource[],
  maxPerSource = 10,
  maxTotal = 50,
): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const items = await parseRSSFeed(source.feedUrl, maxPerSource);
      return items.map(
        (item): NewsItem => ({
          title: item.title || "Untitled",
          link: item.link || "#",
          pubDate: item.pubDate || new Date().toISOString(),
          source: source.name,
          sourceIcon: source.icon,
          snippet: stripHtml(item.description).slice(0, 150) + "...",
        }),
      );
    }),
  );

  const allNews: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allNews.push(...result.value);
    }
  }

  // Sort by date, newest first
  allNews.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  return allNews.slice(0, maxTotal);
}
