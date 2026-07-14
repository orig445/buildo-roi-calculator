import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ToolFAQSection({ faqs }) {
  const [open, setOpen] = useState(null);
  if (!faqs?.length) return null;
  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 0" }}>
      <h2 style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 900, color: "#111", margin: "0 0 24px", textAlign: "center" }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {faqs.map(({ q, a }, i) => (
          <div key={i} style={{ border: "1.5px solid", borderColor: open === i ? "#7c3aed" : "#e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff", transition: "border-color 0.2s" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", gap: 12 }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.4 }}>{q}</span>
              <ChevronDown size={18} color="#7c3aed" style={{ flexShrink: 0, transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>
            {open === i && (
              <div style={{ padding: "0 18px 16px", fontSize: 14, color: "#555", lineHeight: 1.75 }}>{a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}