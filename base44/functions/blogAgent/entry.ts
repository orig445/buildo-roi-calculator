import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { withConnection } from 'npm:framer-api@0.1.18';

// ─────────────────────────────────────────────────────────────────────────────
// Buildo Blog Agent
//
// A single backend function that powers the whole "AI blog → Framer" automation.
// Actions (via body.action):
//   • inspectFramer  – list Framer CMS collections + their fields (setup helper)
//   • proposeTopics  – research fresh, high-traffic blog topics
//   • generate       – write ONE full SEO/AEO/GEO post (+ hero image) for preview
//   • publish        – generate (or accept) a post and publish it to Framer CMS
//   • runCycle       – scheduled entry point: pull next queued topic, write it,
//                      publish it, and log the result. Default when no action.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  singleton: 'main',
  brand_name: 'Buildo',
  site_url: 'https://buildoai.com',
  audience: 'small and medium business owners who want to grow with AI-powered marketing',
  brand_context:
    'Buildo (Bildo) is an AI-powered marketing platform that acts like a full marketing team — it runs SEO, paid ads, social media, content and lead follow-up automatically for small and medium businesses, with no marketing expertise required.',
  language: 'en',
  seed_keywords: 'AI marketing, marketing automation, SEO for small business, digital marketing tools, lead generation, social media automation',
  framer_collection_id: '',
  framer_collection_name: 'Blog',
  publish_as_draft: false,
  auto_propose: true,
  generate_hero_image: true,
};

const slugify = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Find a field by fuzzy name match (exact-ish first, then contains)
function pickField(fields: any[], names: string[], allowedTypes?: string[]) {
  const pool = allowedTypes ? fields.filter((f) => allowedTypes.includes(f.type)) : fields;
  const wanted = names.map(norm);
  return (
    pool.find((f) => wanted.includes(norm(f.name))) ||
    pool.find((f) => wanted.some((w) => norm(f.name).includes(w))) ||
    null
  );
}

async function loadConfig(base44: any) {
  try {
    const rows = await base44.asServiceRole.entities.BlogAgentConfig.list();
    const existing = Array.isArray(rows) ? rows.find((r: any) => r.singleton === 'main') || rows[0] : null;
    if (existing) return { ...DEFAULT_CONFIG, ...existing };
  } catch (_) {
    // entity may not exist yet — fall back to defaults
  }
  return { ...DEFAULT_CONFIG };
}

