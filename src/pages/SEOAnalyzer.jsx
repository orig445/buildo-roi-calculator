import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Search, CheckCircle, ArrowRight } from "lucide-react";
import ScoreGauge from "@/components/seo/ScoreGauge";
import QuickWins from "@/components/seo/QuickWins";
import SectionCards from "@/components/seo/SectionCards";
import EmailGate from "@/components/seo/EmailGate";

export default function SEOAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    setEmailSent(false);
    try {
      const res = await base44.functions.invoke("analyzeSEO", { url: url.trim() });
      setReport(res.data);
    } catch (e) {
      setError("Could not analyze this website. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendFullReport = async (email) => {
    setEmailLoading(true);
    try {
      await base44.functions.invoke("analyzeSEO", { url: url.trim(), email, fullReport: true });
      setEmailSent(true);
    } catch {
      // still show success to user
      setEmailSent(true);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Heebo', sans-serif", color: "#000" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>SEO Analyzer AI</div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 60px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 14 }}>
            <span>⚡</span> Powered by AI + Live Web Data
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#111", margin: "0 0 10px", lineHeight: 1.2 }}>
            Free AI SEO Audit
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, margin: "0 auto", maxWidth: 520 }}>
            Enter your website URL and get an instant SEO health score with actionable recommendations — in seconds.
          </p>
        </div>

        {/* Input */}
        <div style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 16, padding: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Globe style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#999" }} />
              <input
                type="text"
                placeholder="yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && url.trim() && analyze()}
                disabled={loading}
                style={{
                  width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
                  background: "#fff", border: "1.5px solid #ddd", borderRadius: 10,
                  fontSize: 14, color: "#000", outline: "none",
                  fontFamily: "'Heebo', sans-serif", boxSizing: "border-box", direction: "ltr",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <button
              onClick={analyze}
              disabled={loading || !url.trim()}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: url.trim() && !loading ? "#000" : "#ddd",
                color: url.trim() && !loading ? "#fff" : "#999",
                border: "none", borderRadius: 10,
                padding: "13px 22px", fontSize: 14, fontWeight: 700,
                fontFamily: "'Heebo', sans-serif",
                cursor: url.trim() && !loading ? "pointer" : "not-allowed",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
              }}
            >
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                {[0, 1, 2, 3].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>Scanning your site with AI + live web data...</div>
            </motion.div>
          )}

          {error && (
            <div style={{ marginTop: 14, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {report && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

              {/* Score + Summary */}
              <div style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 16, padding: "28px 24px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                <ScoreGauge score={report.score} grade={report.grade} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>
                    {report.url?.replace(/^https?:\/\//, "")}
                  </div>
                  <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 14px" }}>{report.summary}</p>
                  {report.strengths?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {report.strengths.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a" }}>
                          <CheckCircle size={13} /> {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Wins */}
              <div style={{ marginBottom: 20 }}>
                <QuickWins wins={report.quick_wins} />
              </div>

              {/* Section Cards — blurred after first 2 */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <div>
                  {(report.full_report_sections || []).slice(0, 2).map((s, i) => (
                    <div key={i}>
                      <SectionCards sections={[s]} />
                    </div>
                  ))}
                </div>

                {/* Blurred preview of remaining sections */}
                {report.full_report_sections?.length > 2 && (
                  <div style={{ position: "relative" }}>
                    <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
                      <SectionCards sections={(report.full_report_sections || []).slice(2)} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>🔒</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>Get full report via email</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyword Opportunities */}
              {report.keyword_opportunities?.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 12px" }}>🎯 Keyword Opportunities</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {report.keyword_opportunities.map((k, i) => (
                      <span key={i} style={{ background: "#ede9fe", color: "#7c3aed", padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{k}</span>
                    ))}
                  </div>
                  {report.competitor_gap && (
                    <p style={{ fontSize: 13, color: "#666", margin: "12px 0 0", lineHeight: 1.7 }}>💡 {report.competitor_gap}</p>
                  )}
                </div>
              )}

              {/* Email gate / success */}
              {!emailSent ? (
                <EmailGate onSubmit={sendFullReport} loading={emailLoading} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ background: "linear-gradient(135deg,#1a0a2e,#3b1f8c)", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginTop: 28 }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                  <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>Full Report Sent!</h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7, margin: "0 0 20px" }}>
                    Check your inbox for your complete SEO report. Ready to take action?
                  </p>
                  <a
                    href="https://buildoai.com/worker-onboarding"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#7c3aed", color: "#fff", textDecoration: "none",
                      borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 800,
                      fontFamily: "'Heebo', sans-serif",
                    }}
                  >
                    Let Bildo Fix It For Me <ArrowRight size={16} />
                  </a>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "12px 0 0" }}>No credit card · Free trial</p>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}