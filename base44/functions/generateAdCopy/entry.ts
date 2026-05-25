import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { businessInfo, style, adIndex = 0, totalAds = 3, pregenerateImages = false } = await req.json();

    if (!businessInfo) {
      return Response.json({ error: 'חסר businessInfo' }, { status: 400 });
    }

    // If pre-generating images only (no style selected yet)
    if (pregenerateImages) {
      const brandColors = (businessInfo.colors || businessInfo.brand_colors || []).join(', ');
      const logoUrl = (businessInfo.logo || businessInfo.logo_url || null);
      const validLogo = logoUrl && logoUrl.startsWith('http') ? logoUrl : null;

      const basePrompt = `Professional commercial photography for ${businessInfo.type} business named ${businessInfo.name}. ${businessInfo.product || businessInfo.usp || ''}. Target audience: ${businessInfo.audience || 'general consumers'}. Facebook ad square 1:1, mobile-optimized, scroll-stopping impact.`;
      const stylePrompts = [
        `${basePrompt} Bright warm lifestyle photography, happy smiling people, natural sunlight, vibrant saturated colors, uplifting and trustworthy mood.`,
        `${basePrompt} Bold professional studio lighting, clean bright background, confident person or product showcase, high contrast, energetic commercial advertising.`,
        `${basePrompt} Colorful playful scene, vivid neon accents, fun joyful atmosphere, bright cheerful energy, eye-catching humorous vibe.`,
      ];

      const images = [];
      for (let i = 0; i < 3; i++) {
        try {
          const enrichedPrompt = `${stylePrompts[i]}${brandColors ? ` Brand color palette reference: ${brandColors}.` : ''} IMPORTANT: Bright, vibrant, colorful photography with saturated colors and energetic lighting - NOT dark, moody, or desaturated. Make it pop with vivid colors and happiness. NO TEXT OVERLAY OR WATERMARKS. Ultra-high quality 8K commercial advertising photography.`;
          const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
            prompt: enrichedPrompt,
            existing_image_urls: validLogo ? [validLogo] : undefined,
          });
          images.push(imgResult?.url || null);
        } catch (imgErr) {
          console.error(`Pre-gen image ${i} failed:`, imgErr.message);
          images.push(null);
        }
      }

      return Response.json({ pregeneratedImages: images });
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
        lighting: 'warm golden sunlight, soft diffused glow, vibrant background',
        composition: 'happy smiling person in bright outdoor setting, natural light, inviting composition',
        mood: 'warm, joyful, inspiring, connected',
        vibe: 'bright uplifting lifestyle photography, real happy people, trust and warmth, saturated colors',
      },
      direct: {
        lighting: 'bright professional studio lighting, clean white or colorful background, high contrast',
        composition: 'bold confident person or product showcase, clean bright setting, direct eye contact',
        mood: 'bold, confident, modern, energetic',
        vibe: 'bright commercial advertising, vibrant backgrounds, product focus, clear call-to-action energy',
      },
      humorous: {
        lighting: 'bright vivid colorful lighting, neon accents, fun energetic background',
        composition: 'playful funny scene with bright colors, unexpected fun angles, happy people laughing',
        mood: 'fun, colorful, vibrant, joyful, eye-catching',
        vibe: 'bright cheerful humor photography, bold neon colors, fun props, playful energy',
      },
      luxury: {
        lighting: 'bright elegant lighting with gold accents, sophisticated colorful background',
        composition: 'elegant person or premium product on bright sophisticated background, luxury feel',
        mood: 'elegant, premium, sophisticated, aspirational',
        vibe: 'bright premium luxury photography, elegant colors, gold accents, sophisticated but vibrant',
      },
      urgency: {
        lighting: 'bright energetic lighting with vibrant red/orange accents, dynamic background',
        composition: 'energetic person in action on bright colorful background, motion and excitement',
        mood: 'energetic, urgent, exciting, powerful',
        vibe: 'bright energetic advertising, vibrant neon colors, dynamic motion, action-packed',
      },
    };

    const imgDir = styleImageDirection[style] || styleImageDirection.direct;

    // Variant hints to ensure 3 different ads
    const variantHints = [
      'Focus on the primary pain point and immediate relief/solution.',
      'Focus on transformation and results — before vs after.',
      'Focus on social proof, trust, and community — people choosing this brand.',
    ];
    const variantHint = variantHints[adIndex] || variantHints[0];

    const prompt = `You are a world-class creative director and Facebook advertising expert who has managed $100M+ in ad spend. You write PERFECT, NATURAL Hebrew with correct grammar, spelling, and tone.

Business Details:
- Name: ${businessInfo.name}
- Industry: ${businessInfo.type}
- Product/Service: ${businessInfo.product}
- Target Audience: ${businessInfo.audience}
- Unique Value Proposition: ${businessInfo.usp}

Ad Style: ${styleInstructions[style] || styleInstructions.direct}

VARIANT FOCUS (ad ${adIndex + 1} of ${totalAds}): ${variantHint}

Create ONE high-converting Facebook ad variant in PERFECT HEBREW. Follow proven direct-response advertising principles (AIDA, PAS, or Hook-Story-Offer).

CRITICAL INSTRUCTIONS FOR HEBREW:
- Write NATIVE, NATURAL Hebrew that flows beautifully
- Use proper Hebrew grammar, punctuation and vowelization where needed
- Avoid awkward translations or unnatural phrasing
- Headlines should be punchy and memorable in Hebrew
- Copy should sound like a real person speaking Hebrew, not a translation
- No emoji in Hebrew text

Return:
1. headline — Main headline (max 40 Hebrew chars). Create curiosity, promise benefit, or trigger emotion.
2. subheadline — Supporting line (max 25 Hebrew chars). Amplify the headline or add social proof.
3. body — Ad body copy (2-3 short punchy sentences, max 150 Hebrew chars). Tell a micro-story or use PAS.
4. cta — Call to action button text (max 20 Hebrew chars). Action-oriented, specific, creates urgency.
5. imagePrompt — A highly detailed image generation prompt in English (minimum 80 words):
"[Main subject with specific details]. [Scene/environment]. [Lighting: ${imgDir.lighting}]. [Composition: ${imgDir.composition}]. [Mood: ${imgDir.mood}]. [Style: ${imgDir.vibe}]. Shot on Phase One IQ4 camera, 85mm lens, ultra-sharp 8K resolution, award-winning commercial advertising photography. NO TEXT OVERLAY, no watermarks, no logos, clean visual. Photorealistic."

${adIndex === 0 ? `Also create one Hebrew marketing email template:
- emailSubject: Subject line (max 60 Hebrew chars) - natural Hebrew
- emailPreview: Preview text (max 90 Hebrew chars) - natural Hebrew
- emailBody: Full HTML email with clean inline CSS, 3-4 sections, compelling copy in natural Hebrew, and a prominent CTA button` : ''}`;

    const response_json_schema = {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        body: { type: 'string' },
        cta: { type: 'string' },
        imagePrompt: { type: 'string' },
        ...(adIndex === 0 ? {
          emailSubject: { type: 'string' },
          emailPreview: { type: 'string' },
          emailBody: { type: 'string' },
        } : {}),
      },
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
      response_json_schema,
    });

    const { emailSubject, emailPreview, emailBody, ...adFields } = result;

    const brandColors = (businessInfo.colors || businessInfo.brand_colors || []).join(', ');
    const rawLogoUrl = businessInfo.logo || businessInfo.logo_url || null;
    const logoUrl = rawLogoUrl && rawLogoUrl.startsWith('http') ? rawLogoUrl : null;

    const ad = { ...adFields, imageUrl: null };

    const emailTemplate = adIndex === 0 ? {
      subject: emailSubject || '',
      preview: emailPreview || '',
      body: emailBody || '',
    } : null;

    // Return ad copy immediately without waiting for image
    const response = { ad, emailTemplate };
    
    // Generate image in background (non-blocking)
    if (!pregenerateImages) {
      const baseImagePrompt = adFields.imagePrompt || '';
      const enrichedPrompt = `${baseImagePrompt}${brandColors ? ` Brand color palette reference: ${brandColors}.` : ''} This is for a ${businessInfo.type} business targeting ${businessInfo.audience || 'general consumers'}. The image should immediately communicate: ${businessInfo.usp || businessInfo.product}. Facebook feed aspect ratio 1:1, optimized for mobile scroll-stopping impact. IMPORTANT: Bright, vibrant, colorful photography with saturated colors and energetic lighting - NOT dark, moody, or desaturated. Make it pop and catch attention with vivid colors and happiness. NO TEXT OVERLAY OR WATERMARKS. Ultra-high quality commercial advertising photography.`;

      base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: enrichedPrompt,
        existing_image_urls: logoUrl ? [logoUrl] : undefined,
      }).then((imgResult) => {
        if (imgResult?.url) {
          ad.imageUrl = imgResult.url;
        }
      }).catch((imgErr) => {
        console.error(`Image generation failed for ad ${adIndex}:`, imgErr.message);
      });
    }

    return Response.json(response);
  } catch (error) {
    console.error('generateAdCopy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});