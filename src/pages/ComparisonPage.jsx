import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, X, ArrowRight, ChevronDown } from "lucide-react";
import { track } from "@/lib/analytics";

const COMPARISONS = {
  "buildo-vs-chatgpt": {
    title: "Buildo vs ChatGPT for Marketing",
    keyword: "buildo vs chatgpt for marketing",
    h1: "ChatGPT gives you text.",
    h1b: "Buildo runs your marketing.",
    badge: "Buildo vs ChatGPT",
    intro: "ChatGPT is a great writing tool. But it doesn't remember your business, can't build a full campaign, and won't publish anything. Buildo picks up where ChatGPT stops.",
    competitor: "ChatGPT",
    sections: [
      {
        title: "Business memory",
        buildo: "Learns your business once — logo, offer, audience, tone — and uses it across every campaign forever.",
        them: "Requires a new prompt every session. Forgets everything the moment you close the tab.",
      },
      {
        title: "Campaign workflow",
        buildo: "Structured workflow: strategy → copy → creative → publish. No prompt engineering needed.",
        them: "You need to know what to ask. Output is text only, with no structure or publishing step.",
      },
      {
        title: "Publishing to channels",
        buildo: "Connects to Facebook, Instagram, WhatsApp, and landing pages. Campaigns go live in minutes.",
        them: "Produces a draft. You copy-paste manually into every platform — every single time.",
      },
      {
        title: "Human approval",
        buildo: "Every campaign goes through your approval step before going live. Full control.",
        them: "No publishing workflow — approval doesn't even apply.",
      },
    ],
    faqs: [
      { q: "Is Buildo better than ChatGPT for marketing?", a: "For marketing specifically, yes. ChatGPT is a general-purpose writing tool — it requires you to prompt it every time and doesn't remember your business. Buildo is purpose-built for marketing: it learns your brand once, builds structured campaigns, and publishes them across your channels." },
      { q: "Can I use both Buildo and ChatGPT?", a: "Absolutely. Many business owners use ChatGPT for brainstorming and ad-hoc writing, while using Buildo for actual campaign execution and publishing. They complement each other." },
      { q: "Does Buildo use AI like ChatGPT?", a: "Yes — Buildo is powered by advanced AI, but it's wrapped in a marketing workflow designed for business owners. You don't need to write prompts or know AI terminology." },
    ],
    relatedLinks: [
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Buildo vs Marketing Agency", href: "/buildo-vs-marketing-agency" },
      { label: "Free Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
    ],
  },
  "buildo-vs-marketing-agency": {
    title: "Buildo vs Marketing Agency — Cost & Speed",
    keyword: "buildo vs marketing agency",
    h1: "Agency retainer vs AI marketing.",
    h1b: "Where your money actually goes.",
    badge: "Buildo vs Agency",
    intro: "An agency gives you account managers, strategy decks, and monthly reports. Buildo gives you campaigns in minutes, at a fraction of the cost, with full approval control.",
    competitor: "Agency",
    sections: [
      {
        title: "Monthly cost",
        buildo: "Flat monthly subscription starting at $17. No setup fees, no hidden costs, no management markups.",
        them: "Typical agency retainer starts at $2,000/month — often $5,000+ once you add ads management.",
      },
      {
        title: "Time to first campaign",
        buildo: "First campaign ready in under 10 minutes. New campaigns launched same day.",
        them: "Strategy → brief → creative → revisions → approval. Typically 2–4 weeks per campaign.",
      },
      {
        title: "Control & visibility",
        buildo: "You approve every asset before it goes live. Full visibility into every post, ad, and spend.",
        them: "Agencies run your accounts. You receive reports, but rarely see individual assets before publishing.",
      },
      {
        title: "Where agencies still win",
        buildo: "For solo campaigns, local businesses, and fast-moving brands — Buildo delivers more per dollar.",
        them: "Complex enterprise media buying, PR and influencer relationships, multi-brand management.",
      },
    ],
    faqs: [
      { q: "Is Buildo cheaper than a marketing agency?", a: "Dramatically cheaper. Most agencies charge $2,000–$8,000/month in retainer fees alone, before ad spend. Buildo starts at $17/month with no fees on your ad budget." },
      { q: "Can Buildo replace my marketing agency?", a: "For most small and medium businesses, yes. Buildo handles strategy, content creation, and publishing across all major channels. If you need complex PR, influencer management, or enterprise media buying, an agency may still add value." },
      { q: "What about ad spend — does Buildo take a percentage?", a: "Never. Unlike agencies that take 10–20% of your ad budget, Buildo charges a flat subscription fee. Every dollar of your ad budget goes 100% to promoting your business." },
    ],
    relatedLinks: [
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Buildo vs ChatGPT", href: "/buildo-vs-chatgpt" },
      { label: "Buildo vs Canva", href: "/buildo-vs-canva" },
    ],
  },
  "buildo-vs-canva": {
    title: "Buildo vs Canva — Full Marketing vs Design Tool",
    keyword: "buildo vs canva for marketing",
    h1: "Canva creates the image.",
    h1b: "Buildo runs the whole campaign.",
    badge: "Buildo vs Canva",
    intro: "Canva is excellent for design. But design is just one part of a campaign. Buildo creates the strategy, copy, and assets — and publishes across channels with one click.",
    competitor: "Canva",
    sections: [
      {
        title: "Design vs full campaign",
        buildo: "Creates campaign strategy, ad copy, creative direction, and publishing — all in one flow.",
        them: "Drag-and-drop design tool. Excellent for graphics, but no strategy, copy, or publishing workflow.",
      },
      {
        title: "Copy and messaging",
        buildo: "Generates ad headlines, body copy, CTA, and email templates based on your business DNA.",
        them: "You write the copy yourself. Templates exist but don't know your business or audience.",
      },
      {
        title: "Publishing to channels",
        buildo: "Connects directly to Facebook, Instagram, WhatsApp, and landing pages. One-click publish.",
        them: "You download the design and upload it manually to each platform. No direct publishing.",
      },
      {
        title: "When Canva still wins",
        buildo: "Pure standalone design, brand identity kits, presentations, and print materials.",
        them: "World-class visual design tool — for pure design work, Canva is unbeatable.",
      },
    ],
    faqs: [
      { q: "Is Buildo better than Canva for marketing?", a: "They solve different problems. Canva is a design tool — it helps you make something look good. Buildo is a marketing execution platform — it handles strategy, copy, design direction, and publishing. For running actual campaigns, Buildo is the complete solution." },
      { q: "Can I use Buildo and Canva together?", a: "Yes. Some users design specific brand assets in Canva, then use Buildo for campaign strategy, copy, and distribution. Buildo can incorporate your brand visuals into campaigns." },
      { q: "Does Buildo create images like Canva?", a: "Buildo generates AI-powered campaign creatives tailored to your brand and offer. It's not a manual design tool like Canva, but it produces professional ad images automatically, without design skills required." },
    ],
    relatedLinks: [
      { label: "Free Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Buildo vs ChatGPT", href: "/buildo-vs-chatgpt" },
    ],
  },
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: "1px solid #ede9fe",
        padding: "20px 0",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a0a2e" }}>{q}</span>
        <ChevronDown
          size={18}
          style={{
            color: "#7c3aed", flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>
      {open && (
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, margin: "12px 0 0" }}>{a}</p>
      )}
    </div>
  );
}

