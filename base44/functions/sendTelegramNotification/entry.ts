import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = "7076964500"; // אורי גרוס (@orihomer)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const lead = payload.data;
    if (!lead) return Response.json({ ok: true });

    const fmt = (v) => (v !== undefined && v !== null && v !== "") ? v : "—";
    const fmtMoney = (v) => v ? `₪${Math.round(v).toLocaleString("he-IL")}` : "—";

    const msg = `🔔 *ליד חדש נכנס!*

👤 *שם:* ${fmt(lead.name)}
📱 *טלפון:* ${fmt(lead.phone)}
📧 *אימייל:* ${fmt(lead.email)}
🏢 *עסק:* ${fmt(lead.company)}
🌐 *מקור:* ${fmt(lead.source)}

📊 *נתוני מחשבון:*
❌ הפסד חודשי: ${fmtMoney(lead.calculated_loss)}
✅ פוטנציאל עם בילדו: ${fmtMoney(lead.calculated_gain)}
💬 הודעות/חודש: ${fmt(lead.monthly_messages)}
👥 לקוחות/חודש: ${fmt(lead.monthly_customers)}
💰 ערך עסקה: ${fmtMoney(lead.avg_deal_value)}

🕐 ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}`;

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram error:", JSON.stringify(data));
      return Response.json({ ok: false, error: data.description }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});