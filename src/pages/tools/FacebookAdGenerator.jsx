import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Copy, Check, ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";
import PageHeader from "@/components/landing/PageHeader";
import FinalCTA from "@/components/landing/FinalCTA";

const INDUSTRIES = ["Restaurant", "Real Estate", "Dental", "Beauty Salon", "Gym", "E-commerce", "Law Firm", "Coaching", "Retail", "Other"];
const TONES = ["Professional", "Friendly", "Urgent", "Inspirational", "Playful"];

export default function FacebookAdGenerator() {
  const [form, setForm] = useState({ business_name: "", industry: "", offer: "", audience: "", tone: "Professional" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailGate, setEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    document.title = "Free Facebook Ad Generator | Buildo";
    track.pageView("tools/facebook-ad-generator", { tool_name: "facebook_ad_generator", page_template: "tool" });
  }, []);

  const canSubmit = form.business_name && form.industry && form.offer && form.audience;

  const generate = async () => {
    setLoading(true);
    setResult(null);
    track.freeToolStarted("tools/facebook-ad-generator", "facebook_ad_generator", { industry: form.industry });
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 Facebook ad variants for this business:
Business: ${form.business_name}
Industry: ${form.industry}
Offer: ${form.offer}
Target Audience: ${form.audience}
Tone: ${form.tone}

Return JSON with:
{
  "ads": [
    {
      "primary_text": "...(max 125 chars)",
      "headline": "...(max 40 chars)",
      "description": "...(max 30 chars)",
      "cta": "Learn More|Shop Now|Sign Up|Book Now|Get Quote"
    }
  ],
  "targeting": "Targeting suggestion (2 sentences)",
  "cta_recommendations": ["CTA 1", "CTA 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            ads: { type: "array", items: { type: "object" } },
            targeting: { type: "string" },
            cta_recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });
      setResult(res);
      track.freeToolCompleted("tools/facebook-ad-generator", "facebook_ad_generator", { industry: form.industry });
      setTimeout(() => setEmailGate(true), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleEmailSubmit = async () => {
    track.emailCaptured("tools/facebook-ad-generator", "facebook_ad_generator", { email });
    await base44.entities.Lead.create({ name: "Ad Generator Lead", email, phone: "n/a", source: "ad_creator" }).catch(() => {});
    setEmailSent(true);
  };

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#111", minHeight: "100vh", background: "#fff" }}>
      <PageHeader />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 14 }}>
            🆓 Free Tool
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#111", margin: "0 0 10px" }}>
            Free Facebook Ad Generator
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Enter your business details and get 3 ready-to-use Facebook ad variants — headlines, copy, and CTAs included.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 14 }}>
            {[
              { key: "business_name", label: "Business Name", placeholder: "e.g. Mario's Pizza" },
              { key: "offer", label: "Your Offer", placeholder: "e.g. 20% off first order" },
              { key: "audience", label: "Target Audience", placeholder: "e.g. Families in Tel Aviv" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Industry</label>
              <select
                value={form.industry}
                onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit", boxSizing: "border-box" }}
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Tone</label>
              <select
                value={form.tone}
                onChange={(e) => setForm(f => ({ ...f, tone: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit", boxSizing: "border-box" }}
              >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading || !canSubmit}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: 10,
              background: canSubmit && !loading ? "#7c3aed" : "#ddd",
              color: canSubmit && !loading ? "#fff" : "#999",
              fontSize: 15, fontWeight: 800, cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating...</> : <><Sparkles size={16} /> Generate 3 Ad Variants</>}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px" }}>Your 3 Ad Variants</h2>

              {/* First ad — always visible */}
              {result.ads?.slice(0, 1).map((ad, i) => (
                <AdCard key={i} ad={ad} index={i} onCopy={copy} copied={copied} />
              ))}

              {/* Remaining ads — locked until email */}
              {!emailSent ? (
                <div style={{ position: "relative" }}>
                  <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
                    {result.ads?.slice(1).map((ad, i) => (
                      <AdCard key={i + 1} ad={ad} index={i + 1} onCopy={copy} copied={copied} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)", borderRadius: 12 }}>
                    <div style={{ background: "#fff", border: "1px solid #ede9fe", borderRadius: 14, padding: "24px", textAlign: "center", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                      <Lock size={28} color="#7c3aed" style={{ marginBottom: 10 }} />
                      <h3 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 8px" }}>Unlock All 3 Variants</h3>
                      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Enter your email to see all variants + targeting suggestions</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && email && handleEmailSubmit()}
                          style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                        />
                        <button
                          onClick={handleEmailSubmit}
                          disabled={!email}
                          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
                        >
                          Unlock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {result.ads?.slice(1).map((ad, i) => (
                    <AdCard key={i + 1} ad={ad} index={i + 1} onCopy={copy} copied={copied} />
                  ))}
                </>
              )}

              {/* Targeting */}
              {emailSent && result.targeting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "16px 18px", marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>🎯 Targeting Suggestion</div>
                  <p style={{ fontSize: 14, color: "#444", lineHeight: 1.7, margin: 0 }}>{result.targeting}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <FinalCTA cta="Create this campaign in Buildo" page="tools/facebook-ad-generator" keyword="facebook ad generator" />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AdCard({ ad, index, onCopy, copied }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}
    >
      <div style={{ background: "#7c3aed", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>Variant {index + 1}</span>
        <button
          onClick={() => onCopy(`${ad.primary_text}\n\n${ad.headline}\n${ad.description}`, index)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}
        >
          {copied === index ? <><Check size={10} color="#4ade80" /> Copied</> : <><Copy size={10} /> Copy all</>}
        </button>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 4 }}>PRIMARY TEXT</div>
          <div style={{ fontSize: 14, color: "#111", lineHeight: 1.7 }}>{ad.primary_text}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 4 }}>HEADLINE</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>{ad.headline}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 4 }}>CTA</div>
            <div style={{ display: "inline-block", background: "#7c3aed", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>{ad.cta}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}