// ─── Content engine ──────────────────────────────────────────────────────────
async function generatePost(base44: any, cfg: any, topic: any) {
  const lang = cfg.language || 'en';
  const langLabel = lang === 'he' ? 'Hebrew' : 'English';

  const prompt = `You are the lead content strategist and SEO/AEO/GEO copywriter for ${cfg.brand_name}.

ABOUT THE BRAND:
${cfg.brand_context}
Website: ${cfg.site_url}
Audience: ${cfg.audience}

TASK: Write ONE complete, publish-ready blog post in ${langLabel} that will rank on Google AND get cited by AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Gemini).

TOPIC: ${topic.title}
PRIMARY KEYWORD: ${topic.target_keyword || topic.title}
SECONDARY KEYWORDS: ${topic.secondary_keywords || ''}
ANGLE / SEARCH INTENT: ${topic.angle || 'Best, most useful, most complete answer for this query'}

Use up-to-date facts from the web where relevant. Optimize simultaneously for:
• SEO — keyword in title/H1/first 100 words, semantic coverage, scannable structure, internal-link cues, 1200–1800 words.
• AEO (Answer Engine Optimization) — lead with a crisp 2–3 sentence direct answer under the intro; use clear question-style H2s; add a real FAQ section (5–6 Q&As).
• GEO (Generative Engine Optimization) — include citable, specific facts and stats; define entities clearly; use confident, quotable sentences that an LLM can lift verbatim.

CONVERSION: naturally weave in how ${cfg.brand_name} solves the reader's problem, and finish with ONE clear CTA to ${cfg.site_url}. Do not be spammy — earn the click.

FORMATTING RULES for content_html:
• Valid semantic HTML only (h2, h3, p, ul, ol, li, strong, em, a, blockquote, table). NO <h1> (the title is the H1). NO inline styles, NO <html>/<head>/<body>.
• Open with a 1–2 paragraph intro, then a bolded "Quick answer:" paragraph.
• Use descriptive H2/H3 subheadings phrased as the questions people search.
• Include at least one bulleted or numbered list and, where it fits, one comparison <table>.
• End with a short "Key takeaways" list and a compelling CTA paragraph linking to ${cfg.site_url}.

Return JSON exactly matching the schema.`;

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'SEO H1 headline, <= 65 chars, includes primary keyword' },
      slug: { type: 'string', description: 'url-friendly-slug' },
      meta_title: { type: 'string', description: 'SEO title tag, <= 60 chars' },
      meta_description: { type: 'string', description: 'Meta description, 140-160 chars, compelling' },
      excerpt: { type: 'string', description: '1-2 sentence summary / dek' },
      content_html: { type: 'string', description: 'Full article body as semantic HTML (no H1)' },
      key_takeaways: { type: 'array', items: { type: 'string' } },
      faqs: {
        type: 'array',
        items: {
          type: 'object',
          properties: { question: { type: 'string' }, answer: { type: 'string' } },
          required: ['question', 'answer'],
        },
      },
      tags: { type: 'array', items: { type: 'string' } },
      hero_image_prompt: { type: 'string', description: 'Vivid prompt for a wide 16:9 hero graphic, no text in image' },
      target_keyword: { type: 'string' },
      secondary_keywords: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'slug', 'meta_title', 'meta_description', 'excerpt', 'content_html', 'faqs'],
  };

  const post = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: schema,
  });

  post.slug = slugify(post.slug || post.title);

  // Build FAQ + Article JSON-LD for structured data (AEO/GEO)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (post.faqs || []).map((f: any) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description,
    author: { '@type': 'Organization', name: cfg.brand_name },
    publisher: { '@type': 'Organization', name: cfg.brand_name },
    datePublished: new Date().toISOString(),
  };
  post.json_ld = JSON.stringify([articleLd, faqLd]);

  // Append a visible FAQ block to the HTML (helps both readers and parsers)
  if (post.faqs?.length) {
    const faqHtml =
      `\n<h2>Frequently asked questions</h2>\n` +
      post.faqs
        .map((f: any) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
        .join('\n');
    if (!/frequently asked questions/i.test(post.content_html || '')) {
      post.content_html = (post.content_html || '') + faqHtml;
    }
  }

  // Hero graphic
  if (cfg.generate_hero_image && post.hero_image_prompt) {
    try {
      const img = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `${post.hero_image_prompt}. Wide 16:9 editorial blog hero illustration, modern, clean, vibrant, high quality, NO text, NO watermark.`,
      });
      post.hero_image_url = img?.url || null;
    } catch (e) {
      post.hero_image_url = null;
    }
  }

  return post;
}

// ─── Framer helpers ──────────────────────────────────────────────────────────
function framerCreds(body: any) {
  const apiKey = body?.framerApiKey || Deno.env.get('FRAMER_API_KEY');
  const projectUrl = body?.framerProjectUrl || Deno.env.get('FRAMER_PROJECT_URL');
  if (!apiKey) throw new Error("Framer API key missing. Add secret 'FRAMER_API_KEY' in base44 settings.");
  if (!projectUrl) throw new Error("Framer project URL missing. Add secret 'FRAMER_PROJECT_URL' (e.g. https://framer.com/projects/Website--xxxx).");
  return { apiKey, projectUrl };
}

async function inspectFramer(body: any) {
  const { apiKey, projectUrl } = framerCreds(body);
  return await withConnection(projectUrl, async (framer: any) => {
    const collections = await framer.getCollections();
    const out = [];
    for (const c of collections) {
      let fields: any[] = [];
      try {
        fields = await c.getFields();
      } catch (_) {
        fields = [];
      }
      out.push({
        id: c.id,
        name: c.name,
        fields: (fields || []).map((f: any) => ({ id: f.id, name: f.name, type: f.type })),
      });
    }
    return { collections: out };
  }, apiKey);
}

