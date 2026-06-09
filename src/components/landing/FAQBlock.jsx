import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQBlock({ faqs }) {
  const [open, setOpen] = useState(null);
  const items = faqs || [
    { q: "Do I need marketing experience?", a: "No. Buildo asks you simple questions about your business and handles the strategy and copy." },
    { q: "How long does it take to create a campaign?", a: "Most campaigns are ready in under 5 minutes." },
    { q: "Can I edit the campaigns before publishing?", a: "Yes. You review and approve every piece of content before it goes live." },
    { q: "What channels does Buildo support?", a: "Facebook, Instagram, WhatsApp, landing pages, and more." },
    { q: "Is there a free trial?", a: "Yes. You can create your first campaign completely free — no credit card required." },
  ];

  return (
    <section style={{ padding: "60px 20px", background: "#faf9ff" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111", textAlign: "center", margin: "0 0 32px" }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ede9fe", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 700, color: "#111", fontFamily: "'Heebo', sans-serif" }}
              >
                {item.q}
                {open === i ? <ChevronUp size={16} color="#7c3aed" /> : <ChevronDown size={16} color="#7c3aed" />}
              </button>
              {open === i && (
                <div style={{ padding: "0 18px 16px", fontSize: 14, color: "#555", lineHeight: 1.7 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}