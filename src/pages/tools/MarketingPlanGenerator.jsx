import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Lock, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";
import PageHeader from "@/components/landing/PageHeader";
import FinalCTA from "@/components/landing/FinalCTA";
import useToolSEO from "@/components/seo/useToolSEO";
import { ToolSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ToolFAQSection from "@/components/seo/ToolFAQSection";

const MP_FAQS = [
  { q: "What is an AI marketing plan generator?", a: "An AI marketing plan generator creates a customized, actionable marketing strategy for your business based on your industry, budget, goals, and preferred channels. Buildo's free generator produces a full 30-day plan with weekly activities, campaign ideas, and a budget split in seconds." },
  { q: "How do I create a 30-day marketing plan for my small business?", a: "Define your goal (leads, sales, bookings), choose your channels (Facebook, Instagram, WhatsApp, email), set your budget, and let Buildo's AI generate a week-by-week action plan with specific campaign ideas and a content calendar preview." },
  { q: "How should I split my marketing budget across channels?", a: "Budget split depends on your industry and goal. For most local businesses, Facebook and Instagram typically get 50–60% for paid reach, with the remainder split between WhatsApp/email (nurture) and Google (search intent). Buildo's AI calculates a recommended split based on your specific inputs." },
  { q: "What makes a good 30-day marketing plan?", a: "A strong 30-day marketing plan has a clear theme for each week, specific daily or weekly actions, at least 3 distinct campaign ideas to test, a realistic budget allocation, and a content cadence that matches your audience's online behavior." },
  { q: "Is the 30-day marketing plan generator free?", a: "Yes. The full plan generator is free — no credit card, no account required. You get a week-by-week plan, campaign ideas, and a budget split at no cost." },
];

const GOALS = ["Generate leads", "Drive sales", "Increase bookings", "Build awareness"];
const CHANNELS = ["Facebook", "Instagram", "LinkedIn", "Google", "WhatsApp", "Email"];
const BUDGETS = ["Under $500", "$500–$2,000", "$2,000–$5,000", "$5,000+"];

export default function MarketingPlanGenerator() {
  const [form, setForm] = useState({ industry: "", budget: "", goal: "", channels: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useToolSEO({
    title: "Free 30-Day Marketing Plan Generator for Small Business | Buildo",
    description: "Generate a complete 30-day marketing plan with weekly activities, campaign ideas, and budget split — free, instant, no sign-up required.",
    url: "/tools/marketing-plan-generator",
  });

  useEffect(() => {
    track.pageView("tools/marketing-plan-generator", { tool_name: "marketing_plan_generator", page_template: "tool" });
  }, []);

  const toggleChannel = (ch) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }));
  };

  const canSubmit = form.industry && form.budget && form.goal && form.channels.length > 0;

  const generate = async () => {
    setLoading(true);
    setResult(null);
    track.freeToolStarted("tools/marketing-plan-generator", "marketing_plan_generator", { industry: form.industry });
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a 30-day marketing plan for:
Industry: ${form.industry}
Monthly Budget: ${form.budget}
Goal: ${form.goal}
Channels: ${form.channels.join(", ")}

Return JSON:
{
  "weekly_plan": [
    { "week": 1, "theme": "...", "activities": ["activity 1", "activity 2", "activity 3"] },
    { "week": 2, ... },
    { "week": 3, ... },
    { "week": 4, ... }
  ],
  "campaign_ideas": ["idea 1", "idea 2", "idea 3"],
  "budget_split": [{ "channel": "Facebook", "percentage": 40, "rationale": "..." }],
  "content_calendar_preview": ["Day 1: ...", "Day 7: ...", "Day 14: ...", "Day 21: ...", "Day 28: ..."]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            weekly_plan: { type: "array" },
            campaign_ideas: { type: "array", items: { type: "string" } },
            budget_split: { type: "array" },
            content_calendar_preview: { type: "array", items: { type: "string" } },
          },
        },
      });
      setResult(res);
      track.freeToolCompleted("tools/marketing-plan-generator", "marketing_plan_generator", { industry: form.industry });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    track.emailCaptured("tools/marketing-plan-generator", "marketing_plan_generator", { email });
    await base44.entities.Lead.create({ name: "Marketing Plan Lead", email, phone: "n/a", source: "ad_creator" }).catch(() => {});
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
            30-Day Marketing Plan Generator
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Get a personalized monthly marketing plan with weekly activities, campaign ideas, and budget allocation.
          </p>
        </div>

        <div style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Your Industry</label>
              <input
                type="text"
                placeholder="e.g. Restaurant, Gym, Law Firm"
                value={form.industry}
                onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Monthly Budget</label>
              <select
                value={form.budget}
                onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit", boxSizing: "border-box" }}
              >
                <option value="">Select budget...</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Primary Goal</label>
              <select
                value={form.goal}
                onChange={(e) => setForm(f => ({ ...f, goal: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit", boxSizing: "border-box" }}
              >
                <option value="">Select goal...</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Channels (select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  style={{
                    padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: form.channels.includes(ch) ? "1.5px solid #7c3aed" : "1.5px solid #ddd",
                    background: form.channels.includes(ch) ? "#7c3aed" : "#fff",
                    color: form.channels.includes(ch) ? "#fff" : "#555",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {ch}
                </button>
              ))}
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
              fontFamily: "inherit",
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating your plan...</> : <><Sparkles size={16} /> Generate My 30-Day Plan</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 20px" }}>Your 30-Day Marketing Plan</h2>

              {/* Week 1 always visible */}
              {result.weekly_plan?.slice(0, 1).map((week, i) => (
                <WeekCard key={i} week={week} />
              ))}

              {/* Weeks 2–4 locked */}
              {!emailSent ? (
                <div style={{ position: "relative" }}>
                  <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
                    {result.weekly_plan?.slice(1).map((week, i) => <WeekCard key={i + 1} week={week} />)}
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)", borderRadius: 12 }}>
                    <div style={{ background: "#fff", border: "1px solid #ede9fe", borderRadius: 14, padding: "24px", textAlign: "center", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                      <Lock size={28} color="#7c3aed" style={{ marginBottom: 10 }} />
                      <h3 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 8px" }}>Unlock Weeks 2–4 + Campaign Ideas</h3>
                      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Enter your email to unlock the full plan + budget split</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && email && handleEmailSubmit()}
                          style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                        <button onClick={handleEmailSubmit} disabled={!email}
                          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          Unlock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {result.weekly_plan?.slice(1).map((week, i) => <WeekCard key={i + 1} week={week} />)}
                  {result.campaign_ideas?.length > 0 && (
                    <div style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", marginBottom: 10 }}>💡 Campaign Ideas</div>
                      {result.campaign_ideas.map((idea, i) => (
                        <div key={i} style={{ fontSize: 14, color: "#444", padding: "5px 0", borderBottom: i < result.campaign_ideas.length - 1 ? "1px solid #ede9fe" : "none" }}>
                          {i + 1}. {idea}
                        </div>
                      ))}
                    </div>
                  )}
                  {result.budget_split?.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 10 }}>💰 Budget Split</div>
                      {result.budget_split.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 80, color: "#111" }}>{b.channel}</span>
                          <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${b.percentage}%`, background: "#7c3aed", borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", minWidth: 36 }}>{b.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result && <FinalCTA cta="Turn this plan into live campaigns" page="tools/marketing-plan-generator" keyword="marketing plan generator" />}

        <ToolFAQSection faqs={MP_FAQS} />

        <nav aria-label="Related tools" style={{ marginTop: 40, padding: "24px 0", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Related Free Tools</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
              { label: "WhatsApp Campaign Generator", href: "/tools/whatsapp-campaign-generator" },
              { label: "All Free Marketing Tools", href: "/tools" },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "6px 14px", textDecoration: "none" }}>{label} →</a>
            ))}
          </div>
        </nav>
      </div>
      <ToolSchema name="Free 30-Day Marketing Plan Generator" description="Generate a complete 30-day marketing plan with weekly activities, campaign ideas, and budget split — free, instant, no sign-up." url="/tools/marketing-plan-generator" />
      <FAQSchema faqs={MP_FAQS} />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Free AI Tools", url: "/tools" }, { name: "Marketing Plan Generator", url: "/tools/marketing-plan-generator" }]} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function WeekCard({ week }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>W{week.week}</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{week.theme}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {week.activities?.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#555" }}>
            <span style={{ color: "#7c3aed", fontWeight: 700, flexShrink: 0 }}>→</span> {a}
          </div>
        ))}
      </div>
    </div>
  );
}