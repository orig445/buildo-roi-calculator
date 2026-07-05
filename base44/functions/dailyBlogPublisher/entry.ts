import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { connect } from "npm:framer-api";

// ─── 20 topic pool: rotates daily so no repeats ─────────────────────────────
const TOPICS = [
  { topic: "5 ways AI automation saves small businesses 10 hours a week", keyword: "AI automation for small business", intent: "informational" },
  { topic: "How to generate Facebook ads that convert using AI in 2025", keyword: "AI Facebook ads generator", intent: "transactional" },
  { topic: "AEO: What is Answer Engine Optimization and why your business needs it", keyword: "AEO optimization for businesses", intent: "informational" },
  { topic: "WhatsApp marketing automation: complete guide for local businesses", keyword: "WhatsApp marketing automation guide", intent: "informational" },
  { topic: "AI marketing vs traditional agency: real cost and ROI comparison", keyword: "AI marketing vs marketing agency cost", intent: "commercial" },
  { topic: "How Israeli small businesses grow 3x faster with AI marketing", keyword: "AI marketing Israeli small businesses", intent: "commercial" },
  { topic: "Best AI marketing tools in Israel for 2025", keyword: "AI marketing tools Israel 2025", intent: "commercial" },
  { topic: "Instagram Reels vs Facebook Ads: which drives more leads for local businesses", keyword: "Instagram Reels vs Facebook Ads local", intent: "informational" },
  { topic: "How to write a WhatsApp campaign that gets replies in 5 minutes", keyword: "WhatsApp campaign messages that convert", intent: "informational" },
  { topic: "Google Ads vs Facebook Ads for local businesses: 2025 data", keyword: "Google Ads vs Facebook Ads 2025", intent: "commercial" },
  { topic: "How to generate 100+ leads per month without an agency", keyword: "generate leads without marketing agency", intent: "commercial" },
  { topic: "AI content marketing: create 30 days of posts in 1 hour", keyword: "AI content marketing strategy", intent: "informational" },
  { topic: "Local SEO without paid ads: rank on Google for free", keyword: "local SEO without paid ads strategy", intent: "informational" },
  { topic: "Voice search SEO: optimize for Siri, Alexa, and ChatGPT answers", keyword: "voice search SEO optimization 2025", intent: "informational" },
  { topic: "GEO (Generative Engine Optimization): the new SEO that beats Google", keyword: "GEO generative engine optimization", intent: "informational" },
  { topic: "How to calculate marketing ROI for small businesses", keyword: "marketing ROI calculation small business", intent: "informational" },
  { topic: "5 signs competitors are stealing your customers with AI marketing", keyword: "competitors AI marketing losing customers", intent: "commercial" },
  { topic: "Why automated campaigns outperform manual marketing every time", keyword: "automated marketing campaigns benefits", intent: "informational" },
  { topic: "7 email marketing automation flows every business needs", keyword: "email marketing automation flows", intent: "informational" },
  { topic: "Build a complete AI marketing funnel from scratch in one day", keyword: "AI marketing funnel builder guide", intent: "informational" },
];

function getTodaysTopics() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const i1 = dayOfYear % TOPICS.length;
  const i2 = (dayOfYear + 10) % TOPICS.length;
  return i1 !== i2 ? [TOPICS[i1], TOPICS[i2]] : [TOPICS[i1], TOPICS[(i2 + 1) % TOPICS.length]];
}

async function writeBlog(sdk: ReturnType<typeof createClientFromRequest>, t: typeof TOPICS[0]) {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const result = await sdk.integrations.Core.InvokeLLM({
    prompt: `You are the lead SEO content strategist at Buildo (buildoai.com), an AI marketing platform for small businesses.

Write a complete, deeply actionable blog post targeting:
- Primary keyword: "${t.keyword}"
- Topic: "${t.topic}"
- Intent: ${t.intent}
- Audience: Small business owners and marketers
- Tone: Expert, helpful, direct — no fluff
- Today's date: ${dateStr}

STRUCTURE (return only the JSON below — no markdown fences):
{
  "title": "<keyword-rich H1, 60-70 chars>",
  "slug": "<4-6 word lowercase-hyphenated slug>",
  "excerpt": "<2 compelling sentences, 150-160 chars>",
  "content": "<1200-1500 word HTML with: h2/h3 headings, ul/ol lists, strong tags, real stats, 3-4 action sections, one CTA link to https://buildoai.com/worker-onboarding, FAQ section at end with 3 Q&As for AEO, mention Israel/local context for GEO>",
  "metaTitle": "<55-60 char SEO title>",
  "metaDescription": "<150-160 char description with keyword>",
  "tags": "<3-5 comma-separated tags>",
  "readingTime": <integer minutes>
}`,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string" },
        content: { type: "string" },
        metaTitle: { type: "string" },
        metaDescription: { type: "string" },
        tags: { type: "string" },
        readingTime: { type: "number" },
      },
      required: ["title", "slug", "excerpt", "content", "metaTitle", "metaDescription", "tags", "readingTime"],
    },
  });
  return result as { title: string; slug: string; excerpt: string; content: string; metaTitle: string; metaDescription: string; tags: string; readingTime: number };
}

