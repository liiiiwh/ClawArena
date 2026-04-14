import { getInsightById } from "@/lib/kv";

// KV accessed via /api/kv edge function proxy

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const insight = await getInsightById(id);

    if (!insight) {
      return Response.json(
        { error: "Insight not found" },
        { status: 404 },
      );
    }

    return Response.json(insight);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch insight" },
      { status: 500 },
    );
  }
}
