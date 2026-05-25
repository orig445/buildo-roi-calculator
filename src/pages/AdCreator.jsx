import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Sparkles, ChevronLeft, Check, ExternalLink, Copy, ArrowRight } from "lucide-react";
import WebsiteStep from "@/components/adcreator/WebsiteStep";
import StyleStep from "@/components/adcreator/StyleStep";
import ResultsStep from "@/components/adcreator/ResultsStep";

const STEPS = [
  { id: 1, label: "ניתוח האתר" },
  { id: 2, label: "בחר סגנון" },
  { id: 3, label: "הפרסומת שלך" },
];

export default function AdCreator() {
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [style, setStyle] = useState(null);
  const [generatedAds, setGeneratedAds] = useState([]);
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
      const res = await base44.functions.invoke("generateAdCopy", {
        businessInfo,
        style: selectedStyle,
      });
      setGeneratedAds(res.data.ads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Heebo', sans-serif", color: "white" }}>
      
      {/* Header */}
      <header style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 36, filter: "brightness(1.2)" }} />
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>BETA</div>
            <div style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ad Creator AI
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>מופעל על ידי GPT-5.5</div>
      </header>

      {/* Stepper */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  onClick={() => s.id < step && step < 4 && setStep(s.id)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800,
                    background: step > s.id ? "linear-gradient(135deg, #a78bfa, #60a5fa)" : step === s.id ? "linear-gradient(135deg, #7c3aed, #2563eb)" : "rgba(255,255,255,0.1)",
                    border: step === s.id ? "2px solid #a78bfa" : "2px solid transparent",
                    color: step >= s.id ? "white" : "rgba(255,255,255,0.3)",
                    transition: "all 0.3s",
                    boxShadow: step === s.id ? "0 0 20px rgba(167,139,250,0.5)" : "none",
                    cursor: s.id < step && step < 4 ? "pointer" : "default",
                  }}
                >
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span style={{ fontSize: 10, color: step >= s.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", whiteSpace: "nowrap", fontWeight: step === s.id ? 700 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: step > s.id ? "linear-gradient(90deg, #a78bfa, #60a5fa)" : "rgba(255,255,255,0.1)", margin: "0 6px", marginBottom: 20, transition: "background 0.3s" }} />
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
            {step === 1 && <WebsiteStep onAnalyzed={handleBusinessAnalyzed} />}
            {step === 2 && <StyleStep businessInfo={businessInfo} onSelected={handleStyleSelected} />}
            {step === 3 && <ResultsStep ads={generatedAds} isLoading={isGenerating} businessInfo={businessInfo} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}