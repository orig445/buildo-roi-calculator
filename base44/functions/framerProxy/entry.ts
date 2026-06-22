Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-framer-token, x-framer-collection-id, x-framer-item-id, x-framer-action",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const { token, collectionId, itemId, action, fieldData } = body;

    if (!token) {
      return Response.json({ error: "Missing Framer token" }, { status: 400, headers: corsHeaders });
    }

    const baseUrl = "https://api.framer.com/store/api/cms";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let url: string;
    let method = "GET";
    let fetchBody: string | undefined;

    if (action === "collections") {
      url = `${baseUrl}/collections`;
    } else if (action === "items" && collectionId) {
      url = `${baseUrl}/collections/${collectionId}/items`;
    } else if (action === "update" && collectionId && itemId && fieldData) {
      url = `${baseUrl}/collections/${collectionId}/items/${itemId}`;
      method = "PATCH";
      fetchBody = JSON.stringify({ fieldData });
    } else {
      return Response.json({ error: "Invalid action or missing parameters" }, { status: 400, headers: corsHeaders });
    }

    const res = await fetch(url, { method, headers, body: fetchBody });
    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || `Framer API error: ${res.status}` }, { status: res.status, headers: corsHeaders });
    }

    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500, headers: corsHeaders });
  }
});
