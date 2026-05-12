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
    <div className="mb-6">
      {/* URL Input */}
      <div className="flex gap-0 border border-[#333]">
        <div className="relative flex-1">
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
          <input
            type="text"
            placeholder="הכנס כתובת אתר: mybusiness.co.il"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
            className="w-full pr-9 pl-4 py-2.5 text-xs font-mono text-[#ccc] placeholder:text-[#444] outline-none bg-[#0d0d0d] disabled:opacity-60 border-none"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#222] hover:bg-[#2a2a2a] text-[#aaa] text-xs font-mono font-bold transition-colors disabled:opacity-40 whitespace-nowrap border-r border-[#333] uppercase tracking-widest"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              נתח
            </>
          )}
        </button>
      </div>

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#555] font-mono mt-2 text-center uppercase tracking-widest"
        >
          &gt;_ מנתח את האתר שלך...
        </motion.p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#cc4444] font-mono mt-2 text-center"
        >
          ERROR: {error}
        </motion.p>
      )}

      {/* Insight Card */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="border border-[#2a2a3a] bg-[#0d0d0d] p-3 flex gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7777cc] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-mono text-[#7777cc] mb-1 uppercase tracking-wider">
                  זיהינו: {insight.business_type} // סליידרים עודכנו
                </p>
                <p className="text-xs text-[#888] font-mono leading-relaxed">{insight.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}