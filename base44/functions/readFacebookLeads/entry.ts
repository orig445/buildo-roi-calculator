import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPREADSHEET_ID = '1GmQYJxrlAk6WyOH8i477Ekx4wVubSXlA8RLhdB0NmcI';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // Read all rows from the first sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:Z`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();

    if (!data.values || data.values.length < 2) {
      return Response.json({ rows: [], headers: [] });
    }

    const headers = data.values[0];
    const rows = data.values.slice(1).map((row, i) => {
      const obj = { _row: i + 2 };
      headers.forEach((h, j) => { obj[h] = row[j] || ''; });
      return obj;
    });

    return Response.json({ headers, rows, total: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});