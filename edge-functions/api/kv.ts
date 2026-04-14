/**
 * EdgeOne Edge Function — KV proxy for the Next.js app.
 *
 * KV is only accessible in /edge-functions/, not in Next.js API routes.
 * This edge function acts as a proxy: Next.js routes call this to read/write KV.
 *
 * Routes:
 *   GET  /api/kv?key=xxx          — read a key
 *   POST /api/kv  {key, value}    — write a key
 *   DELETE /api/kv  {key}         — delete a key
 *   GET  /api/kv?action=list&prefix=xxx — list keys
 *   POST /api/kv?action=seed     — seed all data from body
 */

interface KVNamespace {
  get(key: string, type?: string): Promise<any>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string }[];
    cursor?: string;
    list_complete: boolean;
  }>;
}

interface EdgeRequest {
  request: Request;
  params: Record<string, string>;
  env: Record<string, any>;
}

function checkAuth(request: Request, env: Record<string, any>): Response | null {
  // Allow GET reads without auth
  if (request.method === "GET") {
    const url = new URL(request.url);
    if (url.searchParams.get("action") !== "seed") return null;
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const adminKey = env.ADMIN_API_KEY || "";

  if (!token || token !== adminKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

export async function onRequest({ request, params, env }: EdgeRequest) {
  const kv = env.CLAWARENA_KV as KVNamespace | undefined;
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Debug endpoint
  if (url.searchParams.get("action") === "debug") {
    return new Response(
      JSON.stringify({
        kvAvailable: !!kv,
        kvType: typeof kv,
        envKeys: Object.keys(env),
        hasAdminKey: !!env.ADMIN_API_KEY,
      }),
      { headers: corsHeaders },
    );
  }

  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV not available", envKeys: Object.keys(env) }),
      { status: 500, headers: corsHeaders },
    );
  }

  // Auth check for writes
  const authError = checkAuth(request, env);
  if (authError) return authError;

  try {
    // GET — read or list
    if (request.method === "GET") {
      const action = url.searchParams.get("action");

      if (action === "list") {
        const prefix = url.searchParams.get("prefix") || undefined;
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const cursor = url.searchParams.get("cursor") || undefined;
        const result = await kv.list({ prefix, limit, cursor });
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      const key = url.searchParams.get("key");
      if (!key) {
        return new Response(
          JSON.stringify({ error: "key parameter required" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const value = await kv.get(key, "text");
      if (value === null) {
        return new Response(
          JSON.stringify({ error: "Key not found" }),
          { status: 404, headers: corsHeaders },
        );
      }

      // Return raw value (already JSON string)
      return new Response(value, { headers: corsHeaders });
    }

    // POST — write
    if (request.method === "POST") {
      const action = url.searchParams.get("action");

      // Bulk seed: body is { "key1": value1, "key2": value2, ... }
      if (action === "seed") {
        const data = await request.json() as Record<string, unknown>;
        const results: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          await kv.put(key, typeof value === "string" ? value : JSON.stringify(value));
          results.push(key);
        }
        return new Response(
          JSON.stringify({ success: true, seeded: results }),
          { headers: corsHeaders },
        );
      }

      // Single write: { key, value }
      const body = await request.json() as { key: string; value: unknown };
      if (!body.key) {
        return new Response(
          JSON.stringify({ error: "key is required" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const valueStr = typeof body.value === "string"
        ? body.value
        : JSON.stringify(body.value);
      await kv.put(body.key, valueStr);

      return new Response(
        JSON.stringify({ success: true, key: body.key }),
        { headers: corsHeaders },
      );
    }

    // DELETE
    if (request.method === "DELETE") {
      const body = await request.json() as { key: string };
      if (!body.key) {
        return new Response(
          JSON.stringify({ error: "key is required" }),
          { status: 400, headers: corsHeaders },
        );
      }
      await kv.delete(body.key);
      return new Response(
        JSON.stringify({ success: true, key: body.key }),
        { headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "KV operation failed",
        detail: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: corsHeaders },
    );
  }
}
