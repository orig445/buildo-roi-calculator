export default function QuickWins({ wins }) {
  if (!wins?.length) return null;
  const impactColor = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 12px" }}>⚡ Quick Wins</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {wins.map((w, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ background: impactColor[w.impact] || "#666", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap", marginTop: 2 }}>
              {(w.impact || "").toUpperCase()}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3 }}>{w.issue}</div>
              <div style={{ fontSize: 12, color: "#555" }}>✅ {w.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}