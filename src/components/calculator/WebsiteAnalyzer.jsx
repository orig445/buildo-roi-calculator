import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, Sparkles, ChevronLeft } from "lucide-react";

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
        businessType: data.business_type,
        insight: data.insight,
      });
    } catch {
      setError("לא הצלחנו לנתח את האתר. נסה להזין כתובת מלאה כגון: example.co.il");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-7">
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="הכנס את כתובת האתר שלך (למשל: mybusiness.co.il)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-gray-50 disabled:opacity-60"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              נתח
            </>
          )}
        </button>
      </div>

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-violet-500 mt-2 text-center"
        >
          מנתח את האתר שלך... זה לוקח כמה שניות ✨
        </motion.p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-500 mt-2 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Insight Card */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-4 flex gap-3">
              <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-violet-700 mb-1">
                  זיהינו: {insight.business_type} ✓ הסליידרים עודכנו אוטומטית
                </p>
                <p className="text-sm text-violet-800 leading-relaxed">{insight.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}