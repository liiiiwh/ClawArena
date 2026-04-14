/**
 * Debug edge function to inspect what EdgeOne passes to onRequest.
 */
export async function onRequest(context: any) {
  const info: Record<string, any> = {};

  // What type is the context?
  info.contextType = typeof context;
  info.contextIsNull = context === null || context === undefined;

  if (context && typeof context === "object") {
    // List all top-level keys
    info.contextKeys = Object.keys(context);

    // Check env
    if (context.env) {
      info.envKeys = Object.keys(context.env);
      info.envTypes = {};
      for (const [k, v] of Object.entries(context.env)) {
        info.envTypes[k] = typeof v;
      }
      // Check our KV specifically
      info.hasKV = "CLAWARENA_KV" in context.env;
      info.kvType = typeof context.env.CLAWARENA_KV;
    }

    // Check if request exists
    info.hasRequest = !!context.request;

    // Check if params exists
    info.hasParams = !!context.params;
  }

  // Also check arguments length and each arg
  info.argsCount = arguments.length;
  if (arguments.length > 1) {
    info.arg1Type = typeof arguments[1];
    info.arg1Keys = arguments[1] ? Object.keys(arguments[1]) : null;
  }

  // Check globalThis for KV
  info.globalHasKV = typeof (globalThis as any).CLAWARENA_KV !== "undefined";

  return new Response(JSON.stringify(info, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