export default function ComparisonPage() {
  const location = useLocation();
  const slug = location.pathname.replace("/", "");
  const page = COMPARISONS[slug];

  useEffect(() => {
    if (page) {
      document.title = `${page.title} | Buildo`;
      track.pageView(slug, { keyword: page.keyword, page_template: "comparison" });
    }
  }, [slug, page]);

  if (!page) return <div style={{ padding: 40, fontFamily: "'Heebo', sans-serif" }}>Page not found.</div>;

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#1a0a2e", background: "#fff" }}>

      {/* Nav */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0eeff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="https://buildoai.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>B</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1a0a2e" }}>Buildo</span>
        </a>
        <a
          href="https://buildoai.com/worker-onboarding"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#7c3aed", color: "#fff", textDecoration: "none",
            borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          Try free →
        </a>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #faf8ff 0%, #f0ebff 100%)", padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ede9fe", borderRadius: 20, padding: "5px 16px",
            fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 24, letterSpacing: "0.04em"
          }}>
            {page.badge}
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "#1a0a2e", lineHeight: 1.1, margin: "0 0 8px" }}>
            {page.h1}
          </h1>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "#7c3aed", lineHeight: 1.1, margin: "0 0 24px" }}>
            {page.h1b}
          </h1>
          <p style={{ fontSize: 17, color: "#555", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 36px" }}>
            {page.intro}
          </p>
          <a
            href="https://buildoai.com/worker-onboarding"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.signupStarted(slug, { keyword: page.keyword })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#7c3aed", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 800,
              fontFamily: "'Heebo', sans-serif",
              boxShadow: "0 8px 32px rgba(124,58,237,0.3)",
            }}
          >
            Build your first campaign free <ArrowRight size={18} />
          </a>
          <p style={{ fontSize: 12, color: "#999", marginTop: 12 }}>No credit card · Free trial · Ready in minutes</p>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1a0a2e", textAlign: "center", margin: "0 0 48px" }}>
          Buildo vs {page.competitor} — Feature by Feature
        </h2>

        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div />
          <div style={{ background: "#7c3aed", borderRadius: "12px 12px 0 0", padding: "12px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>✦ Buildo</span>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: "12px 12px 0 0", padding: "12px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#888" }}>{page.competitor}</span>
          </div>
        </div>

        {page.sections.map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8,
          }}>
            <div style={{
              background: "#faf8ff", border: "1px solid #ede9fe", borderRadius: 10,
              padding: "16px", display: "flex", alignItems: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a0a2e" }}>{s.title}</span>
            </div>
            <div style={{ background: "#f5f0ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "16px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{s.buildo}</p>
              </div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <X size={11} color="#9ca3af" strokeWidth={3} />
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{s.them}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Social proof strip */}
      <section style={{ background: "linear-gradient(160deg, #faf8ff, #f0ebff)", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>
          Trusted by 450+ businesses
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1a0a2e", margin: "0 0 32px" }}>
          Real businesses. Real results.
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, maxWidth: 800, margin: "0 auto 36px" }}>
          {[
            { quote: "Buildo saved us hours every week. Campaigns run on their own, the creative looks professional.", name: "Ido", company: "tripex." },
            { quote: "We reached new customers on Facebook and Instagram simply and quickly. Highly recommend.", name: "Meir", company: "Ice Class" },
            { quote: "The smartest marketing tool I've used. Campaigns converted from day one.", name: "Gai", company: "Golden Lab" },
          ].map((t, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #ede9fe", borderRadius: 16,
              padding: "24px", maxWidth: 240, textAlign: "left",
              boxShadow: "0 2px 16px rgba(124,58,237,0.06)",
            }}>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: "0 0 16px" }}>"{t.quote}"</p>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a0a2e" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>{t.company}</div>
            </div>
          ))}
        </div>
        <a
          href="https://buildoai.com/worker-onboarding"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#7c3aed", color: "#fff", textDecoration: "none",
            borderRadius: 10, padding: "14px 28px", fontSize: 14, fontWeight: 800,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          Get started free <ArrowRight size={16} />
        </a>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1a0a2e", textAlign: "center", margin: "0 0 40px" }}>
          Frequently asked questions
        </h2>
        {page.faqs.map((f, i) => (
          <FAQItem key={i} q={f.q} a={f.a} />
        ))}
      </section>

      {/* Related */}
      {page.relatedLinks?.length > 0 && (
        <section style={{ background: "#faf8ff", borderTop: "1px solid #ede9fe", padding: "40px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>You might also like</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {page.relatedLinks.map((l, i) => (
                <a key={i} href={l.href} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#fff", border: "1px solid #ede9fe", borderRadius: 8,
                  padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#7c3aed",
                  textDecoration: "none",
                }}>
                  {l.label} <ArrowRight size={12} />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{ background: "#7c3aed", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>
            Ready to stop comparing and start growing?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 28px" }}>
            No agency. No designer. No credit card. Just your business goal and Buildo.
          </p>
          <a
            href="https://buildoai.com/worker-onboarding"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.signupStarted(slug, { keyword: page.keyword, position: "bottom_cta" })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#fff", color: "#7c3aed", textDecoration: "none",
              borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 900,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            Build your first campaign free <ArrowRight size={18} />
          </a>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "14px 0 0" }}>Free trial · No credit card · Response within hours</p>
        </div>
      </section>
    </div>
  );
}