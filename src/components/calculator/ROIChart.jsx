import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יוני", "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid var(--gold-border)", borderRadius: 3,
      padding: "10px 14px", fontFamily: "'Heebo', sans-serif", fontSize: 12, direction: "rtl",
    }}>
      <div style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: 9, letterSpacing: "0.1em", color: "var(--ink-light)", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.dataKey}: ₪{Math.round(p.value).toLocaleString("he-IL")}
        </div>
      ))}
    </div>
  );
}

export default function ROIChart({ monthLoss, monthGain }) {
  const data = MONTHS.map((month, i) => ({
    month,
    "הפסד ללא בילדו": monthLoss * (i + 1),
    "רווח עם בילדו": monthGain * (i + 1),
  }));

  return (
    <div className="card-v" style={{ padding: "28px" }}>
      <div style={{ marginBottom: 20 }}>
        <div className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.15em", marginBottom: 6 }}>✦ ניתוח שנתי</div>
        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
          הפסד מצטבר לאורך השנה ללא בילדו
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B3A1A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8B3A1A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A3325" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1A3325" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,150,42,0.1)" />
          <XAxis dataKey="month" tick={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: 9, fill: "var(--ink-light)" }} />
          <YAxis tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`} tick={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: 9, fill: "var(--ink-light)" }} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="הפסד ללא בילדו" stroke="#8B3A1A" strokeWidth={2} fill="url(#lossGrad)" animationDuration={600} animationEasing="ease-out" />
          <Area type="monotone" dataKey="רווח עם בילדו" stroke="#2D5C3F" strokeWidth={2} fill="url(#gainGrad)" animationDuration={600} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="font-display" style={{ marginTop: 12, fontSize: 11, color: "var(--ink-light)", textAlign: "center", fontStyle: "italic" }}>
        כל חודש שעובר ללא אוטומציה עולה לך ₪{monthLoss.toLocaleString("he-IL")} נוספים
      </p>
    </div>
  );
}