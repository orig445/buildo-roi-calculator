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

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const { token, collectionId, itemId, action, fieldData } = body as {
    token?: string; collectionId?: string; itemId?: string;
    action?: string; fieldData?: Record<string, unknown>;
  };

  if (!token) return Response.json({ error: "Missing Framer token" }, { status: 400, headers: corsHeaders });
  if (!action) return Response.json({ error: "Missing action" }, { status: 400, headers: corsHeaders });

  const framerHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // Framer CMS REST API — try multiple known URL formats
  const URL_CANDIDATES: Record<string, string[]> = {
    collections: [
      "https://api.framer.com/store/api/cms/collections",
      "https://api.framer.com/store/api/v1/cms/collections",
    ],
    items: collectionId ? [
      `https://api.framer.com/store/api/cms/collections/${collectionId}/items`,
      `https://api.framer.com/store/api/v1/cms/collections/${collectionId}/items`,
    ] : [],
    update: (collectionId && itemId) ? [
      `https://api.framer.com/store/api/cms/collections/${collectionId}/items/${itemId}`,
      `https://api.framer.com/store/api/v1/cms/collections/${collectionId}/items/${itemId}`,
    ] : [],
  };

  const candidates = URL_CANDIDATES[action] ?? [];
  if (candidates.length === 0) {
    return Response.json(
      { error: `Invalid action "${action}" or missing parameters` },
      { status: 400, headers: corsHeaders }
    );
  }

  const method = action === "update" ? "PATCH" : "GET";
  const fetchBody = action === "update" ? JSON.stringify({ fieldData: fieldData ?? {} }) : undefined;

  // Try each candidate URL until one succeeds (non-404)
  const diagnostics: string[] = [];
  for (const url of candidates) {
    try {
      console.log(`[framerProxy] ${method} ${url}`);
      const res = await fetch(url, {
        method,
        headers: framerHeaders,
        body: fetchBody,
        signal: AbortSignal.timeout(15000),
      });

      const text = await res.text();
      console.log(`[framerProxy] ${url} → ${res.status}: ${text.slice(0, 200)}`);
      diagnostics.push(`${url} → ${res.status}`);

      if (res.status === 404) continue; // try next candidate

      let data: unknown;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok) {
        return Response.json(
          { error: `Framer API ${res.status}: ${text.slice(0, 300)}` },
          { status: res.status, headers: corsHeaders }
        );
      }

      return Response.json(data, { headers: corsHeaders });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diagnostics.push(`${url} → fetch error: ${msg}`);
      console.error(`[framerProxy] fetch error for ${url}: ${msg}`);
    }
  }

  // All candidates failed — return diagnostic info
  return Response.json(
    { error: `כל נתיבי ה-API של Framer החזירו 404. ייתכן שהטוקן לא תקין או ש-CMS לא מופעל בפרויקט.\n\nנסו: ${diagnostics.join(" | ")}` },
    { status: 404, headers: corsHeaders }
  );
});
