import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Lock, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";
import PageHeader from "@/components/landing/PageHeader";
import FinalCTA from "@/components/landing/FinalCTA";
import useToolSEO from "@/components/seo/useToolSEO";
import { ToolSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ToolFAQSection from "@/components/seo/ToolFAQSection";

const WA_FAQS = [
  { q: "What is a WhatsApp campaign generator?", a: "A WhatsApp campaign generator creates a sequence of ready-to-send WhatsApp messages for your business — including an initial broadcast, follow-ups, urgency messages, thank-you notes, and re-engagement messages. Buildo's free generator produces a complete 5-message sequence in seconds." },
  { q: "How do I create a WhatsApp marketing campaign?", a: "Enter your business name, offer, and target audience into Buildo's WhatsApp Campaign Generator. The AI writes a 5-message sequence: (1) initial offer broadcast, (2) 24-hour follow-up, (3) last-chance reminder, (4) post-purchase thank-you, and (5) 30-day re-engagement message." },
  { q: "What is the best time to send WhatsApp marketing messages?", a: "For most businesses, the highest open rates occur between 9–11am and 6–9pm on weekdays. Avoid early mornings, late nights, and Mondays. Buildo's AI includes personalized send-time recommendations based on your industry and audience." },
  { q: "What should I include in a WhatsApp marketing message?", a: "Effective WhatsApp messages are short (under 160 characters for the first line), use emojis sparingly, include a clear offer or value, have a single call-to-action, and feel personal rather than promotional. Buildo's AI applies these best practices automatically." },
  { q: "Is WhatsApp marketing legal for businesses?", a: "Yes, WhatsApp Business marketing is legal when recipients have opted in to receive messages from you. Buildo's generated sequences include opt-in best practices and messaging that complies with WhatsApp Business Policy guidelines." },
];

export default function WhatsAppCampaignGenerator() {
  const [form, setForm] = useState({ business: "", offer: "", audience: "", goal: "Drive bookings" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(null);

  useToolSEO({
    title: "Free WhatsApp Campaign Generator — 5-Message Sequence | Buildo",
    description: "Generate a complete WhatsApp marketing sequence — broadcast, follow-ups, and re-engagement — for your business. Free, instant, no sign-up.",
    url: "/tools/whatsapp-campaign-generator",
  });

  useEffect(() => {
    track.pageView("tools/whatsapp-campaign-generator", { tool_name: "whatsapp_campaign_generator", page_template: "tool" });
  }, []);

  const canSubmit = form.business && form.offer && form.audience;

  const generate = async () => {
    setLoading(true);
    setResult(null);
    track.freeToolStarted("tools/whatsapp-campaign-generator", "whatsapp_campaign_generator");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a WhatsApp marketing campaign for:
Business: ${form.business}
Offer: ${form.offer}
Target Audience: ${form.audience}
Goal: ${form.goal}

Return JSON:
{
  "messages": [
    { "type": "broadcast", "label": "Initial Offer", "message": "...(natural WhatsApp tone, 2-3 sentences, include emoji)" },
    { "type": "followup", "label": "24h Follow-up", "message": "..." },
    { "type": "reminder", "label": "Last Chance", "message": "..." },
    { "type": "thank_you", "label": "Post-purchase Thank You", "message": "..." },
    { "type": "reactivation", "label": "Re-engagement (30 days later)", "message": "..." }
  ],
  "best_send_times": "When to send for best open rates (2 sentences)",
  "opt_in_tip": "How to grow your WhatsApp subscriber list (2 sentences)"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            messages: { type: "array" },
            best_send_times: { type: "string" },
            opt_in_tip: { type: "string" },
          },
        },
      });
      setResult(res);
      track.freeToolCompleted("tools/whatsapp-campaign-generator", "whatsapp_campaign_generator");
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
    track.emailCaptured("tools/whatsapp-campaign-generator", "whatsapp_campaign_generator", { email });
    await base44.entities.Lead.create({ name: "WA Campaign Lead", email, phone: "n/a", source: "ad_creator" }).catch(() => {});
    setEmailSent(true);
  };

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#111", minHeight: "100vh", background: "#fff" }}>
      <PageHeader />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 14 }}>
            🆓 Free Tool
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#111", margin: "0 0 10px" }}>
            WhatsApp Campaign Generator
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Generate a full 5-message WhatsApp sequence — broadcast, follow-ups, and re-engagement — ready to send.
          </p>
        </div>

        <div style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 14 }}>
            {[
              { key: "business", label: "Business Name", placeholder: "e.g. Green Yoga Studio" },
              { key: "offer", label: "Your Offer", placeholder: "e.g. First class free" },
              { key: "audience", label: "Target Audience", placeholder: "e.g. Women 25–45 near Ramat Gan" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{label}</label>
                <input type="text" placeholder={placeholder} value={form[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={(e) => { e.target.style.borderColor = "#25D366"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={generate}
            disabled={loading || !canSubmit}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: 10,
              background: canSubmit && !loading ? "#25D366" : "#ddd",
              color: canSubmit && !loading ? "#fff" : "#999",
              fontSize: 15, fontWeight: 800, cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit",
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating messages...</> : <><Sparkles size={16} /> Generate WhatsApp Campaign</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 20px" }}>Your 5-Message WhatsApp Sequence</h2>

              {/* First 2 messages always visible */}
              {result.messages?.slice(0, 2).map((msg, i) => (
                <MessageBubble key={i} msg={msg} index={i} onCopy={copy} copied={copied} />
              ))}

              {/* Rest locked */}
              {!emailSent ? (
                <div style={{ position: "relative" }}>
                  <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
                    {result.messages?.slice(2).map((msg, i) => <MessageBubble key={i + 2} msg={msg} index={i + 2} onCopy={copy} copied={copied} />)}
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)", borderRadius: 12 }}>
                    <div style={{ background: "#fff", border: "1px solid #dcfce7", borderRadius: 14, padding: "24px", textAlign: "center", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                      <Lock size={28} color="#25D366" style={{ marginBottom: 10 }} />
                      <h3 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 8px" }}>Unlock All 5 Messages</h3>
                      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Enter your email to see the full sequence</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && email && handleEmailSubmit()}
                          style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                        <button onClick={handleEmailSubmit} disabled={!email}
                          style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          Unlock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                result.messages?.slice(2).map((msg, i) => <MessageBubble key={i + 2} msg={msg} index={i + 2} onCopy={copy} copied={copied} />)
              )}

              {emailSent && result.best_send_times && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 4 }}>⏰ Best Send Times</div>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.7 }}>{result.best_send_times}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result && <FinalCTA cta="Create a full WhatsApp campaign in Buildo" page="tools/whatsapp-campaign-generator" keyword="whatsapp campaign generator" />}

        <ToolFAQSection faqs={WA_FAQS} />

        <nav aria-label="Related tools" style={{ marginTop: 40, padding: "24px 0", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Related Free Tools</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
              { label: "30-Day Marketing Plan Generator", href: "/tools/marketing-plan-generator" },
              { label: "All Free Marketing Tools", href: "/tools" },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{ fontSize: 13, fontWeight: 700, color: "#25D366", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 14px", textDecoration: "none" }}>{label} →</a>
            ))}
          </div>
        </nav>
      </div>
      <ToolSchema name="Free WhatsApp Campaign Generator" description="Generate a complete 5-message WhatsApp marketing sequence instantly — broadcast, follow-ups, and re-engagement. Free, no sign-up." url="/tools/whatsapp-campaign-generator" />
      <FAQSchema faqs={WA_FAQS} />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Free AI Tools", url: "/tools" }, { name: "WhatsApp Campaign Generator", url: "/tools/whatsapp-campaign-generator" }]} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MessageBubble({ msg, index, onCopy, copied }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
      style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{msg.label}</span>
        <button onClick={() => onCopy(msg.message, index)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>
          {copied === index ? <><Check size={10} color="#25D366" /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <div style={{ background: "#dcfce7", borderRadius: "0 12px 12px 12px", padding: "12px 14px", fontSize: 14, color: "#111", lineHeight: 1.7, maxWidth: "85%", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {msg.message}
      </div>
    </motion.div>
  );
}