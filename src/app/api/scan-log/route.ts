import { getScanLog, appendScanEntry } from "@/lib/kv";
import { requireAdmin } from "@/lib/auth";
import type { ScanEntry } from "@/types";

// KV accessed via /api/kv edge function proxy

export async function GET() {
  try {
    const entries = await getScanLog();
    // Sort by date descending (newest first)
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return Response.json(entries);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch scan log" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const entry = (await request.json()) as ScanEntry;

    if (!entry.date) {
      return Response.json(
        { error: "Scan entry must have a date" },
        { status: 400 },
      );
    }

    await appendScanEntry(entry);
    return Response.json({ success: true, date: entry.date });
  } catch (error) {
    return Response.json(
      { error: "Failed to save scan entry" },
      { status: 500 },
    );
  }
}
