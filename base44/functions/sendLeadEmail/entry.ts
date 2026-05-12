import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const lead = payload.data;
  if (!lead) return Response.json({ ok: true });

  const fmt = (v) => (v !== undefined && v !== null && v !== "") ? v : "—";

  const bodyText = `
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
  const to = "orig445@gmail.com";

  // Build RFC 2822 message using base64url encoding
  const encodeSubject = (s) => {
    const b64 = btoa(unescape(encodeURIComponent(s)));
    return `=?UTF-8?B?${b64}?=`;
  };

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(bodyText))),
  ].join("\r\n");

  const encodedMessage = btoa(rawMessage).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API error: ${err}`);
  }

  return Response.json({ ok: true });
});