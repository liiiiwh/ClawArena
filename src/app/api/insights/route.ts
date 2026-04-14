import { getInsights, appendInsight } from "@/lib/kv";
import { requireAdmin } from "@/lib/auth";
import type { Insight } from "@/types";

// KV accessed via /edgekv edge function proxy

export async function GET() {
  try {
    const insights = await getInsights();
    // Sort by id (YYYY-MM-DD format) descending, more reliable than parsing date strings
    insights.sort((a, b) => b.id.localeCompare(a.id));
    return Response.json(insights);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch insights" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const insight = (await request.json()) as Insight;

    if (!insight.id || !insight.date) {
      return Response.json(
        { error: "Insight must have id and date" },
        { status: 400 },
      );
    }

    await appendInsight(insight);
    return Response.json({ success: true, id: insight.id });
  } catch (error) {
    return Response.json(
      { error: "Failed to save insight" },
      { status: 500 },
    );
  }
}
