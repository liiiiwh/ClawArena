/**
 * EdgeOne Pages Function — KV proxy for the Next.js app.
 *
 * KV is only accessible in /functions/, not in Next.js API routes.
 * KV namespace bound as global variable CLAWARENA_KV.
 *
 * Routes:
 *   GET  /edgekv?action=debug     — check KV availability
 *   GET  /edgekv?key=xxx          — read a key
 *   GET  /edgekv?action=list      — list keys
 *   POST /edgekv  {key, value}    — write a key (requires auth)
 *   POST /edgekv?action=seed      — bulk write (requires auth)
 *   DELETE /edgekv  {key}         — delete a key (requires auth)
 */

export async function onRequest({ request, params, env }) {
  const url = new URL(request.url);
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Debug endpoint
  if (url.searchParams.get('action') === 'debug') {
    let kvAvailable = false;
    let kvType = 'undefined';
    try {
      kvAvailable = typeof CLAWARENA_KV !== 'undefined';
      kvType = typeof CLAWARENA_KV;
    } catch (e) {}
    return new Response(JSON.stringify({
      kvAvailable,
      kvType,
      hasEnvAdminKey: !!env?.ADMIN_API_KEY,
    }), { headers });
  }

  // Check KV availability
  let kv;
  try {
    kv = CLAWARENA_KV;
  } catch (e) {
    return new Response(JSON.stringify({
      error: "KV not available. Bind CLAWARENA_KV in EdgeOne console.",
    }), { status: 500, headers });
  }

  if (!kv) {
    return new Response(JSON.stringify({
      error: "KV namespace CLAWARENA_KV is not bound.",
    }), { status: 500, headers });
  }

  // Auth check for writes
  if (request.method !== 'GET') {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const adminKey = env?.ADMIN_API_KEY || '';
    if (!token || token !== adminKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers,
      });
    }
  }

  try {
    // GET — read or list
    if (request.method === 'GET') {
      const action = url.searchParams.get('action');

      if (action === 'list') {
        const prefix = url.searchParams.get('prefix') || '';
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const cursor = url.searchParams.get('cursor') || '';
        const result = await kv.list({ prefix, limit, cursor });
        return new Response(JSON.stringify(result), { headers });
      }

      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(JSON.stringify({ error: 'key parameter required' }), {
          status: 400, headers,
        });
      }

      const value = await kv.get(key);
      if (value === null || value === undefined) {
        return new Response(JSON.stringify({ error: 'Key not found' }), {
          status: 404, headers,
        });
      }

      return new Response(value, { headers });
    }

    // POST — write
    if (request.method === 'POST') {
      const action = url.searchParams.get('action');

      // Bulk seed
      if (action === 'seed') {
        const data = await request.json();
        const results = [];
        for (const [key, value] of Object.entries(data)) {
          const str = typeof value === 'string' ? value : JSON.stringify(value);
          await kv.put(key, str);
          results.push(key);
        }
        return new Response(JSON.stringify({ success: true, seeded: results }), { headers });
      }

      // Single write
      const body = await request.json();
      if (!body.key) {
        return new Response(JSON.stringify({ error: 'key is required' }), {
          status: 400, headers,
        });
      }
      const valueStr = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
      await kv.put(body.key, valueStr);
      return new Response(JSON.stringify({ success: true, key: body.key }), { headers });
    }

    // DELETE
    if (request.method === 'DELETE') {
      const body = await request.json();
      if (!body.key) {
        return new Response(JSON.stringify({ error: 'key is required' }), {
          status: 400, headers,
        });
      }
      await kv.delete(body.key);
      return new Response(JSON.stringify({ success: true, key: body.key }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'KV operation failed',
      detail: err.message || String(err),
    }), { status: 500, headers });
  }
}
