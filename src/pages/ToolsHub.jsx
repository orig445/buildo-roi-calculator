import { Link } from "react-router-dom";
import { Megaphone, CalendarDays, MessageCircle, Zap, Target, Gift, Rocket, SearchCheck } from "lucide-react";
import { OrganizationSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/StructuredData";
import useToolSEO from "@/components/seo/useToolSEO";
import ToolFAQSection from "@/components/seo/ToolFAQSection";
import PageHeader from "@/components/landing/PageHeader";
import FinalCTA from "@/components/landing/FinalCTA";

const TOOLS = [
  {
    href: "/tools/facebook-ad-generator",
    Icon: Megaphone,
    iconColor: "#1877f2",
    iconBg: "#e7f0fd",
    name: "Free Facebook Ad Generator",
    desc: "Generate 3 ready-to-use Facebook ad variants — headlines, primary text, and CTAs — in under 60 seconds. No design skills needed.",
    tags: ["Facebook Ads", "AI Copywriting", "Free"],
  },
  {
    href: "/tools/marketing-plan-generator",
    Icon: CalendarDays,
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    name: "Free 30-Day Marketing Plan Generator",
    desc: "Get a personalized monthly marketing plan with weekly activities, campaign ideas, and budget allocation by channel.",
    tags: ["Marketing Strategy", "Content Calendar", "Budget Split"],
  },
  {
    href: "/tools/whatsapp-campaign-generator",
    Icon: MessageCircle,
    iconColor: "#25D366",
    iconBg: "#f0fdf4",
    name: "Free WhatsApp Campaign Generator",
    desc: "Generate a complete 5-message WhatsApp sequence — broadcast, follow-ups, last-chance, and re-engagement — instantly.",
    tags: ["WhatsApp Marketing", "Automation", "Sequences"],
  },
  {
    href: "/seo",
    Icon: SearchCheck,
    iconColor: "#ea4335",
    iconBg: "#fef2f2",
    name: "Free SEO Analyzer",
    desc: "Get an instant SEO health score for any website — quick wins, keyword gaps, technical issues, and a full audit report.",
    tags: ["SEO Audit", "Quick Wins", "Keyword Analysis"],
  },
];

const FAQS = [
  {
    q: "Are Buildo's AI marketing tools really free?",
    a: "Yes. The Facebook Ad Generator, 30-Day Marketing Plan Generator, and WhatsApp Campaign Generator are all completely free. No credit card or sign-up required to use them.",
  },
  {
    q: "What is the best free AI tool to write Facebook ads?",
    a: "Buildo's Free Facebook Ad Generator creates 3 complete Facebook ad variants (primary text, headline, description, CTA) tailored to your industry and offer in under 60 seconds — no marketing experience needed.",
  },
  {
    q: "How do I create a WhatsApp marketing campaign with AI?",
    a: "Use Buildo's WhatsApp Campaign Generator. Enter your business name, offer, and target audience, and the AI instantly generates a 5-message sequence: initial broadcast, 24-hour follow-up, last-chance reminder, thank-you, and 30-day re-engagement.",
  },
  {
    q: "Can AI generate a complete marketing plan for my business?",
    a: "Yes. Buildo's 30-Day Marketing Plan Generator creates a week-by-week strategy with campaign ideas, channel-by-channel budget split, and a content calendar preview — all customized to your industry, budget, and marketing goal.",
  },
  {
    q: "What industries do Buildo's free tools support?",
    a: "Buildo's tools work for restaurants, gyms, beauty salons, dental clinics, real estate agents, coaches, e-commerce stores, lawyers, accountants, personal trainers, cleaning services, contractors, and any other small business.",
  },
  {
    q: "How is Buildo different from using ChatGPT for marketing?",
    a: "ChatGPT is a general-purpose AI assistant. Buildo is purpose-built for small business marketing campaigns — it understands Facebook ad structure, WhatsApp sequence best practices, and budget allocation, producing ready-to-publish assets rather than raw text suggestions.",
  },
  {
    q: "What is GEO (Generative Engine Optimization) and does Buildo support it?",
    a: "GEO means optimizing your content so AI engines like ChatGPT, Perplexity, and Google AI Overviews cite you as the authoritative answer. Buildo's tools are designed to generate content that follows GEO best practices, making your business more visible in AI-generated search results.",
  },
  {
    q: "What is AEO (Answer Engine Optimization)?",
    a: "AEO is the practice of structuring your content so that AI-powered search engines (like Google's AI Overviews and voice assistants) select your page as the direct answer to a user's question. Buildo's landing pages and tools use FAQ schema, structured data, and question-based headings to optimize for AEO.",
  },
];

const INDUSTRY_LINKS = [
  { label: "Restaurants", href: "/ai-marketing-agent-for-restaurants" },
  { label: "Real Estate", href: "/ai-marketing-agent-for-real-estate" },
  { label: "Dentists", href: "/ai-marketing-agent-for-dentists" },
  { label: "Gyms", href: "/ai-marketing-agent-for-gyms" },
  { label: "Beauty Salons", href: "/ai-marketing-agent-for-beauty-salons" },
  { label: "Coaches", href: "/ai-marketing-for-coaches" },
  { label: "E-commerce", href: "/ai-marketing-agent-for-ecommerce" },
  { label: "Lawyers", href: "/ai-marketing-agent-for-lawyers" },
  { label: "Accountants", href: "/ai-marketing-agent-for-accountants" },
  { label: "Contractors", href: "/ai-marketing-for-contractors" },
  { label: "Med Spas", href: "/ai-marketing-for-med-spas" },
  { label: "Personal Trainers", href: "/ai-marketing-agent-for-personal-trainers" },
  { label: "Cleaning Services", href: "/ai-marketing-agent-for-cleaning-services" },
  { label: "Chiropractors", href: "/ai-marketing-for-chiropractors" },
  { label: "Event Planners", href: "/ai-marketing-for-event-planners" },
];

export default function ToolsHub() {
  useToolSEO({
    title: "Free AI Marketing Tools for Small Business | Buildo",
    description: "Free AI tools for small businesses: generate Facebook ads, 30-day marketing plans, and WhatsApp campaigns in seconds. No sign-up. No credit card.",
    url: "/tools",
  });

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#111", minHeight: "100vh", background: "#fff" }}>
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Free AI Marketing Tools", url: "/tools" }]} />
      <FAQSchema faqs={FAQS} />

      <PageHeader />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", padding: "60px 20px 52px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#7c3aed", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
            <Gift size={13} strokeWidth={2} /> All Tools Are 100% Free
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,50px)", fontWeight: 900, color: "#111", margin: "0 0 18px", lineHeight: 1.12 }}>
            Free AI Marketing Tools<br />for Small Business
          </h1>
          <p style={{ fontSize: 17, color: "#555", lineHeight: 1.75, margin: "0 0 10px", maxWidth: 560, marginInline: "auto" }}>
            Create Facebook ads, WhatsApp campaigns, and 30-day marketing plans in under 60 seconds — powered by AI, built for small business owners who don't have a marketing team.
          </p>
          <p style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, margin: "16px 0 0" }}>
            No account required · No credit card · No agency needed
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{ maxWidth: 940, margin: "0 auto", padding: "56px 20px 20px" }}>
        <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, textAlign: "center", margin: "0 0 40px", color: "#111" }}>
          Choose Your Free AI Marketing Tool
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 24 }}>
          {TOOLS.map((tool) => (
            <Link key={tool.href} to={tool.href} style={{ textDecoration: "none", color: "inherit" }}>
              <article
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "30px 24px", background: "#fff", transition: "all 0.2s", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%", boxSizing: "border-box" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,0.13)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 12, background: tool.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <tool.Icon size={26} color={tool.iconColor} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111", margin: "0 0 10px", lineHeight: 1.3 }}>{tool.name}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, margin: "0 0 18px" }}>{tool.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {tool.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "3px 10px" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#7c3aed", color: "#fff", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 800 }}>
                  Use Free →
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Buildo */}
      <section style={{ background: "#f9f9f9", padding: "56px 20px", marginTop: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, textAlign: "center", margin: "0 0 36px", color: "#111" }}>
            Why Small Business Owners Use Buildo's Free Tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
            {[
              { Icon: Zap, iconColor: "#f59e0b", iconBg: "#fffbeb", title: "Results in 60 seconds", desc: "No blank-page paralysis. Enter your details, get real, usable marketing content instantly." },
              { Icon: Target, iconColor: "#7c3aed", iconBg: "#f5f3ff", title: "Industry-specific AI", desc: "The AI knows restaurants, gyms, clinics, real estate, e-commerce and 20+ more industries." },
              { Icon: Gift, iconColor: "#16a34a", iconBg: "#f0fdf4", title: "Actually free", desc: "No credit card. No hidden trial. No email required to get your first result." },
              { Icon: Rocket, iconColor: "#1877f2", iconBg: "#e7f0fd", title: "Launch in one click", desc: "Loved the output? Upgrade to Buildo and turn it into a live multi-channel campaign." },
            ].map(({ Icon, iconColor, iconBg, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "22px 20px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={22} color={iconColor} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AEO FAQ */}
      <ToolFAQSection faqs={FAQS} />

      {/* Industry internal links */}
      <section style={{ background: "#f5f3ff", padding: "44px 20px", marginTop: 52 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 22px", color: "#111" }}>
            AI Marketing Tools by Industry
          </h2>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>Find the best AI marketing strategy for your specific business type.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {INDUSTRY_LINKS.map(({ label, href }) => (
              <Link key={href} to={href} style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", background: "#fff", border: "1px solid #ede9fe", borderRadius: 20, padding: "7px 16px", textDecoration: "none" }}>
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA cta="Try the full Buildo platform free" page="tools" keyword="free ai marketing tools small business" />
    </div>
  );
}