import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import PageHeader from "@/components/landing/PageHeader";
import FAQBlock from "@/components/landing/FAQBlock";
import FinalCTA from "@/components/landing/FinalCTA";
import RelatedPages from "@/components/landing/RelatedPages";

const COMPARISONS = {
  "buildo-vs-chatgpt": {
    title: "Buildo vs ChatGPT",
    keyword: "buildo vs chatgpt for marketing",
    h1: "ChatGPT gives you text. Buildo runs your marketing.",
    intro: "ChatGPT is a great writing tool. But it doesn't remember your business, can't build a full campaign, and won't publish anything. Buildo picks up where ChatGPT stops.",
    competitor: "ChatGPT",
    sections: [
      {
        title: "Generic chat vs business memory",
        buildo: "Learns your business once — logo, offer, audience, tone — and uses it across every campaign.",
        them: "Requires a new prompt every session. Doesn't remember anything about your business.",
      },
      {
        title: "Prompting vs campaign workflow",
        buildo: "Structured workflow: strategy → copy → creative → publish. No prompt engineering needed.",
        them: "You need to know what to ask. Output is text only, with no structure or next step.",
      },
      {
        title: "Content draft vs publishing",
        buildo: "Connects to Facebook, Instagram, WhatsApp, and landing pages. Campaigns go live with approval.",
        them: "Produces a draft. You copy-paste it manually into each platform.",
      },
      {
        title: "Manual approval",
        buildo: "Every campaign goes through an approval step. You stay in control.",
        them: "No publishing — approval is irrelevant.",
      },
    ],
    relatedLinks: [
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Best AI Marketing Tools", href: "/best-ai-marketing-tools-small-business" },
      { label: "Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
    ],
  },
  "buildo-vs-marketing-agency": {
    title: "Buildo vs Marketing Agency",
    keyword: "buildo vs marketing agency",
    h1: "Agency retainer vs AI marketing worker — where the money goes",
    intro: "An agency gives you account managers, strategy decks, and monthly reports. Buildo gives you campaigns in minutes, at a fraction of the cost, with you in control of every approval.",
    competitor: "Marketing Agency",
    sections: [
      {
        title: "Cost comparison",
        buildo: "Flat monthly subscription. No setup fees, no hidden costs, no management markups.",
        them: "Typical agency retainer starts at $2,000/month — often more for ads management.",
      },
      {
        title: "Speed",
        buildo: "First campaign ready in under 10 minutes. New campaigns launched same day.",
        them: "Strategy → brief → creative → revisions → approval. Typically 2–4 weeks per campaign.",
      },
      {
        title: "Control and approval",
        buildo: "You approve every asset before it goes live. Full visibility into what's being published.",
        them: "Agencies run your accounts. You may see reports but not always individual posts.",
      },
      {
        title: "What agencies still do better",
        buildo: "Complex media buying at scale, PR and influencer relationships, enterprise strategy.",
        them: "Deep expertise in specific verticals, relationships with media, multi-brand management.",
      },
    ],
    relatedLinks: [
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Buildo vs ChatGPT", href: "/buildo-vs-chatgpt" },
      { label: "Best AI Marketing Tools", href: "/best-ai-marketing-tools-small-business" },
    ],
  },
  "buildo-vs-canva": {
    title: "Buildo vs Canva",
    keyword: "buildo vs canva for marketing",
    h1: "Canva creates the image. Buildo runs the campaign.",
    intro: "Canva is excellent for design. But design is just one part of a campaign. Buildo creates the strategy, copy, and assets — and helps you publish across channels with one click.",
    competitor: "Canva",
    sections: [
      {
        title: "Design vs full campaign",
        buildo: "Creates campaign strategy, ad copy, creative direction, and publishing — all in one flow.",
        them: "Drag-and-drop design tool. Excellent for graphics, but no strategy or publishing workflow.",
      },
      {
        title: "Copy and messaging",
        buildo: "Generates ad headlines, body copy, CTA, and email templates based on your business data.",
        them: "You write the copy yourself. Templates exist but don't know your business.",
      },
      {
        title: "Channel publishing",
        buildo: "Connects to Facebook, Instagram, WhatsApp, and landing pages.",
        them: "You download the design and upload it manually to each platform.",
      },
      {
        title: "When Canva wins",
        buildo: "Pure design work, brand identity, presentations, print materials.",
        them: "World-class design tool for anything visual — nothing beats it for standalone graphics.",
      },
    ],
    relatedLinks: [
      { label: "Facebook Ad Generator", href: "/tools/facebook-ad-generator" },
      { label: "AI Campaign Builder for Small Business", href: "/ai-campaign-builder-for-small-business" },
      { label: "Buildo vs ChatGPT", href: "/buildo-vs-chatgpt" },
    ],
  },
};

function ComparisonRow({ section, competitor }) {
  return (
    <div style={{ borderBottom: "1px solid #f0f0f0", padding: "20px 0" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 14px" }}>{section.title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#166534", marginBottom: 8 }}>
            <Check size={14} /> Buildo
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{section.buildo}</p>
        </div>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#991b1b", marginBottom: 8 }}>
            <X size={14} /> {competitor}
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{section.them}</p>
        </div>
      </div>
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
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#111" }}>
      <PageHeader />

      <section style={{ background: "linear-gradient(135deg,#0f0720,#1e0a4e)", padding: "72px 20px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 20 }}>
            Comparison
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, margin: "0 0 16px" }}>{page.h1}</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 28px" }}>{page.intro}</p>
          <a
            href="https://buildoai.com/worker-onboarding"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.signupStarted(slug, { keyword: page.keyword })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#7c3aed", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 800,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            Try Buildo Free <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", textAlign: "center", margin: "0 0 32px" }}>
          Buildo vs {page.competitor} — Side by Side
        </h2>
        {page.sections.map((s, i) => (
          <ComparisonRow key={i} section={s} competitor={page.competitor} />
        ))}
      </section>

      <FAQBlock />
      <RelatedPages links={page.relatedLinks} />
      <FinalCTA cta="Build your first campaign free" page={slug} keyword={page.keyword} />
    </div>
  );
}