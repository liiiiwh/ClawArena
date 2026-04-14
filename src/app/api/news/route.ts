import { getNewsCache, putNewsCache, getNewsSources } from "@/lib/kv";
import { fetchAllFeeds } from "@/lib/rss";

// KV accessed via /edgekv edge function proxy

const CACHE_TTL = 3600_000; // 1 hour in ms

export async function GET() {
  try {
    // Check KV cache first
    const cached = await getNewsCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return Response.json(cached.items);
    }

    // Fetch fresh from RSS sources
    const sources = await getNewsSources();
    const items = await fetchAllFeeds(sources);

    // Cache in KV (best-effort, don't fail if KV unavailable)
    try {
      await putNewsCache(items);
    } catch {
      // KV not available (local dev), continue without caching
    }

    return Response.json(items);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
