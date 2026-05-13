import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, phone, email, company, monthlyLoss, potentialGain, selectedDateTime } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    // Use selected slot if provided, otherwise default to tomorrow 10:00
    let startDate;
    if (selectedDateTime) {
      startDate = new Date(selectedDateTime);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(10, 0, 0, 0);
    }

    // Validate time is within business hours (9:00-18:00 Israel time)
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hour12: false });
    const israelTime = parseInt(formatter.format(startDate), 10);
    if (israelTime < 9 || israelTime >= 18) {
      return Response.json({ error: 'התאריך/שעה שנבחרו חוץ משעות העבודה (9:00-18:00 בשעון ישראל)' }, { status: 400 });
    }

    const startTime = startDate.toISOString();
    const endTime = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour

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