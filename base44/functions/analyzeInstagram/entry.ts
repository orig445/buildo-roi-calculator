import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { username, lang = "he" } = await req.json();

    if (!username) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    const isEn = lang === "en";

    // Run both LLM calls in parallel: fast business analysis + visual identity search
    const [businessResult, visualResult] = await Promise.all([

      // Fast: business analysis without internet (GPT mini)
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze this Instagram username: @${cleanUsername}
Infer what kind of business this is and provide marketing intelligence.

Return JSON:
- business_name: brand name (derive from username, capitalize properly)
- business_type: short industry label in ${isEn ? "English" : "Hebrew"} (2–4 words)
- insight: 1–2 ${isEn ? "English" : "Hebrew"} sentences about marketing opportunity
- monthly_messages: realistic integer estimate
- monthly_customers: realistic integer estimate  
- avg_deal_value: integer in NIS
- keywords: array of 3–5 English keywords for ad search
- target_audience: 1 sentence in ${isEn ? "English" : "Hebrew"}
- usp: unique selling proposition in ${isEn ? "English" : "Hebrew"}, 1 sentence
- opening_message: ${isEn ? "English" : "Hebrew"} WhatsApp greeting with emoji
- follow_up_message: ${isEn ? "English" : "Hebrew"} follow-up, 1–2 sentences
- info_message: ${isEn ? "English" : "Hebrew"} info response, 2–3 sentences
- closing_message: ${isEn ? "English" : "Hebrew"} confirmation, 1 sentence
- quick_reply_1: short ${isEn ? "English" : "Hebrew"} button (4–6 words)
- quick_reply_2: short ${isEn ? "English" : "Hebrew"} button (4–6 words)

Return ONLY valid JSON.`,
        model: 'gpt_5_mini',
        response_json_schema: {
          type: "object",
          properties: {
            business_name: { type: "string" },
            business_type: { type: "string" },
            insight: { type: "string" },
            monthly_messages: { type: "number" },
            monthly_customers: { type: "number" },
            avg_deal_value: { type: "number" },
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
          required: ["business_name", "business_type", "insight", "monthly_messages", "monthly_customers", "avg_deal_value", "keywords"]
        }
      }),

      // Visual: logo + brand colors via internet search (Gemini)
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search the web for "${cleanUsername}" brand logo and brand colors.
Find their official logo image URL and exact brand hex color codes.
Return JSON with:
- logo_url: direct https:// image URL of the logo (from CDN, not instagram.com)
- brand_colors: array of 2–3 real hex codes (#xxxxxx) from their brand identity`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: "object",
          properties: {
            logo_url: { type: "string" },
            brand_colors: { type: "array", items: { type: "string" } },
          },
          required: ["brand_colors"]
        }
      })
    ]);

    // Merge results
    const result = {
      ...businessResult,
      logo_url: visualResult.logo_url || '',
      brand_colors: (visualResult.brand_colors || []).filter(c => /^#[0-9a-fA-F]{3,6}$/.test(c)).slice(0, 5),
      site_images: [],
    };

    // Save to DB (fire-and-forget)
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