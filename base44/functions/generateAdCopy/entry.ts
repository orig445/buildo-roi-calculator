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

    const styleImageMood = {
      emotional: 'warm, emotional, human connection, soft lighting, authentic lifestyle',
      direct: 'clean, professional, bold, high contrast, business-focused',
      humorous: 'colorful, playful, fun, vibrant, eye-catching',
      luxury: 'premium, elegant, dark background, gold accents, sophisticated',
      urgency: 'bold red and orange, dynamic, energetic, urgent, striking',
    };

    // Step 1: Generate copy for 3 ad variants + email template
    const prompt = `אתה מומחה פרסום דיגיטלי ברמה עולמית.

מידע על העסק:
- שם: ${businessInfo.name}
- תחום: ${businessInfo.type}
- מוצר/שירות: ${businessInfo.product}
- קהל יעד: ${businessInfo.audience}
- יתרון ייחודי: ${businessInfo.usp}

סגנון: ${styleInstructions[style] || styleInstructions.direct}

צור 3 גרסאות פרסומת בעברית. כל גרסה תכיל:
1. headline - כותרת ראשית (עד 40 תווים)
2. subheadline - כותרת משנה (עד 25 תווים)
3. body - גוף הפרסומת (2-4 שורות, מקסימום 150 תווים)
4. cta - קריאה לפעולה (עד 20 תווים)
5. imagePrompt - תיאור באנגלית לתמונת פרסומת מקצועית לפייסבוק עבור עסק זה

בנוסף, צור תבנית מייל שיווקי אחת בעברית:
- emailSubject: שורת נושא (עד 60 תווים)
- emailPreview: טקסט preview (עד 90 תווים)
- emailBody: גוף המייל ב-HTML עם עיצוב בסיסי, 3-4 פסקאות, כולל כפתור CTA`;

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
          emailSubject: { type: 'string' },
          emailPreview: { type: 'string' },
          emailBody: { type: 'string' },
        },
      },
    });

    const ads = result.ads || [];
    const emailTemplate = {
      subject: result.emailSubject || '',
      preview: result.emailPreview || '',
      body: result.emailBody || '',
    };
    const mood = styleImageMood[style] || styleImageMood.direct;
    const brandColors = (businessInfo.colors || businessInfo.brand_colors || []).join(', ');
    const rawLogoUrl = businessInfo.logo || businessInfo.logo_url || null;
    // Only use absolute URLs — relative paths like "/images/logo.svg" will break GenerateImage
    const logoUrl = rawLogoUrl && rawLogoUrl.startsWith('http') ? rawLogoUrl : null;

    console.log('businessInfo keys:', Object.keys(businessInfo));
    console.log('logoUrl:', logoUrl);
    console.log('brandColors:', brandColors);

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

    return Response.json({ ads: adsWithImages, emailTemplate });
  } catch (error) {
    console.error('generateAdCopy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});