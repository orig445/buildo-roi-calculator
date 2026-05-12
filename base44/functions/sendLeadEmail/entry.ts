import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const lead = payload.data;
  if (!lead) return Response.json({ ok: true });

  const fmt = (v) => (v !== undefined && v !== null && v !== "") ? v : "—";

  const body = `
ליד חדש התקבל! 🎉

שם: ${fmt(lead.name)}
טלפון: ${fmt(lead.phone)}
אימייל: ${fmt(lead.email)}
חברה/עסק: ${fmt(lead.company)}
הודעות בחודש: ${fmt(lead.monthly_messages)}
לקוחות בחודש: ${fmt(lead.monthly_customers)}
ערך עסקה ממוצע: ${lead.avg_deal_value ? "₪" + lead.avg_deal_value.toLocaleString() : "—"}
הפסד חודשי מחושב: ${lead.calculated_loss ? "₪" + lead.calculated_loss.toLocaleString() : "—"}
רווח פוטנציאלי: ${lead.calculated_gain ? "₪" + lead.calculated_gain.toLocaleString() : "—"}
מקור: ${fmt(lead.source)}
הערות: ${fmt(lead.notes)}
תאריך: ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}
`.trim();

  const subject = `ליד חדש: ${lead.name || "ללא שם"} ${lead.phone ? "· " + lead.phone : ""}`;

  await base44.asServiceRole.integrations.Core.SendEmail({ to: "orig445@gmail.com", subject, body });

  return Response.json({ ok: true });
});