const steps = [
  { num: "01", title: "Tell Buildo about your business", desc: "Answer a few questions. Buildo learns your offer, audience, and channels." },
  { num: "02", title: "Get a full campaign", desc: "Copy, creative direction, and channel plan — all created automatically." },
  { num: "03", title: "Review and approve", desc: "You stay in control. Approve, edit, or request changes before anything goes live." },
];

export default function HowItWorks({ cta }) {
  return (
    <section id="how-it-works" style={{ padding: "60px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111", textAlign: "center", margin: "0 0 40px" }}>How Buildo Works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a
            href="https://buildoai.com/worker-onboarding"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#7c3aed", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 800,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            {cta || "Create my campaign free"} →
          </a>
        </div>
      </div>
    </section>
  );
}