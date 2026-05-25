import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { keywords, country = 'IL', limit = 12 } = await req.json();

    if (!keywords) {
      return Response.json({ error: 'חסר keywords' }, { status: 400 });
    }

    const token = Deno.env.get('FB_ADS_ACCESS_TOKEN');
    if (!token) return Response.json({ error: 'FB_ADS_ACCESS_TOKEN not set' }, { status: 500 });

    // First validate the token
    const meRes = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${token}`);
    const meData = await meRes.json();
    console.log('Token identity:', JSON.stringify(meData));

    if (meData.error) {
      console.error('Token validation failed:', JSON.stringify(meData.error));
      return Response.json({ error: `Token invalid: ${meData.error.message}` }, { status: 400 });
    }

    // Check token debug info
    const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`);
    const debugData = await debugRes.json();
    console.log('Token debug:', JSON.stringify(debugData?.data));

    const params = new URLSearchParams({
      search_terms: keywords,
      ad_reached_countries: JSON.stringify([country, 'IL', 'US']),
      ad_active_status: 'ALL',
      limit: String(limit),
      fields: 'id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id,impressions,spend,currency,ad_delivery_stop_time,ad_delivery_start_time,languages,publisher_platforms',
      access_token: token,
    });

    const url = `https://graph.facebook.com/v20.0/ads_archive?${params}`;
    console.log('Calling:', url.replace(token, 'TOKEN_HIDDEN'));
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('FB API error:', JSON.stringify(data.error));
      return Response.json({ error: data.error.message, errorDetail: data.error }, { status: 400 });
    }

    return Response.json({ ads: data.data || [], paging: data.paging });
  } catch (error) {
    console.error('searchFacebookAds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});