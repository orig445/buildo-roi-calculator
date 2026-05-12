import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, Sparkles } from "lucide-react";

export default function WebsiteAnalyzer({ onAnalyzed }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);

  const normalizeUrl = (raw) => {
    let u = raw.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    return u;
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await base44.functions.invoke("analyzeWebsite", { url: normalizeUrl(url) });
      const data = res.data;
      setInsight(data);
      onAnalyzed({
        messages: Math.min(Math.max(Math.round(data.monthly_messages / 100) * 100, 100), 100000),
        customers: Math.min(Math.max(Math.round(data.monthly_customers / 10) * 10, 10), 5000),
        dealValue: Math.min(Math.max(Math.round(data.avg_deal_value / 100) * 100, 100), 50000),
      });
    } catch {
      setError("לא הצלחנו לנתח את האתר. נסה להזין כתובת מלאה כגון: example.co.il");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Globe style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#8b7ab8" }} />
          <input
            type="text"
            placeholder="הכנס את כתובת האתר שלך — mybusiness.co.il"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
            style={{
              width: "100%", paddingRight: 40, paddingLeft: 14, paddingTop: 10, paddingBottom: 10,
              border: "1.5px solid #ede8ff", borderRadius: 10, fontSize: 14,
              color: "#2d1b69", background: "#f8f6ff", outline: "none",
              fontFamily: "'Heebo', sans-serif", opacity: loading ? 0.6 : 1,
              boxSizing: "border-box", transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#7c5cbf"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,191,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#ede8ff"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: loading || !url.trim() ? "#c4b5e8" : "#5a3fa8",
            color: "white", border: "none", borderRadius: 10,
            padding: "10px 18px", fontSize: 13, fontWeight: 700,
            fontFamily: "'Heebo', sans-serif", cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          {loading
            ? <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
            : <><Sparkles style={{ width: 13, height: 13 }} /> נתח</>
          }
        </button>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>

      {loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 12, color: "#8b7ab8", marginTop: 8, textAlign: "center" }}>
          מנתח את האתר שלך... זה לוקח כמה שניות
        </motion.p>
      )}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 12, color: "#d44", marginTop: 8, textAlign: "center" }}>
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {insight && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 12 }}>
            <div style={{ background: "#f3f0ff", border: "1px solid #ede8ff", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
              <Sparkles style={{ width: 15, height: 15, color: "#7c5cbf", marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#2d1b69", marginBottom: 3 }}>
                  זיהינו: {insight.business_type} ✓ הסליידרים עודכנו אוטומטית
                </p>
                <p style={{ fontSize: 12, color: "#7c5cbf", lineHeight: 1.6 }}>{insight.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}