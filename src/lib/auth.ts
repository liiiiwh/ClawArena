/**
 * Simple Bearer token authentication for admin API routes.
 * The ADMIN_API_KEY is set as an environment variable in EdgeOne Pages console.
 */

export function requireAdmin(request: Request): Response | null {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== process.env.ADMIN_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null; // Auth passed
}

/**
 * Verify cron requests come from EdgeOne's scheduler.
 * CRON_SECRET is set in EdgeOne Pages console and included in cron request headers.
 */
export function requireCron(request: Request): Response | null {
  const cronSecret = request.headers.get("X-Cron-Secret")
    ?? request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null; // Auth passed
}
