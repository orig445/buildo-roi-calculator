import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, phone, email, company, monthlyLoss, potentialGain } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    // Schedule the demo for tomorrow at 10:00 AM Israel time (UTC+3)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const startTime = tomorrow.toISOString();
    const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour

    const description = [
      `👤 שם: ${name}`,
      `📱 טלפון: ${phone}`,
      email ? `📧 אימייל: ${email}` : null,
      company ? `🏢 חברה: ${company}` : null,
      ``,
      `📊 נתוני ROI מהמחשבון:`,
      monthlyLoss ? `❌ הפסד חודשי נוכחי: ₪${Math.round(monthlyLoss).toLocaleString('he-IL')}` : null,
      potentialGain ? `✅ פוטנציאל עם בילדו: +₪${Math.round(potentialGain).toLocaleString('he-IL')}/חודש` : null,
    ].filter(Boolean).join('\n');

    const event = {
      summary: `הדגמת בילדו — ${name}${company ? ` (${company})` : ''}`,
      description,
      start: { dateTime: startTime, timeZone: 'Asia/Jerusalem' },
      end:   { dateTime: endTime,   timeZone: 'Asia/Jerusalem' },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || 'Calendar API error' }, { status: 500 });
    }

    return Response.json({ success: true, eventId: data.id, htmlLink: data.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});