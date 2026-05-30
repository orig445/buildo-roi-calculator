import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { username, lang = "he" } = await req.json();

    if (!username) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.replace(/^@/, '').trim();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `
Search the web for the Instagram profile @${cleanUsername} and find out everything about this business.
Look for: their logo image URL, brand colors, bio, what they sell, and their website.
Also search for "${cleanUsername} logo" and "${cleanUsername} brand colors" to find accurate visual identity.

Instagram URL to search: https://www.instagram.com/${cleanUsername}/

Based on real search results, provide business intelligence for this brand/business.

ESTIMATION RULES:
- Beauty/Spa/Hair: customers 80–300/month, deal value ₪150–600
- Medical/Clinic: customers 100–400/month, deal value ₪200–800
- Fitness/Gym: customers 50–200/month, deal value ₪200–500
- Restaurant/Food: customers 200–800/month, deal value ₪80–250
- Legal/Accounting: customers 20–80/month, deal value ₪1500–8000
- Real Estate: customers 10–50/month, deal value ₪15000–80000
- E-commerce/Shop: customers 100–1000/month, deal value ₪150–2000
- B2B/Services: customers 20–100/month, deal value ₪2000–20000
- Default small local: customers 50–200/month, deal value ₪300–1500

OUTPUT:
- business_name: infer business/brand name from username or profile
- business_type: short industry label in ${lang === "en" ? "English" : "Hebrew"} (2–4 words)
- insight: 1–2 ${lang === "en" ? "English" : "Hebrew"} sentences about this business's marketing opportunity
- monthly_messages: integer estimate
- monthly_customers: integer estimate
- avg_deal_value: integer (NIS)
- logo_url: ACTUAL logo or profile image URL from search results (must be a real https:// URL from CDN or the web, not instagram.com). Search for the brand's logo online.
- brand_colors: array of 2–3 hex color codes from the brand's ACTUAL visual identity found online. Do NOT guess — use real brand colors from search results.
- site_images: empty array (no website images)
- keywords: array of 3–5 English keywords for ad search
- target_audience: 1 sentence describing the typical customer in ${lang === "en" ? "English" : "Hebrew"}
- usp: unique selling proposition in ${lang === "en" ? "English" : "Hebrew"}, 1 sentence
- opening_message: ${lang === "en" ? "English" : "Hebrew"} WhatsApp greeting, 1–2 sentences, emoji
- follow_up_message: ${lang === "en" ? "English" : "Hebrew"} follow-up, 1–2 sentences
- info_message: ${lang === "en" ? "English" : "Hebrew"} informational response, 2–3 sentences
- closing_message: ${lang === "en" ? "English" : "Hebrew"} confirmation, 1 sentence
- quick_reply_1: short ${lang === "en" ? "English" : "Hebrew"} button text (4–6 words)
- quick_reply_2: short ${lang === "en" ? "English" : "Hebrew"} button text (4–6 words)

Return ONLY valid JSON.
`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          business_name: { type: "string" },
          business_type: { type: "string" },
          insight: { type: "string" },
          monthly_messages: { type: "number" },
          monthly_customers: { type: "number" },
          avg_deal_value: { type: "number" },
          logo_url: { type: "string" },
          brand_colors: { type: "array", items: { type: "string" } },
          site_images: { type: "array", items: { type: "string" } },
          keywords: { type: "array", items: { type: "string" } },
          target_audience: { type: "string" },
          usp: { type: "string" },
          opening_message: { type: "string" },
          follow_up_message: { type: "string" },
          info_message: { type: "string" },
          closing_message: { type: "string" },
          quick_reply_1: { type: "string" },
          quick_reply_2: { type: "string" },
        },
        required: ["business_name", "business_type", "insight", "monthly_messages", "monthly_customers", "avg_deal_value", "brand_colors", "keywords"]
      }
    });

    result.brand_colors = (result.brand_colors || []).filter(c => /^#[0-9a-fA-F]{3,6}$/.test(c)).slice(0, 5);

    // Save to DB
    base44.asServiceRole.entities.ScannedSite.create({
      url: `https://www.instagram.com/${cleanUsername}/`,
      business_name: result.business_name,
      business_type: result.business_type,
      insight: result.insight,
      monthly_messages: result.monthly_messages,
      monthly_customers: result.monthly_customers,
      avg_deal_value: result.avg_deal_value,
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});