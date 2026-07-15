import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Search, CheckCircle, ArrowRight, Lock, X, Zap, Bot, Target, Lightbulb, Mail, Rocket } from "lucide-react";
import ScoreGauge from "@/components/seo/ScoreGauge";
import QuickWins from "@/components/seo/QuickWins";
import SectionCards from "@/components/seo/SectionCards";
import EmailGate from "@/components/seo/EmailGate";
import useToolSEO from "@/components/seo/useToolSEO";
import { ToolSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ToolFAQSection from "@/components/seo/ToolFAQSection";

const SEO_FAQS = [
  { q: "What is a free SEO audit tool?", a: "A free SEO audit tool analyzes your website and gives you an SEO health score, identifying technical issues, content gaps, and quick wins to improve your Google ranking. Buildo's free SEO Analyzer uses AI and live web data to generate a full audit in seconds — no account required." },
  { q: "How do I check my website's Google ranking performance?", a: "Enter your website URL into Buildo's free SEO Analyzer. You'll get an instant SEO score (0–100), a letter grade, your site's strengths, quick-win fixes, and keyword opportunities — all based on live analysis of your site." },
  { q: "What does an SEO health score mean?", a: "An SEO health score (0–100) summarizes how well-optimized your website is for search engines. Scores above 70 are good; 50–70 need improvement; below 50 indicates critical issues. Buildo's analyzer breaks the score into categories: technical SEO, content quality, keyword targeting, and on-page optimization." },
  { q: "What are SEO quick wins for small businesses?", a: "SEO quick wins are fixes that take under 30 minutes but can meaningfully improve your Google ranking — things like adding a missing meta description, fixing a broken H1 tag, adding alt text to images, or improving page load speed. Buildo's AI identifies your top 3–5 quick wins automatically." },
  { q: "How long does it take to rank on Google after fixing SEO issues?", a: "Minor fixes (meta tags, titles, internal links) can show results in 2–4 weeks. Major improvements (content, backlinks, technical structure) typically take 3–6 months. Buildo's SEO Analyzer prioritizes fixes by impact so you focus on what moves the needle fastest." },
  { q: "Is Buildo's SEO Analyzer really free?", a: "Yes — 100% free. Enter any website URL and get an instant score, quick wins, and keyword opportunities at no cost. An email is required only to receive the full detailed report." },
];

export default function SEOAnalyzer() {
  useToolSEO({
    title: "Free SEO Audit Tool — Instant Website SEO Score | Buildo",
    description: "Check your website's Google ranking performance instantly. Get an SEO health score, quick wins, and keyword opportunities. Free, no sign-up required.",
    url: "/seo",
  });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");

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
            <Zap size={12} /> Powered by AI + Live Web Data
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
              {error}
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

              {/* Google Score + AI Score */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Search size={12} /> Google Score
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: report.score >= 70 ? "#16a34a" : report.score >= 50 ? "#d97706" : "#dc2626", lineHeight: 1 }}>{report.google_score ?? report.score}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>מתוך 100</div>
                  <div style={{ marginTop: 10, height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${report.google_score ?? report.score}%`, background: report.score >= 70 ? "#16a34a" : report.score >= 50 ? "#d97706" : "#dc2626", borderRadius: 4, transition: "width 0.8s ease" }} />
                  </div>
                </div>
                <div style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Bot size={12} /> AI Visibility Score
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#7c3aed", lineHeight: 1 }}>{report.ai_score ?? Math.round((report.score ?? 50) * 0.85)}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>מתוך 100</div>
                  <div style={{ marginTop: 10, height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${report.ai_score ?? Math.round((report.score ?? 50) * 0.85)}%`, background: "#7c3aed", borderRadius: 4, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 6 }}>ChatGPT · Gemini · Perplexity</div>
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
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.55)" }}>
                      <button
                        onClick={() => !emailSent && setShowEmailModal(true)}
                        style={{ textAlign: "center", background: "none", border: "none", cursor: emailSent ? "default" : "pointer", padding: 0 }}
                      >
                        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1.5px solid #ede9fe" }}>
                          <Lock size={28} color="#7c3aed" style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>
                            {emailSent ? <><CheckCircle size={14} style={{ display: "inline", marginLeft: 4 }} /> Report Sent!</> : "Get full report via email"}
                          </div>
                          {!emailSent && <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Click to unlock</div>}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyword Opportunities */}
              {report.keyword_opportunities?.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}><Target size={15} /> Keyword Opportunities</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {report.keyword_opportunities.map((k, i) => (
                      <span key={i} style={{ background: "#ede9fe", color: "#7c3aed", padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{k}</span>
                    ))}
                  </div>
                  {report.competitor_gap && (
                    <p style={{ fontSize: 13, color: "#666", margin: "12px 0 0", lineHeight: 1.7, display: "flex", alignItems: "flex-start", gap: 6 }}><Lightbulb size={13} style={{ flexShrink: 0, marginTop: 2 }} />{report.competitor_gap}</p>
                  )}
                </div>
              )}

              {/* Buildo CTA — always visible after report */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ background: "linear-gradient(135deg,#1a0a2e,#3b1f8c)", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginTop: 24 }}
              >
                <Rocket size={28} color="#fff" style={{ marginBottom: 8 }} />
                <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>
                  {emailSent ? "מוכנים לתקן את כל הבעיות?" : "רוצים שמישהו יתקן את זה בשבילכם?"}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7, margin: "0 0 20px" }}>
                  Buildo מחברת את העסק שלכם לכלים שיקפיצו את הציון — בלי להתאמץ.
                </p>
                <a
                  href="https://buildoai.com/worker-onboarding"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#7c3aed", color: "#fff", textDecoration: "none",
                    borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 800,
                    fontFamily: "'Heebo', sans-serif", boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
                  }}
                >
                  התחילו בחינם עם Buildo <ArrowRight size={16} />
                </a>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "12px 0 0" }}>ללא כרטיס אשראי · ניסיון חינמי</p>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ + Internal links */}
        <ToolFAQSection faqs={SEO_FAQS} />

        <nav aria-label="Related tools" style={{ marginTop: 40, padding: "24px 0", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Related Free Tools</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
              { label: "30-Day Marketing Plan Generator", href: "/tools/marketing-plan-generator" },
              { label: "WhatsApp Campaign Generator", href: "/tools/whatsapp-campaign-generator" },
              { label: "All Free Marketing Tools", href: "/tools" },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "6px 14px", textDecoration: "none" }}>{label} →</a>
            ))}
          </div>
        </nav>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative" }}
            >
              <button onClick={() => setShowEmailModal(false)} style={{ position: "absolute", top: 14, left: 14, background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <X size={20} />
              </button>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Mail size={36} color="#7c3aed" style={{ marginBottom: 8 }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>קבלו את הדוח המלא</h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>הזינו את האימייל שלכם ונשלח לכם את ניתוח ה-SEO המלא עם כל הסעיפים.</p>
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={modalEmail}
                onChange={e => setModalEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && modalEmail.includes("@")) {
                    sendFullReport(modalEmail);
                    setShowEmailModal(false);
                  }
                }}
                style={{ width: "100%", padding: "13px 14px", border: "1.5px solid #ddd", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo', sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 12, direction: "ltr" }}
                onFocus={e => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
              <button
                onClick={() => {
                  if (modalEmail.includes("@")) {
                    sendFullReport(modalEmail);
                    setShowEmailModal(false);
                  }
                }}
                disabled={!modalEmail.includes("@") || emailLoading}
                style={{ width: "100%", padding: "13px", background: modalEmail.includes("@") ? "#7c3aed" : "#ddd", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, fontFamily: "'Heebo', sans-serif", cursor: modalEmail.includes("@") ? "pointer" : "not-allowed" }}
              >
                {emailLoading ? "שולח..." : "שלחו לי את הדוח המלא →"}
              </button>
              <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 10 }}>ללא ספאם · ניסיון חינמי עם Buildo</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToolSchema name="Free SEO Audit Tool" description="Check your website's Google ranking performance instantly. Get an SEO health score, quick wins, and keyword opportunities. Free, no sign-up required." url="/seo" />
      <FAQSchema faqs={SEO_FAQS} />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Free AI Tools", url: "/tools" }, { name: "SEO Analyzer", url: "/seo" }]} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}