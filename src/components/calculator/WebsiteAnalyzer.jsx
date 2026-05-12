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
          <Globe style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--ink-light)" }} />
          <input
            type="text"
            placeholder="הכנס את כתובת האתר שלך — mybusiness.co.il"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
            className="input-v"
            style={{ paddingRight: 38, opacity: loading ? 0.6 : 1 }}
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="btn-stamp"
          style={{ padding: "9px 18px", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {loading ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <><Sparkles style={{ width: 13, height: 13 }} /> נתח</>}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 8, textAlign: "center", fontFamily: "'Heebo', sans-serif" }}>
          מנתח את האתר שלך... זה לוקח כמה שניות
        </motion.p>
      )}

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 11, color: "var(--rust)", marginTop: 8, textAlign: "center" }}>
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 12, overflow: "hidden" }}
          >
            <div style={{
              background: "var(--gold-pale)", border: "1px solid var(--gold-border)",
              borderRadius: 4, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start"
            }}>
              <Sparkles style={{ width: 15, height: 15, color: "var(--gold)", marginTop: 1, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
                  זיהינו: {insight.business_type} ✓ הסליידרים עודכנו אוטומטית
                </p>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.6 }}>{insight.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}