Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { ...corsHeaders, "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" },
    });
  }

  // Read secrets from base44 secret store
  const BASE_URL = Deno.env.get("BlogAPIBaseURL");
  const API_KEY = Deno.env.get("buildoblogapikey");

  if (!BASE_URL) {
    return Response.json({ error: "Secret 'BlogAPIBaseURL' not configured in base44 secrets" }, { status: 500, headers: corsHeaders });
  }
  if (!API_KEY) {
    return Response.json({ error: "Secret 'buildoblogapikey' not configured in base44 secrets" }, { status: 500, headers: corsHeaders });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const { path, method = "GET", payload } = body as {
    path?: string;
    method?: string;
    payload?: unknown;
  };

  if (!path) return Response.json({ error: "Missing path" }, { status: 400, headers: corsHeaders });

  const url = `${BASE_URL.replace(/\/$/, "")}/${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  try {
    console.log(`[blogProxy] ${method} ${url}`);
    const res = await fetch(url, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(15000),
    });

    const text = await res.text();
    console.log(`[blogProxy] ${res.status}: ${text.slice(0, 200)}`);

    if (res.status === 204 || text === "") return Response.json({}, { headers: corsHeaders });

    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      return Response.json(
        { error: `API ${res.status}: ${text.slice(0, 300)}` },
        { status: res.status, headers: corsHeaders }
      );
    }

    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[blogProxy] error: ${msg}`);
    return Response.json({ error: msg }, { status: 500, headers: corsHeaders });
  }
});
