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

    const prompt = `אתה מומחה פרסום דיגיטלי ברמה עולמית.

מידע על העסק:
- שם: ${businessInfo.name}
- תחום: ${businessInfo.type}
- מוצר/שירות: ${businessInfo.product}
- קהל יעד: ${businessInfo.audience}
- יתרון ייחודי: ${businessInfo.usp}

פרסומת מנצחת לדוגמה שבחר המשתמש:
- כותרת: ${selectedAd.title || ''}
- גוף: ${selectedAd.body || ''}
- דף: ${selectedAd.page_name || ''}

סגנון נדרש: ${styleInstructions[style] || styleInstructions.direct}

צור 3 גרסאות פרסומת בעברית עבור העסק הזה, בהשראת הפרסומת המנצחת שנבחרה.
כל גרסה תכיל:
1. כותרת ראשית (עד 40 תווים)
2. כותרת משנה (עד 25 תווים)
3. גוף הפרסומת (2-4 שורות, מקסימום 150 תווים)
4. קריאה לפעולה (CTA) - עד 20 תווים
5. תיאור תמונה מומלצת

החזר JSON בלבד בפורמט:
{
  "ads": [
    {
      "headline": "...",
      "subheadline": "...",
      "body": "...",
      "cta": "...",
      "imageDescription": "..."
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
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
                imageDescription: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({ ads: result.ads || [] });
  } catch (error) {
    console.error('generateAdCopy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});