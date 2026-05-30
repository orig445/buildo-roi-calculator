import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Globe, Search, AlertCircle, ChevronRight, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const T = {
  he: {
    step: "שלב 1 מתוך 3",
    title: "נתח את האתר שלך",
    subtitle: "ה-AI יזהה את המיתוג, המוצר וקהל היעד שלך אוטומטית",
    placeholder: "הכנס כתובת האתר שלך...",
    igPlaceholder: "שם משתמש אינסטגרם (ללא @)...",
    tabWebsite: "אתר אינטרנט",
    tabInstagram: "אינסטגרם",
    analyze: "נתח",
    analyzing: "מנתח...",
    scanning: "סורק מיתוג, תמונות וצבעים...",
    igScanning: "מנתח פרופיל אינסטגרם...",
    error: "לא הצלחנו לנתח את האתר. נסה URL אחר.",
    igError: "לא הצלחנו לנתח את פרופיל האינסטגרם. בדוק שם המשתמש.",
    brandColors: "צבעי מותג:",
    continue: "נראה מעולה, המשך לבחירת סגנון",
    defaultName: "עסק",
    defaultType: "כללי",
    defaultAudience: "לקוחות פוטנציאליים",
  },
  en: {
    step: "Step 1 of 3",
    title: "Analyze Your Website",
    subtitle: "AI will automatically detect your branding, product and target audience",
    placeholder: "Enter your website URL...",
    igPlaceholder: "Instagram username (without @)...",
    tabWebsite: "Website",
    tabInstagram: "Instagram",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    scanning: "Scanning branding, images and colors...",
    igScanning: "Analyzing Instagram profile...",
    error: "Couldn't analyze this website. Try a different URL.",
    igError: "Couldn't analyze this Instagram profile. Check the username.",
    brandColors: "Brand colors:",
    continue: "Looks great, continue to style selection",
    defaultName: "Business",
    defaultType: "General",
    defaultAudience: "Potential customers",
  },
};

export default function WebsiteStep({ onAnalyzed, lang = "he" }) {
  const t = T[lang] || T.he;
  const [mode, setMode] = useState("website");
  const [url, setUrl] = useState("");
  const [igUsername, setIgUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const analyze = async () => {
    const isIg = mode === "instagram";
    const input = isIg ? igUsername.trim() : url.trim();
    if (!input) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      let data, sourceUrl;
      if (isIg) {
        const clean = input.replace(/^@/, "");
        const res = await base44.functions.invoke("analyzeInstagram", { username: clean, lang });
        data = res.data;
        sourceUrl = `https://www.instagram.com/${clean}/`;
      } else {
        const normalized = input.startsWith("http") ? input : "https://" + input;
        sourceUrl = normalized;
        const res = await base44.functions.invoke("analyzeWebsite", { url: normalized, lang });
        data = res.data;
      }

      const info = {
        url: sourceUrl,
        name: data.business_name || t.defaultName,
        type: data.business_type || t.defaultType,
        product: data.insight || "",
        audience: data.target_audience || t.defaultAudience,
        usp: data.usp || "",
        logo: data.logo_url || null,
        logo_url: data.logo_url || null,
        colors: data.brand_colors || [],
        brand_colors: data.brand_colors || [],
        site_images: data.site_images || [],
        keywords: data.keywords || [data.business_type || "business"],
      };
      setPreview(info);
    } catch (e) {
      setError(mode === "instagram" ? t.igError : t.error);
    } finally {
      setLoading(false);
    }
  };

  const isLtr = lang === "en";
  const isIg = mode === "instagram";
  const inputValue = isIg ? igUsername : url;
  const canAnalyze = !loading && inputValue.trim().length > 0;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 8 }}>{t.step}</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, color: "#000" }}>{t.title}</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{t.subtitle}</p>
      </div>

      <div style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 16, padding: 24 }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { key: "website", label: t.tabWebsite, icon: <Globe size={13} /> },
            { key: "instagram", label: t.tabInstagram, icon: <Instagram size={13} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setPreview(null); setError(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: mode === key ? "1.5px solid #000" : "1.5px solid #ddd",
                background: mode === key ? "#000" : "#fff",
                color: mode === key ? "#fff" : "#666",
                cursor: "pointer", fontFamily: "'Heebo', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            {isIg ? (
              <span style={{ position: "absolute", [isLtr ? "left" : "right"]: 12, top: "50%", transform: "translateY(-50%)", color: "#999", fontSize: 15, fontWeight: 700, pointerEvents: "none" }}>@</span>
            ) : (
              <Globe style={{ position: "absolute", [isLtr ? "left" : "right"]: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#999" }} />
            )}
            <input
              type="text"
              placeholder={isIg ? t.igPlaceholder : t.placeholder}
              value={inputValue}
              onChange={(e) => isIg ? setIgUsername(e.target.value.replace(/^@/, "")) : setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canAnalyze && analyze()}
              disabled={loading}
              style={{
                width: "100%",
                paddingRight: isLtr ? 14 : 40,
                paddingLeft: isLtr ? 40 : 14,
                paddingTop: 13, paddingBottom: 13,
                background: "#fff", border: "1.5px solid #ddd",
                borderRadius: 10, fontSize: 14, color: "#000", outline: "none",
                fontFamily: "'Heebo', sans-serif", boxSizing: "border-box",
                transition: "border-color 0.2s", direction: "ltr",
              }}
              onFocus={(e) => { e.target.style.borderColor = isIg ? "#e1306c" : "#000"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
            />
          </div>
          <button
            onClick={analyze}
            disabled={!canAnalyze}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: canAnalyze ? "#000" : "#ddd",
              color: canAnalyze ? "#fff" : "#999",
              border: "none", borderRadius: 10,
              padding: "13px 22px", fontSize: 14, fontWeight: 700,
              fontFamily: "'Heebo', sans-serif",
              cursor: canAnalyze ? "pointer" : "not-allowed",
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
            {loading ? t.analyzing : t.analyze}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#c00", fontSize: 13 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20, textAlign: "center", padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: isIg ? "#e1306c" : "#000" }}
                />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>{isIg ? t.igScanning : t.scanning}</div>
          </motion.div>
        )}

        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e0e0e0", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  {preview.logo && (
                    <img src={preview.logo} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "contain", border: "1px solid #e0e0e0" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#000" }}>{preview.name}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{preview.type}</div>
                  </div>
                </div>

                {preview.colors?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "#999" }}>{t.brandColors}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {preview.colors.map((c, i) => (
                        <div key={i} title={c} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: "1px solid #e0e0e0" }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, padding: "10px 14px", background: "#f9f9f9", borderRadius: 8, [isLtr ? "borderLeft" : "borderRight"]: "3px solid #000" }}>
                  {preview.product}
                </div>
              </div>

              <button
                onClick={() => onAnalyzed(preview)}
                style={{
                  width: "100%", padding: "14px",
                  background: "#000", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                  fontFamily: "'Heebo', sans-serif", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {t.continue}
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}