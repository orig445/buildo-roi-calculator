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

    const prompt = `צור פרסומת פייסבוק בעברית לעסק:
- שם: ${businessInfo.name}
- סוג: ${businessInfo.type}
- מוצר: ${businessInfo.product}
- קהל יעד: ${businessInfo.audience}
- ייחודיות: ${businessInfo.usp}

סגנון: ${styleInstructions[style] || styleInstructions.direct}
${variantHint}

החזר JSON:
1. headline — כותרת ראשית (עד 40 תווים)
2. subheadline — כותרת משנה (עד 25 תווים)
3. body — גוף הפרסומת (2-3 משפטים קצרים)
4. cta — טקסט כפתור (עד 20 תווים)
5. imagePrompt — prompt לתמונה באנגלית (50 מילים): "${imgDir.lighting}, ${imgDir.composition}, ${imgDir.mood}, ${imgDir.vibe}, commercial photography, bright vibrant colors, NO TEXT"

${adIndex === 0 ? `6. emailSubject — נושא מייל (60 תווים)
7. emailPreview — טקסט תצוגה (90 תווים)
8. emailBody — HTML מייל שיווקי` : ''}`;

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