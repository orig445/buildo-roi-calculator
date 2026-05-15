import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPREADSHEET_ID = '1GmQYJxrlAk6WyOH8i477Ekx4wVubSXlA8RLhdB0NmcI';
const CHAT_ID = "7076964500";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // Read all rows from sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:Z`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await res.json();

    if (!data.values || data.values.length < 2) {
      return Response.json({ synced: 0 });
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    const getCol = (row, name) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (row[idx] || '') : '';
    };

    // Get all existing lead IDs to avoid duplicates
    const existing = await base44.asServiceRole.entities.FacebookLead.list('-created_date', 1000);
    const existingIds = new Set(existing.map(l => l.lead_id));

    let syncedCount = 0;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    for (const row of rows) {
      const leadId = getCol(row, 'id');
      if (!leadId || existingIds.has(leadId)) continue;

      // Skip test leads
      const fullName = getCol(row, 'full_name');
      if (fullName.includes('<test lead')) continue;

      const phoneNumber = getCol(row, 'phone_number');
      const formName = getCol(row, 'form_name');
      const campaignName = getCol(row, 'campaign_name');
      const adName = getCol(row, 'ad_name');
      const createdTime = getCol(row, 'created_time');
      const leadStatus = getCol(row, 'lead_status');
      const platform = getCol(row, 'platform');

      // Save to DB
      await base44.asServiceRole.entities.FacebookLead.create({
        lead_id: leadId,
        full_name: fullName,
        phone_number: phoneNumber,
        form_name: formName,
        campaign_name: campaignName,
        ad_name: adName,
        created_time: createdTime,
        lead_status: leadStatus,
        platform: platform,
      });

      // Send Telegram notification
      const dateStr = createdTime ? new Date(createdTime).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) : '—';
      const message = `🎯 *ליד חדש מפייסבוק!*\n\n` +
        `👤 *שם:* ${fullName || '—'}\n` +
        `📞 *טלפון:* ${phoneNumber || '—'}\n` +
        `📋 *טופס:* ${formName || '—'}\n` +
        (campaignName ? `📣 *קמפיין:* ${campaignName}\n` : '') +
        (adName ? `🖼 *מודעה:* ${adName}\n` : '') +
        `📅 *תאריך:* ${dateStr}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' }),
      });

      syncedCount++;
    }

    return Response.json({ synced: syncedCount, total: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});