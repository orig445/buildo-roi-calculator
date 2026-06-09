import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

export default function HeroSection({ h1, subheadline, cta, page, keyword, industry }) {
  return (
    <section style={{ background: "linear-gradient(135deg,#0f0720 0%,#1e0a4e 100%)", padding: "80px 20px 64px", textAlign: "center" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 20 }}>
          ⚡ AI-Powered Marketing
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 20px" }}>{h1}</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 32px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          {subheadline || "Buildo learns your business, creates campaign assets, and helps you publish across channels with manual approval."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://buildoai.com/worker-onboarding"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.signupStarted(page, { keyword, industry, cta })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#7c3aed", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 800,
              fontFamily: "'Heebo', sans-serif", boxShadow: "0 6px 24px rgba(124,58,237,0.4)",
            }}
          >
            {cta} <ArrowRight size={16} />
          </a>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}