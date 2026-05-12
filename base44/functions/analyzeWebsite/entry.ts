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
You are analyzing a business website to help estimate their WhatsApp communication volume and business metrics.

Website URL: ${url}
Website content snippet: ${websiteContent}

Based on the website, estimate the following for this business:
1. Business type / industry (in Hebrew, 1-3 words)
2. A specific insight in Hebrew (1-2 sentences) explaining exactly HOW Bildo's WhatsApp API can help THIS specific business - be concrete and specific to their industry
3. Estimated monthly WhatsApp messages they send (realistic range for their business size/type)
4. Estimated monthly customers/transactions
5. Estimated average deal/transaction value in ILS (Israeli Shekel)

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
        },
        required: ["business_type", "insight", "monthly_messages", "monthly_customers", "avg_deal_value"]
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});