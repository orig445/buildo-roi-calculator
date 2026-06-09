import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { track } from "@/lib/analytics";
import PageHeader from "@/components/landing/PageHeader";
import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQBlock from "@/components/landing/FAQBlock";
import RelatedPages from "@/components/landing/RelatedPages";
import FinalCTA from "@/components/landing/FinalCTA";
import { PAGES_DATA } from "@/lib/pagesData";

export default function LandingPage() {
  const { slug } = useParams();
  const page = PAGES_DATA[slug];

  useEffect(() => {
    if (page) {
      document.title = `${page.title} | Buildo`;
      track.pageView(slug, { keyword: page.keyword, industry: page.industry, page_template: "niche" });
    }
  }, [slug, page]);

  if (!page) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Heebo', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Page not found</h1>
          <p style={{ color: "#666" }}>This page doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", color: "#111" }}>
      <PageHeader />
      <HeroSection
        h1={page.h1}
        subheadline={page.subheadline}
        cta={page.cta}
        page={slug}
        keyword={page.keyword}
        industry={page.industry}
      />
      <PainSection
        audience={page.audience}
        pain={page.pain}
        useCases={page.useCases}
      />
      <HowItWorks cta={page.cta} />
      <FAQBlock faqs={page.faqs} />
      <RelatedPages links={page.relatedLinks} />
      <FinalCTA cta={page.cta} page={slug} keyword={page.keyword} industry={page.industry} />
    </div>
  );
}