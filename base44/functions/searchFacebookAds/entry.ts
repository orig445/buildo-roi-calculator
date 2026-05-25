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

    const params = new URLSearchParams({
      search_terms: keywords,
      ad_reached_countries: JSON.stringify([country, 'US', 'GB']),
      ad_active_status: 'ALL',
      limit: String(limit),
      fields: 'id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id,impressions,spend,currency,ad_delivery_stop_time,languages',
      access_token: token,
    });

    const url = `https://graph.facebook.com/v19.0/ads_archive?${params}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('FB API error:', JSON.stringify(data.error));
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    return Response.json({ ads: data.data || [], paging: data.paging });
  } catch (error) {
    console.error('searchFacebookAds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});