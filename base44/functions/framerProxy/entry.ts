Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const { token, collectionId, itemId, action, fieldData } = body as {
    token?: string;
    collectionId?: string;
    itemId?: string;
    action?: string;
    fieldData?: Record<string, unknown>;
  };

  if (!token) {
    return Response.json({ error: "Missing Framer token" }, { status: 400, headers: corsHeaders });
  }

  if (!action) {
    return Response.json({ error: "Missing action" }, { status: 400, headers: corsHeaders });
  }

  const framerHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Try both known Framer CMS API base URLs
  const BASE = "https://api.framer.com/store/api/cms";

  try {
    let url: string;
    let method = "GET";
    let fetchBody: string | undefined;

    if (action === "collections") {
      url = `${BASE}/collections`;
    } else if (action === "items" && collectionId) {
      url = `${BASE}/collections/${collectionId}/items`;
    } else if (action === "update" && collectionId && itemId) {
      url = `${BASE}/collections/${collectionId}/items/${itemId}`;
      method = "PATCH";
      fetchBody = JSON.stringify({ fieldData: fieldData ?? {} });
    } else {
      return Response.json(
        { error: `Invalid action "${action}" or missing parameters (collectionId=${collectionId}, itemId=${itemId})` },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[framerProxy] ${method} ${url}`);

    const framerRes = await fetch(url, {
      method,
      headers: framerHeaders,
      body: fetchBody,
      signal: AbortSignal.timeout(15000),
    });

    const text = await framerRes.text();
    console.log(`[framerProxy] status=${framerRes.status} body=${text.slice(0, 300)}`);

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!framerRes.ok) {
      return Response.json(
        { error: `Framer API ${framerRes.status}: ${text.slice(0, 200)}` },
        { status: framerRes.status, headers: corsHeaders }
      );
    }

    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[framerProxy] error: ${msg}`);
    return Response.json({ error: msg }, { status: 500, headers: corsHeaders });
  }
});
