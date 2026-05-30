import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function SectionCard({ section }) {
  const [open, setOpen] = useState(false);
  const color = section.status === "good" ? "#16a34a" : section.status === "warning" ? "#d97706" : "#dc2626";
  const bg = section.status === "good" ? "#f0fdf4" : section.status === "warning" ? "#fffbeb" : "#fef2f2";

  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{section.section_title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>{section.score}/100</span>
          {open ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${color}22` }}>
          <p style={{ fontSize: 13, color: "#555", margin: "10px 0 6px" }}><strong>Findings:</strong> {section.findings}</p>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}><strong>Recommendation:</strong> {section.recommendations}</p>
        </div>
      )}
    </div>
  );
}

export default function SectionCards({ sections }) {
  if (!sections?.length) return null;
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 12px" }}>📊 Detailed Analysis</h3>
      {sections.map((s, i) => <SectionCard key={i} section={s} />)}
    </div>
  );
}