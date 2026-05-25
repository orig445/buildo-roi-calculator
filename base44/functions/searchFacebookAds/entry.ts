import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { keywords, country = 'IL', limit = 6 } = await req.json();

    if (!keywords) {
      return Response.json({ error: 'חסר keywords' }, { status: 400 });
    }

    const token = Deno.env.get('FB_ADS_ACCESS_TOKEN');

    // Try the official API first
    if (token) {
      try {
        const params = new URLSearchParams({
          search_terms: keywords,
          ad_reached_countries: JSON.stringify([country, 'IL', 'US']),
          ad_active_status: 'ALL',
          limit: String(Math.min(limit, 20)),
          fields: 'id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id,impressions,spend,currency,ad_delivery_stop_time,ad_delivery_start_time,languages,publisher_platforms',
          access_token: token,
        });

        const apiRes = await fetch(`https://graph.facebook.com/v20.0/ads_archive?${params}`);
        const apiData = await apiRes.json();

        if (!apiData.error && apiData.data && apiData.data.length > 0) {
          console.log('API success:', apiData.data.length, 'ads');
          return Response.json({ ads: apiData.data, paging: apiData.paging, source: 'api' });
        }
        console.log('API failed:', JSON.stringify(apiData.error?.message));
      } catch (apiErr) {
        console.log('API error:', apiErr.message);
      }
    }

    // Fallback: Use LLM with internet search to find real Facebook ads
    console.log('Using LLM+internet to find Facebook ads for:', keywords);

    const adsLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country}&q=${encodeURIComponent(keywords)}&search_type=keyword_unordered`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Go to Facebook Ads Library and find real active ads related to "${keywords}".

Search URL: ${adsLibraryUrl}

Find ${limit} real Facebook/Instagram ads. For each ad extract ALL of the following:
- page_name: the business/page name
- ad_creative_link_titles: array with the ad headline
- ad_creative_bodies: array with the ad body text
- publisher_platforms: array like ["facebook"] or ["instagram"]
- ad_creation_time: date string
- ad_snapshot_url: the FULL direct URL to the ad snapshot image on Facebook (e.g. https://www.facebook.com/ads/archive/render_ad/?id=XXXXXXX&access_token=... or the image CDN URL). This is CRITICAL - find the actual image URL of each ad.
- ad_image_url: direct image URL of the ad creative if available (from scontent CDN or similar)

IMPORTANT: You MUST provide real image URLs for each ad. Look for scontent-*.fbcdn.net or similar CDN URLs.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          ads: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                page_name: { type: 'string' },
                ad_creative_link_titles: { type: 'array', items: { type: 'string' } },
                ad_creative_bodies: { type: 'array', items: { type: 'string' } },
                publisher_platforms: { type: 'array', items: { type: 'string' } },
                ad_creation_time: { type: 'string' },
                ad_snapshot_url: { type: 'string' },
                ad_image_url: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const llmAds = result?.ads || [];
    console.log('LLM found', llmAds.length, 'ads');
    llmAds.forEach((a, i) => console.log(`ad[${i}] snapshot:`, a.ad_snapshot_url, 'image:', a.ad_image_url));

    if (llmAds.length > 0) {
      const formattedAds = llmAds.map((ad, i) => ({
        id: `llm_${i}`,
        page_name: ad.page_name || 'מפרסם',
        ad_creative_link_titles: ad.ad_creative_link_titles || [],
        ad_creative_bodies: ad.ad_creative_bodies || [],
        ad_snapshot_url: ad.ad_snapshot_url || null,
        ad_image_url: ad.ad_image_url || null,
        impressions: { lower_bound: '1000', upper_bound: '50000' },
        spend: null,
        currency: 'ILS',
        publisher_platforms: ad.publisher_platforms || ['facebook'],
        ad_creation_time: ad.ad_creation_time || new Date().toISOString(),
        source_label: 'Ads Library',
      }));

      return Response.json({ ads: formattedAds, source: 'llm_internet' });
    }

    return Response.json({ ads: [], source: 'fallback' });

  } catch (error) {
    console.error('searchFacebookAds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});