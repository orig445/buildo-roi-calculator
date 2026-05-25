import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { businessInfo, selectedAd, style } = await req.json();

    if (!businessInfo || !selectedAd) {
      return Response.json({ error: 'חסר businessInfo או selectedAd' }, { status: 400 });
    }

    const styleInstructions = {
      emotional: 'רגשי ומחבר — דבר ישירות ללב של הלקוח, השתמש בסיפור ואמפתיה',
      direct: 'ישיר ועסקי — דגש על תועלת ברורה, מספרים, והנעה לפעולה חזקה',
      humorous: 'הומוריסטי ומשחקי — טון קליל, חכם, עם ציוץ שגורם לחיוך',
      luxury: 'יוקרתי ופרימיום — שפה גבוהה, בלעדיות, איכות ללא פשרות',
      urgency: 'דחיפות ומוגבלות — הצעה לזמן מוגבל, "עכשיו או לעולם לא", FOMO',
    };

    const styleImageMood = {
      emotional: 'warm, emotional, human connection, soft lighting, authentic lifestyle',
      direct: 'clean, professional, bold, high contrast, business-focused',
      humorous: 'colorful, playful, fun, vibrant, eye-catching',
      luxury: 'premium, elegant, dark background, gold accents, sophisticated',
      urgency: 'bold red and orange, dynamic, energetic, urgent, striking',
    };

    // Step 1: Generate copy for 3 ad variants
    const prompt = `אתה מומחה פרסום דיגיטלי ברמה עולמית.

מידע על העסק:
- שם: ${businessInfo.name}
- תחום: ${businessInfo.type}
- מוצר/שירות: ${businessInfo.product}
- קהל יעד: ${businessInfo.audience}
- יתרון ייחודי: ${businessInfo.usp}

פרסומת מנצחת לדוגמה:
- כותרת: ${selectedAd.title || ''}
- גוף: ${selectedAd.body || ''}

סגנון: ${styleInstructions[style] || styleInstructions.direct}

צור 3 גרסאות פרסומת בעברית. כל גרסה תכיל:
1. כותרת ראשית (עד 40 תווים)
2. כותרת משנה (עד 25 תווים)
3. גוף הפרסומת (2-4 שורות, מקסימום 150 תווים)
4. קריאה לפעולה (CTA) - עד 20 תווים
5. imagePrompt - תיאור באנגלית לתמונת פרסומת מקצועית לפייסבוק עבור עסק זה`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
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
        },
      },
    });

    const ads = result.ads || [];
    const mood = styleImageMood[style] || styleImageMood.direct;
    const brandColors = businessInfo.brand_colors?.join(', ') || '';
    const logoUrl = businessInfo.logo_url || null;

    // Step 2: Generate an image for each ad in parallel
    const adsWithImages = await Promise.all(
      ads.map(async (ad) => {
        const imgPrompt = `Professional Facebook advertisement image for a ${businessInfo.type} business called "${businessInfo.name}". ${ad.imagePrompt}. Style: ${mood}. ${brandColors ? `Brand colors: ${brandColors}.` : ''} High quality marketing photo, no text overlay, photorealistic, 1200x628 aspect ratio feel.`;
        
        const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: imgPrompt,
          existing_image_urls: logoUrl ? [logoUrl] : undefined,
        });

        return { ...ad, imageUrl: imgResult.url || null };
      })
    );

    return Response.json({ ads: adsWithImages });
  } catch (error) {
    console.error('generateAdCopy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});