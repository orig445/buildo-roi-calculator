import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import crypto from 'node:crypto';

const FB_PIXEL_ID = '25931109319854138';
const FB_ACCESS_TOKEN = 'EAAMCokJbyZAABRUZBASZCRZBlwAXmdBmzg1nnjpQOita7ZBtEnXXZBZAZCUaqnyaFjzMcPncFsyiEkKR9szNrUT9mE9Xg8izafC1wkEc2TaWMsID8ZBapB383riCqIQWkySoCVkApGqyiXpbSDkuYjfpwKJfPXTWZAcq6uKxP4GhMBFrxTDcmnvAEB0VvZA7cFWM3eEzwZDZD';

function sha256(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Support both direct call and entity automation payload
    const leadData = payload.data || payload;
    const { lead_id, name, phone, email } = leadData;

    const eventTime = Math.floor(Date.now() / 1000);

    const userData = {
      lead_id: lead_id || undefined,
    };
    if (phone) userData.ph = [sha256(phone.replace(/\D/g, ''))];
    if (email) userData.em = [sha256(email)];
    if (name) {
      const parts = name.trim().split(' ');
      userData.fn = [sha256(parts[0])];
      if (parts.length > 1) userData.ln = [sha256(parts.slice(1).join(' '))];
    }

    const event = {
      event_name: 'Lead',
      event_time: eventTime,
      action_source: 'system_generated',
      custom_data: {
        event_source: 'crm',
        lead_event_source: 'Bildo CRM',
      },
      user_data: userData,
    };

    const url = `https://graph.facebook.com/v25.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Facebook API error:', JSON.stringify(result));
      return Response.json({ error: result }, { status: 500 });
    }

    console.log('Facebook conversion sent:', JSON.stringify(result));
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});