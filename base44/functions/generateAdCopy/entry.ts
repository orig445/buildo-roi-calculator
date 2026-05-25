import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { businessInfo, style } = await req.json();

    if (!businessInfo) {
      return Response.json({ error: 'חסר businessInfo' }, { status: 400 });
    }

    const styleInstructions = {
      emotional: 'רגשי ומחבר — דבר ישירות ללב של הלקוח, השתמש בסיפור ואמפתיה',
      direct: 'ישיר ועסקי — דגש על תועלת ברורה, מספרים, והנעה לפעולה חזקה',
      humorous: 'הומוריסטי ומשחקי — טון קליל, חכם, עם ציוץ שגורם לחיוך',
      luxury: 'יוקרתי ופרימיום — שפה גבוהה, בלעדיות, איכות ללא פשרות',
      urgency: 'דחיפות ומוגבלות — הצעה לזמן מוגבל, "עכשיו או לעולם לא", FOMO',
    };

    const styleImageDirection = {
      emotional: {
        mood: 'warm, emotionally resonant, authentic, cinematic',
        lighting: 'golden hour soft diffused light, warm tones, gentle bokeh background',
        composition: 'close-up human face showing genuine joy or relief, rule of thirds, shallow depth of field',
        vibe: 'lifestyle documentary photography, real people, candid moments, trust and connection',
      },
      direct: {
        mood: 'clean, confident, modern, high-impact',
        lighting: 'studio-quality bright even lighting, crisp shadows, professional',
        composition: 'bold product hero shot or confident person, centered composition, strong visual hierarchy',
        vibe: 'commercial advertising photography, premium product display, business clarity',
      },
      humorous: {
        mood: 'playful, colorful, vibrant, fun, eye-catching',
        lighting: 'bright pop-art inspired lighting, vivid saturated colors, dynamic',
        composition: 'unexpected creative angle, exaggerated expressions, playful props',
        vibe: 'editorial humor, visual pun, bold graphic elements, cheerful energy',
      },
      luxury: {
        mood: 'ultra-premium, sophisticated, exclusive, timeless',
        lighting: 'dramatic chiaroscuro lighting, deep shadows, subtle rim light, moody atmosphere',
        composition: 'architectural symmetry, negative space, minimalist elegance, cinematic wide angle',
        vibe: 'Vogue-level fashion photography, dark rich backgrounds, gold and black palette, aspirational',
      },
      urgency: {
        mood: 'dynamic, powerful, high-energy, immediate action',
        lighting: 'dramatic high-contrast lighting, intense highlights, urgent red/orange tones',
        composition: 'diagonal lines, motion blur, person in action, explosive energy',
        vibe: 'sports advertising energy, breaking news urgency, visceral impact, must-act-now feeling',
      },
    };

    const imgDir = styleImageDirection[style] || styleImageDirection.direct;

    const prompt = `You are a world-class creative director and Facebook advertising expert who has managed $100M+ in ad spend.

Business Details:
- Name: ${businessInfo.name}
- Industry: ${businessInfo.type}
- Product/Service: ${businessInfo.product}
- Target Audience: ${businessInfo.audience}
- Unique Value Proposition: ${businessInfo.usp}

Ad Style: ${styleInstructions[style] || styleInstructions.direct}

TASK: Create 3 high-converting Facebook ad variants in Hebrew. Each ad must be psychologically compelling and follow proven direct-response advertising principles (AIDA, PAS, or Hook-Story-Offer).

For each ad provide:
1. headline — Main headline (max 40 chars). Must create curiosity, promise benefit, or trigger emotion. Use power words.
2. subheadline — Supporting line (max 25 chars). Amplify the headline or add social proof.
3. body — Ad body copy (2-3 short punchy sentences, max 150 chars). Tell a micro-story or use the PAS framework (Problem-Agitate-Solve). Make every word earn its place.
4. cta — Call to action button text (max 20 chars). Action-oriented, specific, creates urgency.
5. imagePrompt — A highly detailed, professional image generation prompt in English for a winning Facebook ad visual for this specific business. 

The imagePrompt MUST follow this exact structure and be very detailed (minimum 80 words):
"[Main subject description with specific details]. [Scene/environment]. [Lighting: ${imgDir.lighting}]. [Composition: ${imgDir.composition}]. [Mood/atmosphere: ${imgDir.mood}]. [Visual style: ${imgDir.vibe}]. Shot on Phase One IQ4 camera, 85mm lens, ultra-sharp 8K resolution, award-winning commercial advertising photography. No text, no watermarks, no logos. Photorealistic."

Also create one Hebrew marketing email template:
- emailSubject: Subject line (max 60 chars)
- emailPreview: Preview text (max 90 chars)  
- emailBody: Full HTML email with clean inline CSS, 3-4 sections, compelling copy, and a prominent CTA button`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          ads: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                headline: { type: 'string' },
                subheadline: { type: 'string' },
                body: { type: 'string' },
                cta: { type: 'string' },
                imagePrompt: { type: 'string' },
              },
            },
          },
          emailSubject: { type: 'string' },
          emailPreview: { type: 'string' },
          emailBody: { type: 'string' },
        },
      },
    });

    console.log('LLM result ads count:', (result.ads || []).length);

    const ads = result.ads || [];
    const emailTemplate = {
      subject: result.emailSubject || '',
      preview: result.emailPreview || '',
      body: result.emailBody || '',
    };

    const brandColors = (businessInfo.colors || businessInfo.brand_colors || []).join(', ');
    const rawLogoUrl = businessInfo.logo || businessInfo.logo_url || null;
    const logoUrl = rawLogoUrl && rawLogoUrl.startsWith('http') ? rawLogoUrl : null;

    console.log('logoUrl:', logoUrl, 'brandColors:', brandColors, 'style:', style);

    // Generate images in parallel with rich, detailed prompts
    const adsWithImages = await Promise.all(
      ads.map(async (ad, index) => {
        const baseImagePrompt = ad.imagePrompt || '';

        // Enrich the prompt further with business-specific and brand details
        const enrichedPrompt = `${baseImagePrompt}${brandColors ? ` Brand color palette reference: ${brandColors}.` : ''} This is for a ${businessInfo.type} business targeting ${businessInfo.audience || 'general consumers'}. The image should immediately communicate: ${businessInfo.usp || businessInfo.product}. Facebook feed aspect ratio 1:1, optimized for mobile scroll-stopping impact. Ultra-realistic commercial photography quality.`;

        console.log(`Generating image ${index + 1} with prompt length: ${enrichedPrompt.length}`);

        const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: enrichedPrompt,
          existing_image_urls: logoUrl ? [logoUrl] : undefined,
        });
        return { ...ad, imageUrl: imgResult.url || null };
      })
    );

    return Response.json({ ads: adsWithImages, emailTemplate });
  } catch (error) {
    console.error('generateAdCopy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});