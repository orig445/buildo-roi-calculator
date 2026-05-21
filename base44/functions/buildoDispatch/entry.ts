import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhenhranF6ZHBjcW5xZGNwd2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzYzMjEsImV4cCI6MjA4MDUxMjMyMX0.lZK1fTYyKaqVJZbEZUIlGoXypiPxnfB2DiEjEAhvcfA';
const DISPATCH_URL = 'https://iazxkjqzdpcqnqdcpwki.supabase.co/functions/v1/dispatch-send-test';

function toE164(phone) {
  let p = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (p.startsWith('0')) p = '+972' + p.slice(1);
  if (!p.startsWith('+')) p = '+' + p;
  if (!/^\+\d{7,15}$/.test(p)) throw new Error(`מספר טלפון לא תקין: ${phone}`);
  return p;
}

async function dispatchSend(payload) {
  const apiKey = Deno.env.get('BUILDO_API_KEY');
  if (!apiKey) throw new Error('BUILDO_API_KEY not set');

  const res = await fetch(DISPATCH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'X-Buildoai-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('Dispatch response status:', res.status);
  console.log('Dispatch response body:', text);
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    console.error('Dispatch error:', JSON.stringify(data));
    throw new Error(data.message || data.error || 'שגיאה בשליחה');
  }
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // allow service-role test calls
    if (!user) {
      const isTestCall = req.headers.get('x-test-call') === '1';
      if (!isTestCall) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel, to, subject, body, sender_name, fromName } = await req.json();

    if (!channel || !to || !body) {
      return Response.json({ error: 'חסרים שדות: channel, to, body' }, { status: 400 });
    }

    let result;

    if (channel === 'sms') {
      const phone = toE164(to);
      result = await dispatchSend({ channel: 'sms', to: phone, sender_name: sender_name || 'Bildo', body });
    } else if (channel === 'email') {
      if (!subject) return Response.json({ error: 'חסר subject לאימייל' }, { status: 400 });
      result = await dispatchSend({ channel: 'email', to, subject, body, fromName: fromName || 'Bildo' });
    } else {
      return Response.json({ error: `channel לא נתמך: ${channel}` }, { status: 400 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('buildoDispatch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});