import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Globe, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WebsiteStep({ onAnalyzed }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const normalized = url.trim().startsWith("http") ? url.trim() : "https://" + url.trim();
      const res = await base44.functions.invoke("analyzeWebsite", { url: normalized });
      const data = res.data;

      const info = {
        url: normalized,
        name: data.business_name || "עסק",
        type: data.business_type || "כללי",
        product: data.insight || "",
        audience: data.target_audience || "לקוחות פוטנציאליים",
        usp: data.usp || "",
        logo: data.logo_url || null,
        colors: data.brand_colors || [],
        keywords: data.keywords || [data.business_type || "business"],
      };
      setPreview(info);
    } catch (e) {
      setError("לא הצלחנו לנתח את האתר. נסה URL אחר.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 8, letterSpacing: "0.08em" }}>שלב 1 מתוך 4</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>נתח את האתר שלך</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          ה-AI שלנו יזהה את המיתוג, המוצר וקהל היעד שלך אוטומטית
        </p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Globe style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
            <input
              type="text"
              placeholder="הכנס כתובת האתר שלך..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && analyze()}
              disabled={loading}
              style={{
                width: "100%", paddingRight: 44, paddingLeft: 16, paddingTop: 14, paddingBottom: 14,
                background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                borderRadius: 12, fontSize: 15, color: "white", outline: "none",
                fontFamily: "'Heebo', sans-serif", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#a78bfa"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
            />
          </div>
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: loading || !url.trim() ? "rgba(167,139,250,0.3)" : "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "white", border: "none", borderRadius: 12,
              padding: "14px 24px", fontSize: 14, fontWeight: 700,
              fontFamily: "'Heebo', sans-serif",
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
            {loading ? "מנתח..." : "נתח"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 14, padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
              {preview.logo && (
                <img src={preview.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "contain", background: "white", padding: 4 }} onError={(e) => { e.target.style.display = "none"; }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{preview.name}</div>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 8 }}>{preview.type}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{preview.product}</div>
              </div>
            </div>

            {preview.colors && preview.colors.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>צבעי מותג:</span>
                {preview.colors.map((c, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: "1px solid rgba(255,255,255,0.2)" }} title={c} />
                ))}
              </div>
            )}

            <button
              onClick={() => onAnalyzed(preview)}
              style={{
                width: "100%", padding: "13px", background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                fontFamily: "'Heebo', sans-serif", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              ✨ נראה מעולה! המשך לפרסומות מנצחות ←
            </button>
          </motion.div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}