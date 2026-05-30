import { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";

export default function EmailGate({ onSubmit, loading }) {
  const [email, setEmail] = useState("");

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a0a2e, #3b1f8c)",
      borderRadius: 16, padding: "28px 24px", textAlign: "center", marginTop: 28,
    }}>
      <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Lock size={20} color="#e9d5ff" />
      </div>
      <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>Get Your Full SEO Report</h3>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7, margin: "0 0 20px" }}>
        Detailed analysis of all 6 SEO categories + keyword opportunities + competitor gap — sent straight to your inbox.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Mail style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#aaa" }} />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email && onSubmit(email)}
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
              background: "#fff", border: "none", borderRadius: 10, fontSize: 14,
              color: "#000", outline: "none", boxSizing: "border-box", direction: "ltr",
            }}
          />
        </div>
        <button
          onClick={() => email && onSubmit(email)}
          disabled={!email || loading}
          style={{
            background: loading || !email ? "#666" : "#7c3aed",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "12px 20px", fontSize: 14, fontWeight: 800,
            cursor: email && !loading ? "pointer" : "not-allowed",
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Sending...</> : "Send Report →"}
        </button>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "12px 0 0" }}>No spam · Instant delivery</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}