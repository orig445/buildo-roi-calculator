import { useEffect } from "react";

export function ToolSchema({ name, description, url }) {
  useEffect(() => {
    const id = `schema-tool-${url.replace(/\//g, "-")}`;
    let el = document.getElementById(id);
    if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": name,
      "description": description,
      "url": `https://buildoai.com${url}`,
      "applicationCategory": "MarketingApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "provider": { "@type": "Organization", "name": "Buildo", "url": "https://buildoai.com" }
    });
    return () => { document.getElementById(id)?.remove(); };
  }, [name, description, url]);
  return null;
}

export function FAQSchema({ faqs }) {
  useEffect(() => {
    if (!faqs?.length) return;
    const id = `schema-faq-${Math.random().toString(36).slice(2)}`;
    const el = document.createElement("script");
    el.type = "application/ld+json"; el.id = id;
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    });
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, [JSON.stringify(faqs)]);
  return null;
}

export function BreadcrumbSchema({ items }) {
  useEffect(() => {
    if (!items?.length) return;
    const id = "schema-breadcrumb";
    document.getElementById(id)?.remove();
    const el = document.createElement("script");
    el.type = "application/ld+json"; el.id = id;
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": item.name,
        "item": `https://buildoai.com${item.url}`
      }))
    });
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, [JSON.stringify(items)]);
  return null;
}

export function OrganizationSchema() {
  useEffect(() => {
    const id = "schema-org";
    if (document.getElementById(id)) return;
    const el = document.createElement("script");
    el.type = "application/ld+json"; el.id = id;
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Buildo",
      "url": "https://buildoai.com",
      "logo": "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png",
      "description": "AI marketing platform for small businesses — create Facebook ads, WhatsApp campaigns, and marketing plans in minutes.",
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://buildoai.com" }
    });
    document.head.appendChild(el);
  }, []);
  return null;
}