function buildFieldData(fields: any[], post: any, cfg: any) {
  const fd: Record<string, any> = {};
  const setStr = (f: any, value: string) => {
    if (!f || value == null) return;
    if (f.type === 'formattedText') fd[f.id] = { type: 'formattedText', value: String(value), contentType: 'html' };
    else if (f.type === 'string') fd[f.id] = { type: 'string', value: String(value) };
  };

  const titleF = pickField(fields, ['title', 'name', 'heading'], ['string']);
  setStr(titleF, post.title);

  const contentF = pickField(fields, ['content', 'body', 'article', 'post', 'richtext', 'text'], ['formattedText']);
  setStr(contentF, post.content_html);

  const excerptF = pickField(fields, ['excerpt', 'summary', 'subtitle', 'intro', 'dek', 'preview'], ['string', 'formattedText']);
  setStr(excerptF, post.excerpt);

  const metaTitleF = pickField(fields, ['seotitle', 'metatitle'], ['string']);
  setStr(metaTitleF, post.meta_title);

  const metaDescF = pickField(fields, ['seodescription', 'metadescription', 'seodesc'], ['string', 'formattedText']);
  setStr(metaDescF, post.meta_description);

  const imageF = pickField(fields, ['image', 'cover', 'hero', 'thumbnail', 'featured', 'photo'], ['image']);
  if (imageF && post.hero_image_url) {
    fd[imageF.id] = { type: 'image', value: post.hero_image_url, alt: post.title };
  }

  const dateF = pickField(fields, ['date', 'published', 'publishdate', 'publishedat'], ['date']);
  if (dateF) fd[dateF.id] = { type: 'date', value: new Date().toISOString() };

  return fd;
}

async function publishToFramer(body: any, cfg: any, post: any) {
  const { apiKey, projectUrl } = framerCreds(body);
  return await withConnection(projectUrl, async (framer: any) => {
    const collections = await framer.getCollections();
    let col =
      (cfg.framer_collection_id && collections.find((c: any) => c.id === cfg.framer_collection_id)) ||
      collections.find((c: any) => norm(c.name) === norm(cfg.framer_collection_name || 'blog')) ||
      collections.find((c: any) => norm(c.name).includes('blog') || norm(c.name).includes('post')) ||
      collections[0];
    if (!col) throw new Error('No CMS collection found in this Framer project.');

    const fields = await col.getFields();
    const fieldData = buildFieldData(fields, post, cfg);
    if (Object.keys(fieldData).length === 0) {
      throw new Error(
        `Could not map post fields to collection "${col.name}". Fields available: ${fields.map((f: any) => `${f.name}(${f.type})`).join(', ')}`
      );
    }

    // Ensure slug is unique within the collection
    let slug = post.slug || slugify(post.title);
    try {
      const existing = await col.getItems();
      const taken = new Set((existing || []).map((i: any) => i.slug));
      if (taken.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    } catch (_) { /* ignore */ }

    await col.addItems([{ slug, fieldData }]);

    // Resolve the created item id
    let itemId = null;
    try {
      const after = await col.getItems();
      itemId = (after || []).find((i: any) => i.slug === slug)?.id || null;
    } catch (_) { /* ignore */ }

    const published_url = `${(cfg.site_url || '').replace(/\/$/, '')}/blog/${slug}`;
    return { collectionId: col.id, collectionName: col.name, itemId, slug, published_url };
  }, apiKey);
}

// ─── Topic research ──────────────────────────────────────────────────────────
async function proposeTopics(base44: any, cfg: any, body: any) {
  const count = Math.min(Math.max(Number(body?.count) || 6, 1), 12);
  let existingTitles: string[] = body?.existingTitles || [];
  try {
    const rows = await base44.asServiceRole.entities.BlogTopic.list();
    existingTitles = existingTitles.concat((rows || []).map((r: any) => r.title));
  } catch (_) { /* ignore */ }

  const prompt = `You are an SEO content strategist for ${cfg.brand_name}.
${cfg.brand_context}
Audience: ${cfg.audience}
Seed themes / keywords: ${body?.seedKeywords || cfg.seed_keywords}

Research the web for current, high-intent search topics that could realistically drive organic traffic for this brand. Prefer topics with strong search demand and clear commercial or informational intent that lets us naturally recommend ${cfg.brand_name}.

Avoid duplicating these existing titles: ${existingTitles.slice(0, 40).join(' | ') || '(none)'}.

Propose ${count} distinct blog topics. For each: a compelling working title, the primary target keyword, 2-4 secondary keywords, the angle/search intent, and a one-line rationale (why it drives traffic).`;

  const schema = {
    type: 'object',
    properties: {
      topics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            target_keyword: { type: 'string' },
            secondary_keywords: { type: 'array', items: { type: 'string' } },
            angle: { type: 'string' },
            rationale: { type: 'string' },
          },
          required: ['title', 'target_keyword'],
        },
      },
    },
    required: ['topics'],
  };

  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: schema,
  });
  return { topics: res.topics || [] };
}

