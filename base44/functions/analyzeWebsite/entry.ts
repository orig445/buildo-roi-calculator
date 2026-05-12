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
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BildoBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      // Strip HTML tags and truncate
      websiteContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000);
    } catch {
      websiteContent = `Website URL: ${url}`;
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `
You are analyzing a business website to help estimate their WhatsApp communication volume and business metrics, AND to craft a personalized WhatsApp bot demo conversation for this specific business.

Website URL: ${url}
Website content snippet: ${websiteContent}

Based on the website, provide:
1. business_type: Business type / industry (in Hebrew, 1-3 words)
2. insight: A specific insight in Hebrew (1-2 sentences) explaining exactly HOW WhatsApp automation can help THIS specific business
3. monthly_messages, monthly_customers, avg_deal_value: Realistic estimates for this business
4. opening_message: A WhatsApp greeting message IN HEBREW from a bot for THIS specific business — personalized to the exact services/products on their website. Sound like a real business bot, not generic. 1-2 sentences max.
5. follow_up_message: A follow-up message IN HEBREW after the customer shows interest — mention a specific service/product from their site, include urgency or value. 1-2 sentences.
6. closing_message: A closing message IN HEBREW confirming we'll reach out, mentioning something specific about their business. 1 sentence.

Examples of quality opening_message (adapt to the actual business):
- For a spa: "היי! ✨ ברוכים הבאים ל-[שם עסק]. רוצה לקבוע תור לטיפול פנים או מסאז'? אנחנו פנויים גם הערב!"
- For a car service: "שלום! 🚗 [שם עסק] - תיקון וטיפול רכב. איך אפשר לעזור לך היום? אנחנו עונים מייד!"
- For a law firm: "שלום, ברוכים הבאים ל[שם עסק]. לייעוץ ראשוני חינמי בענייני [תחום] — השאר פרטים ונחזור אליך תוך שעה."

Be realistic and conservative. For a small local business: messages 500-3000, customers 50-300, deal value 200-2000.
For medium business: messages 3000-20000, customers 300-2000, deal value 500-5000.

Return ONLY valid JSON, no markdown, no explanation.
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