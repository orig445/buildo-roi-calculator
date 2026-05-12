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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="הכנס את כתובת האתר שלך — mybusiness.co.il"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-gray-50 disabled:opacity-60"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" />נתח</>}
        </button>
      </div>

      {loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 mt-2 text-center">
          מנתח את האתר שלך... זה לוקח כמה שניות
        </motion.p>
      )}

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-2 text-center">
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex gap-2.5">
              <Sparkles className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-800 mb-0.5">
                  זיהינו: {insight.business_type} ✓ הסליידרים עודכנו אוטומטית
                </p>
                <p className="text-xs text-green-700 leading-relaxed">{insight.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}