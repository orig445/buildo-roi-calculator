import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url } = await req.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the website content
    let websiteContent = '';
    let fetchedOk = false;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BildoBot/1.0; +https://bildo.co.il)' },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();
      // Strip scripts/styles, then HTML tags, normalize whitespace
      const cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);
      websiteContent = cleaned;
      fetchedOk = cleaned.length > 100;
    } catch {
      websiteContent = `Website URL: ${url}`;
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `
You are an expert WhatsApp business automation consultant analyzing a real business website to produce ACCURATE estimates.

Website URL: ${url}
Website content: ${websiteContent}
Content fetched successfully: ${fetchedOk}

YOUR TASK:
1. Identify the exact business type, industry, and scale from the content.
2. Estimate realistic monthly WhatsApp metrics based on industry benchmarks AND website signals (e.g. number of services, pricing shown, location, team size hints).
3. Write a personalized Hebrew WhatsApp bot opening message that mentions the specific business name and services found on the site.

ESTIMATION RULES (use these industry benchmarks as a guide):
- Beauty/Spa/Hair: customers 80–300/month, deal value ₪150–600, messages = customers × 4
- Medical/Clinic: customers 100–400/month, deal value ₪200–800, messages = customers × 3
- Fitness/Gym: customers 50–200/month, deal value ₪200–500, messages = customers × 5
- Restaurant/Food: customers 200–800/month, deal value ₪80–250, messages = customers × 6
- Legal/Accounting: customers 20–80/month, deal value ₪1500–8000, messages = customers × 3
- Real Estate: customers 10–50/month, deal value ₪15000–80000, messages = customers × 5
- E-commerce/Shop: customers 100–1000/month, deal value ₪150–2000, messages = customers × 4
- B2B/Services: customers 20–100/month, deal value ₪2000–20000, messages = customers × 3
- Auto/Garage: customers 50–200/month, deal value ₪300–2000, messages = customers × 4
- Education/Tutoring: customers 30–150/month, deal value ₪400–2000, messages = customers × 5
- Default small local: customers 50–200/month, deal value ₪300–1500, messages = customers × 4

SCALE MODIFIERS:
- If website looks very professional / multiple locations / large team → multiply by 2–4
- If website looks like a solo practitioner / home business → use lower end
- If pricing is visible, use that directly for deal value

OUTPUT FIELDS:
- business_type: short label in Hebrew (2–4 words, e.g. "מספרה ועיצוב שיער")
- insight: 1–2 Hebrew sentences explaining the specific WhatsApp opportunity for THIS business
- monthly_messages: integer
- monthly_customers: integer  
- avg_deal_value: integer (NIS)
- opening_message: Hebrew WhatsApp greeting from bot — use actual business name/services from site, friendly & specific, 1–2 sentences, include relevant emoji
- follow_up_message: Hebrew follow-up after customer shows interest — mention a specific service/product/price from site, add urgency, 1–2 sentences
- closing_message: Hebrew confirmation message — 1 sentence, mention something specific about the business

Return ONLY valid JSON.
`,
      response_json_schema: {
        type: "object",
        properties: {
          business_type: { type: "string" },
          insight: { type: "string" },
          monthly_messages: { type: "number" },
          monthly_customers: { type: "number" },
          avg_deal_value: { type: "number" },
          opening_message: { type: "string" },
          follow_up_message: { type: "string" },
          closing_message: { type: "string" },
        },
        required: ["business_type", "insight", "monthly_messages", "monthly_customers", "avg_deal_value", "opening_message", "follow_up_message", "closing_message"]
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});