import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Sparkles, ChevronLeft, Check, ExternalLink, Copy, ArrowRight } from "lucide-react";
import WebsiteStep from "@/components/adcreator/WebsiteStep";
import StyleStep from "@/components/adcreator/StyleStep";
import ResultsStep from "@/components/adcreator/ResultsStep";
import BildoUpsellModal from "@/components/adcreator/BildoUpsellModal";
import { useLanguage } from "@/lib/useLanguage";

const STEPS_HE = [
  { id: 1, label: "ניתוח האתר" },
  { id: 2, label: "בחר סגנון" },
  { id: 3, label: "הפרסומת שלך" },
];

const STEPS_EN = [
  { id: 1, label: "Analyze Site" },
  { id: 2, label: "Choose Style" },
  { id: 3, label: "Your Ads" },
];

export default function AdCreator() {
  const lang = useLanguage();
  const STEPS = lang === "en" ? STEPS_EN : STEPS_HE;
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [style, setStyle] = useState(null);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBusinessAnalyzed = (info) => {
    setBusinessInfo(info);
    setStep(2);
  };

  const handleStyleSelected = async (selectedStyle) => {
    setStyle(selectedStyle);
    setIsGenerating(true);
    setStep(3);

    try {
      // Step 1: generate all 3 copies in parallel (fast, no images)
      const copyResults = await Promise.all(
        [0, 1, 2].map((index) =>
          base44.functions.invoke("generateAdCopy", {
            businessInfo,
            style: selectedStyle,
            adIndex: index,
            totalAds: 3,
            lang,
          }).then((res) => {
            const ad = res.data.ad;
            if (ad) {
              setGeneratedAds((prev) => {
                const next = [...prev];
                next[index] = ad;
                return next;
              });
            }
            if (index === 0 && res.data.emailTemplate) {
              setEmailTemplate(res.data.emailTemplate);
            }
            return { index, ad: res.data.ad };
          })
        )
      );

      setIsGenerating(false);

      // Step 2: generate all 3 images in parallel immediately after copy is ready
      await Promise.all(
        copyResults.map(({ index }) =>
          base44.functions.invoke("generateAdCopy", {
            businessInfo,
            style: selectedStyle,
            adIndex: index,
            totalAds: 3,
            lang,
            generateImageOnly: true,
          }).then((res) => {
            if (res.data.imageUrl) {
              setGeneratedAds((prev) => {
                const next = [...prev];
                if (next[index]) next[index] = { ...next[index], imageUrl: res.data.imageUrl };
                return next;
              });
            }
          }).catch(() => {})
        )
      );
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  return (
    <div dir={lang === "en" ? "ltr" : "rtl"} style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Heebo', sans-serif", color: "#000" }}>
      
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>{lang === "en" ? "Ad Creator AI" : "יוצר המודעות"}</div>
        </div>
        <div style={{ fontSize: 11, color: "#999", display: "none" }}></div>
      </header>

      {/* Stepper */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  onClick={() => s.id < step && step < 4 && setStep(s.id)}
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800,
                    background: step > s.id ? "#000" : step === s.id ? "#000" : "#f0f0f0",
                    border: step === s.id ? "2px solid #000" : "2px solid transparent",
                    color: step >= s.id ? "#fff" : "#999",
                    transition: "all 0.3s",
                    cursor: s.id < step ? "pointer" : "default",
                  }}
                >
                  {step > s.id ? <Check size={14} /> : s.id}
                </div>
                <span style={{ fontSize: 10, color: step >= s.id ? "#000" : "#bbb", whiteSpace: "nowrap", fontWeight: step === s.id ? 700 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 48, height: 2, background: step > s.id ? "#000" : "#e0e0e0", margin: "0 6px", marginBottom: 20, transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }}
          >
            {step === 1 && <WebsiteStep onAnalyzed={handleBusinessAnalyzed} lang={lang} />}
            {step === 2 && <StyleStep businessInfo={businessInfo} onSelected={handleStyleSelected} lang={lang} />}
            {step === 3 && (
              <>
                {!isGenerating && <BildoUpsellModal lang={lang} />}
                <ResultsStep ads={generatedAds} isLoading={isGenerating} businessInfo={businessInfo} emailTemplate={emailTemplate} lang={lang} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}