// ─── Scheduled cycle ─────────────────────────────────────────────────────────
async function runCycle(base44: any, cfg: any, body: any) {
  const Topic = base44.asServiceRole.entities.BlogTopic;
  const all = await Topic.list('priority').catch(() => Topic.list());
  let topic = (all || [])
    .filter((t: any) => t.status === 'queued')
    .sort((a: any, b: any) => (a.priority ?? 100) - (b.priority ?? 100))[0];

  // Auto-propose a topic if the queue is empty
  if (!topic && cfg.auto_propose) {
    const { topics } = await proposeTopics(base44, cfg, { count: 1 });
    if (topics[0]) {
      topic = await Topic.create({ ...topics[0], secondary_keywords: (topics[0].secondary_keywords || []).join(', '), status: 'queued', source: 'ai' });
    }
  }
  if (!topic) return { skipped: true, reason: 'No queued topics and auto-propose is off.' };

  await Topic.update(topic.id, { status: 'generating', error: '' });
  try {
    const post = await generatePost(base44, cfg, topic);
    const pub = await publishToFramer(body, cfg, post);
    await Topic.update(topic.id, {
      status: 'published',
      generated: { ...post, content_html: (post.content_html || '').slice(0, 4000) },
      framer_item_id: pub.itemId || '',
      published_url: pub.published_url,
      published_at: new Date().toISOString(),
    });
    return { published: true, topicId: topic.id, title: post.title, ...pub };
  } catch (e: any) {
    await Topic.update(topic.id, { status: 'failed', error: String(e?.message || e) });
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    const action = body.action || 'runCycle';
    const cfg = await loadConfig(base44);

    switch (action) {
      case 'inspectFramer':
        return Response.json(await inspectFramer(body), { headers: cors });
      case 'proposeTopics':
        return Response.json(await proposeTopics(base44, cfg, body), { headers: cors });
      case 'generate': {
        if (!body.topic?.title) return Response.json({ error: 'Missing topic.title' }, { status: 400, headers: cors });
        const post = await generatePost(base44, cfg, body.topic);
        return Response.json({ post }, { headers: cors });
      }
      case 'publish': {
        const post = body.post || (body.topic ? await generatePost(base44, cfg, body.topic) : null);
        if (!post) return Response.json({ error: 'Missing post or topic' }, { status: 400, headers: cors });
        const pub = await publishToFramer(body, cfg, post);
        // If a topicId was supplied, record the result
        if (body.topicId) {
          try {
            await base44.asServiceRole.entities.BlogTopic.update(body.topicId, {
              status: 'published',
              generated: { ...post, content_html: (post.content_html || '').slice(0, 4000) },
              framer_item_id: pub.itemId || '',
              published_url: pub.published_url,
              published_at: new Date().toISOString(),
            });
          } catch (_) { /* ignore */ }
        }
        return Response.json({ post, ...pub }, { headers: cors });
      }
      case 'runCycle':
        return Response.json(await runCycle(base44, cfg, body), { headers: cors });
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400, headers: cors });
    }
  } catch (error: any) {
    console.error('blogAgent error:', error?.message || error);
    return Response.json({ error: String(error?.message || error) }, { status: 500, headers: cors });
  }
});
