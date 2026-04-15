/**
 * Network connectivity test — check if EdgeOne can reach external APIs.
 * GET /nettest
 */
export async function onRequest({ request, params, env }) {
  const targets = [
    { name: "Google Gemini API", url: "https://generativelanguage.googleapis.com/" },
    { name: "GitHub API", url: "https://api.github.com/" },
    { name: "Perplexity API", url: "https://api.perplexity.ai/" },
    { name: "OpenAI API", url: "https://api.openai.com/v1/models" },
  ];

  const results = [];

  for (const target of targets) {
    try {
      const start = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(target.url, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timer);
      const latency = Date.now() - start;
      results.push({
        name: target.name,
        url: target.url,
        status: res.status,
        ok: true,
        latency: `${latency}ms`,
      });
    } catch (err) {
      results.push({
        name: target.name,
        url: target.url,
        ok: false,
        error: err.message || String(err),
      });
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