async function makeCoverImage(sdk: ReturnType<typeof createClientFromRequest>, title: string): Promise<string> {
  try {
    const r = await sdk.integrations.Core.GenerateImage({
      prompt: `Modern professional blog cover image, purple gradient background (#7c3aed to #1a0a2e), subtle geometric patterns, clean and minimal, for blog post titled: "${title}". No text. 16:9. Suitable for AI/marketing tech blog.`,
    });
    return (r as { url?: string }).url ?? "";
  } catch {
    return "";
  }
}

Deno.serve(async (req) => {
  try {
    const sdk = createClientFromRequest(req);

    // Auth: admin user OR automation (no token)
    try {
      const u = await sdk.auth.me();
      if (u.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    } catch { /* automation – no user token */ }

    const FRAMER_KEY = Deno.env.get("framercmsapi");
    const FRAMER_URL = Deno.env.get("FRAMER_PROJECT_URL");

    if (!FRAMER_KEY) return Response.json({ error: "Secret 'framercmsapi' not set" }, { status: 500 });
    if (!FRAMER_URL) return Response.json({ error: "Secret 'FRAMER_PROJECT_URL' not set — add your Framer project URL" }, { status: 500 });

    const topics = getTodaysTopics();
    console.log("[dailyBlogPublisher] Topics:", topics.map(t => t.keyword).join(" | "));

    const published: Array<Record<string, unknown>> = [];

    for (const topic of topics) {
      console.log("[dailyBlogPublisher] Writing:", topic.topic);
      const blog = await writeBlog(sdk, topic);
      console.log("[dailyBlogPublisher] ✓ Blog:", blog.title);

      const imageUrl = await makeCoverImage(sdk, blog.title);

      // Framer CMS
      const framer = await connect(FRAMER_URL, FRAMER_KEY);
      try {
        const collections = await framer.getCollections();
        console.log("[dailyBlogPublisher] Collections:", collections.map((c: { name: string }) => c.name).join(", "));

        const col = collections.find((c: { name: string }) =>
          c.name.toLowerCase().includes("blog") ||
          c.name.toLowerCase().includes("post") ||
          c.name.toLowerCase().includes("article")
        );

        if (!col) {
          published.push({ error: "No blog collection found", collections: collections.map((c: { name: string }) => c.name) });
          continue;
        }

        const fields: Array<{ id: string; name: string; type: string }> = await col.getFields();
        console.log("[dailyBlogPublisher] Fields:", fields.map(f => f.name).join(", "));

        const fd: Record<string, unknown> = {};
        for (const f of fields) {
          const n = f.name.toLowerCase();
          if (n === "title" || n === "name") fd[f.id] = blog.title;
          else if (n.includes("excerpt") || n.includes("description") || n.includes("summary") || n.includes("subtitle")) fd[f.id] = blog.excerpt;
          else if (n.includes("content") || n.includes("body") || n.includes("rich") || n === "text") fd[f.id] = blog.content;
          else if ((n.includes("image") || n.includes("cover") || n.includes("thumbnail")) && f.type === "image" && imageUrl) fd[f.id] = { url: imageUrl };
          else if (n.includes("date") || n.includes("published")) fd[f.id] = new Date().toISOString();
          else if (n.includes("tag") || n.includes("categor")) fd[f.id] = blog.tags;
          else if (n.includes("reading") || n.includes("minutes")) fd[f.id] = blog.readingTime;
          else if (n === "meta title" || n === "seo title") fd[f.id] = blog.metaTitle;
          else if (n === "meta description" || n === "seo description") fd[f.id] = blog.metaDescription;
          else if (n.includes("keyword")) fd[f.id] = topic.keyword;
          else if (n.includes("author")) fd[f.id] = "Buildo AI";
        }

        const uniqueId = `buildo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await col.addItems([{ id: uniqueId, slug: blog.slug, draft: false, fieldData: fd }]);

        // Publish & deploy to production
        const pub = await framer.publish();
        await framer.deploy(pub.deployment.id);

        console.log("[dailyBlogPublisher] ✅ Live:", blog.slug);
        published.push({ success: true, title: blog.title, slug: blog.slug, keyword: topic.keyword });

      } finally {
        await framer.disconnect();
      }
    }

    // Telegram recap
    try {
      const ok = published.filter(p => p.success).length;
      const lines = published.map(p =>
        p.success ? `✅ ${p.title}` : `❌ ${p.error}`
      ).join("\n");
      await sdk.functions.invoke("sendTelegramNotification", {
        message: `📝 *Daily Blog Publisher*\n\nPublished ${ok}/2 posts to Framer:\n${lines}\n\n_buildoai.com 🚀_`,
      });
    } catch { /* ignore */ }

    return Response.json({ success: true, published });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[dailyBlogPublisher] Fatal:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
});