import { track } from "@/lib/analytics";

export default function FinalCTA({ cta, page, keyword, industry }) {
  return (
    <section style={{ background: "linear-gradient(135deg,#1a0a2e,#3b1f8c)", padding: "64px 20px", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>Ready to launch your first campaign?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 0 28px" }}>
          No agency. No designer. No credit card. Just your business goal and Buildo.
        </p>
        <a
          href="https://buildoai.com/worker-onboarding"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track.signupStarted(page, { keyword, industry, position: "bottom_cta" })}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#7c3aed", color: "#fff", textDecoration: "none",
            borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 900,
            fontFamily: "'Heebo', sans-serif", boxShadow: "0 6px 28px rgba(124,58,237,0.45)",
          }}
        >
          {cta || "Create my campaign free"} →
        </a>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "14px 0 0" }}>
          Free trial · No credit card · Response within hours
        </p>
      </div>
    </section>
  );
}