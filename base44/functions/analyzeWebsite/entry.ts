import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, lang = "he" } = await req.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the website content
    let websiteContent = '';
    let fetchedOk = false;
    let extractedColors = [];
    let extractedImages = [];

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BildoBot/1.0; +https://bildo.co.il)' },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();

      // ── Extract colors from CSS/inline styles BEFORE stripping ──
      const colorMatches = new Set();

      // hex colors
      const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
      for (const m of html.matchAll(hexRegex)) {
        const hex = m[0].length === 4
          ? '#' + m[1][0] + m[1][0] + m[1][1] + m[1][1] + m[1][2] + m[1][2]
          : m[0].toLowerCase();
        // skip near-white, near-black, pure grays
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
        const isWhiteBlack = (r > 230 && g > 230 && b > 230) || (r < 25 && g < 25 && b < 25);
        if (!isGray && !isWhiteBlack) colorMatches.add(hex);
      }

      // rgb/rgba colors
      const rgbRegex = /rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
      for (const m of html.matchAll(rgbRegex)) {
        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
        const isWhiteBlack = (r > 230 && g > 230 && b > 230) || (r < 25 && g < 25 && b < 25);
        if (!isGray && !isWhiteBlack) {
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
          colorMatches.add(hex);
        }
      }
      // Count frequency of each color to find dominant ones
      const colorFreq = {};
      for (const m of html.matchAll(hexRegex)) {
        const hex = m[0].length === 4
          ? '#' + m[1][0] + m[1][0] + m[1][1] + m[1][1] + m[1][2] + m[1][2]
          : m[0].toLowerCase();
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
        const isWhiteBlack = (r > 230 && g > 230 && b > 230) || (r < 25 && g < 25 && b < 25);
        if (!isGray && !isWhiteBlack) {
          colorFreq[hex] = (colorFreq[hex] || 0) + 1;
        }
      }
      // Sort by frequency (most common = brand color)
      extractedColors = Object.entries(colorFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex]) => hex);

      // ── Extract image URLs from HTML ──
      const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const ogImageRegex = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["'][^>]*>/gi;
      const bgImgRegex = /url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp|gif)[^"')]*?)["']?\)/gi;
      
      const rawImages = new Set();
      
      for (const m of html.matchAll(ogImageRegex)) rawImages.add(m[1]);
      for (const m of html.matchAll(imgSrcRegex)) {
        const src = m[1];
        if (!src.startsWith('data:') && src.length > 10) rawImages.add(src);
      }
      for (const m of html.matchAll(bgImgRegex)) rawImages.add(m[1]);

      // Resolve relative URLs
      const baseUrl = new URL(url);
      extractedImages = [...rawImages]
        .map(src => {
          try {
            return new URL(src, baseUrl).href;
          } catch { return null; }
        })
        .filter(u => u && (u.startsWith('http://') || u.startsWith('https://')))
        .filter(u => !u.includes('pixel') && !u.includes('tracking') && !u.includes('1x1') && !u.includes('icon') && !u.includes('favicon'))
        .slice(0, 12);

      // ── Extract logo URL — try multiple patterns ──
      let logoUrl = '';

      // 1. og:image meta tag (most reliable)
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      if (ogMatch) {
        try { logoUrl = new URL(ogMatch[1], baseUrl).href; } catch {}
      }

      // 2. <link rel="icon" or "apple-touch-icon"> — high-res
      if (!logoUrl) {
        const iconMatch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
          || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i);
        if (iconMatch) {
          try { logoUrl = new URL(iconMatch[1], baseUrl).href; } catch {}
        }
      }

      // 3. <img> with "logo" in class, id, alt, or src
      if (!logoUrl) {
        const logoImgMatch = html.match(/<img[^>]+(?:class|id|alt|src)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)
          || html.match(/<img[^>]+src=["']([^"']*logo[^"']*)["']/i);
        if (logoImgMatch) {
          try { logoUrl = new URL(logoImgMatch[1], baseUrl).href; } catch {}
        }
      }

      // 4. Fallback: first og:image from extractedImages
      if (!logoUrl && extractedImages.length > 0) {
        logoUrl = extractedImages[0];
      }

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

      // If no logo from markup, pass what we extracted to LLM
      if (!logoUrl && extractedImages.length > 0) {
        logoUrl = extractedImages[0];
      }

      // Pass extracted data to result early so LLM can use it
      req._extracted = { extractedColors, extractedImages, logoUrl };

    } catch {
      websiteContent = `Website URL: ${url}`;
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `
You are an expert WhatsApp business automation consultant analyzing a real business website to produce ACCURATE estimates.

Website URL: ${url}
Website content: ${websiteContent}
Content fetched successfully: ${fetchedOk}
Colors already extracted from CSS: ${JSON.stringify(extractedColors)}
Images already extracted from HTML: ${JSON.stringify(extractedImages.slice(0, 6))}

YOUR TASK:
1. Identify the exact business type, industry, and scale from the content.
2. Estimate realistic monthly WhatsApp metrics based on industry benchmarks AND website signals.
3. Write a personalized Hebrew WhatsApp bot opening message.
4. Pick the best 3 brand colors from the extracted colors list (or infer if empty).
5. Pick up to 6 best image URLs from the extracted images that best represent the business visually.

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

OUTPUT FIELDS:
- business_name: the actual business name from the site
- business_type: short industry label in ${lang === "en" ? "English" : "Hebrew"} (2–4 words)
- insight: 1–2 ${lang === "en" ? "English" : "Hebrew"} sentences explaining the WhatsApp opportunity for THIS business
- monthly_messages: integer
- monthly_customers: integer
- avg_deal_value: integer (NIS)
- opening_message: ${lang === "en" ? "English" : "Hebrew"} WhatsApp greeting, 1–2 sentences, emoji
- follow_up_message: ${lang === "en" ? "English" : "Hebrew"} follow-up, 1–2 sentences
- info_message: ${lang === "en" ? "English" : "Hebrew"} informational response, 2–3 sentences
- closing_message: ${lang === "en" ? "English" : "Hebrew"} confirmation, 1 sentence
- quick_reply_1: short ${lang === "en" ? "English" : "Hebrew"} button text (4–6 words)
- quick_reply_2: short ${lang === "en" ? "English" : "Hebrew"} button text (4–6 words)
- logo_url: best candidate logo URL from extracted images, or empty string
- brand_colors: pick the 3 most representative/prominent brand colors. IMPORTANT: The extracted colors list is sorted by frequency (most used = most dominant). Prefer the top colors. If the site belongs to a well-known brand (e.g. Buildo = purple/lavender), use your knowledge of the brand's actual colors. These MUST be actual hex codes.
- site_images: array of up to 6 image URLs from the extracted images list that best represent the business visually (real images only, no icons)
- keywords: array of 3–5 English keywords for Facebook Ads Library search
- target_audience: 1 sentence describing the typical customer
- usp: unique selling proposition in ${lang === "en" ? "English" : "Hebrew"}, 1 sentence

Return ONLY valid JSON.
`,
      response_json_schema: {
        type: "object",
        properties: {
          business_name: { type: "string" },
          business_type: { type: "string" },
          insight: { type: "string" },
          monthly_messages: { type: "number" },
          monthly_customers: { type: "number" },
          avg_deal_value: { type: "number" },
          opening_message: { type: "string" },
          follow_up_message: { type: "string" },
          info_message: { type: "string" },
          closing_message: { type: "string" },
          quick_reply_1: { type: "string" },
          quick_reply_2: { type: "string" },
          logo_url: { type: "string" },
          brand_colors: { type: "array", items: { type: "string" } },
          site_images: { type: "array", items: { type: "string" } },
          keywords: { type: "array", items: { type: "string" } },
          target_audience: { type: "string" },
          usp: { type: "string" },
        },
        required: ["business_name", "business_type", "insight", "monthly_messages", "monthly_customers", "avg_deal_value", "opening_message", "follow_up_message", "info_message", "closing_message", "quick_reply_1", "quick_reply_2", "keywords", "brand_colors", "logo_url", "site_images"]
      }
    });

    // If LLM returned no colors, use top extracted colors
    if (!result.brand_colors?.length || result.brand_colors.every(c => !c.startsWith('#'))) {
      result.brand_colors = extractedColors.slice(0, 3);
    }
    // Validate hex format
    result.brand_colors = (result.brand_colors || []).filter(c => /^#[0-9a-fA-F]{3,6}$/.test(c)).slice(0, 5);
    if (!result.site_images?.length && extractedImages.length) {
      result.site_images = extractedImages.slice(0, 6);
    }

    console.log('brand_colors returned:', JSON.stringify(result.brand_colors));
    console.log('top extracted colors:', JSON.stringify(extractedColors.slice(0, 5)));

    // Save scanned site to DB (fire-and-forget)
    base44.asServiceRole.entities.ScannedSite.create({
      url,
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