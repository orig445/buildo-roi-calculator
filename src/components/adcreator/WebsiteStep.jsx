import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Globe, Sparkles, AlertCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WebsiteStep({ onAnalyzed }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const normalized = url.trim().startsWith("http") ? url.trim() : "https://" + url.trim();
      const res = await base44.functions.invoke("analyzeWebsite", { url: normalized });
      const data = res.data;

      const info = {
        url: normalized,
        name: data.business_name || "עסק",
        type: data.business_type || "כללי",
        product: data.insight || "",
        audience: data.target_audience || "לקוחות פוטנציאליים",
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
      setError("לא הצלחנו לנתח את האתר. נסה URL אחר.");
    } finally {
      setLoading(false);
    }
  };

  // Pick dominant color for gradient effects
  const dominantColor = preview?.colors?.[0] || "#7c3aed";
  const secondColor = preview?.colors?.[1] || "#2563eb";

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 8, letterSpacing: "0.08em" }}>שלב 1 מתוך 4</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>נתח את האתר שלך</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          ה-AI שלנו יזהה את המיתוג, המוצר וקהל היעד שלך אוטומטית
        </p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Globe style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
            <input
              type="text"
              placeholder="הכנס כתובת האתר שלך..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && analyze()}
              disabled={loading}
              style={{
                width: "100%", paddingRight: 44, paddingLeft: 16, paddingTop: 14, paddingBottom: 14,
                background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                borderRadius: 12, fontSize: 15, color: "white", outline: "none",
                fontFamily: "'Heebo', sans-serif", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#a78bfa"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
            />
          </div>
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: loading || !url.trim() ? "rgba(167,139,250,0.3)" : "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "white", border: "none", borderRadius: 12,
              padding: "14px 24px", fontSize: 14, fontWeight: 700,
              fontFamily: "'Heebo', sans-serif",
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
            {loading ? "מנתח..." : "נתח"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Loading state with progress effect */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: 20, textAlign: "center", padding: "20px 0" }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }}
                />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>סורק מיתוג, תמונות וצבעים...</div>
          </motion.div>
        )}

        {/* Preview card */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 20 }}
            >
              {/* Hero banner with brand colors */}
              <div style={{
                borderRadius: "16px 16px 0 0",
                background: `linear-gradient(135deg, ${dominantColor}cc, ${secondColor}cc)`,
                position: "relative",
                overflow: "hidden",
                minHeight: preview.site_images?.length > 0 ? 200 : 80,
              }}>
                {/* Background image collage */}
                {preview.site_images?.length > 0 && (
                  <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${Math.min(preview.site_images.length, 3)}, 1fr)`, gap: 2 }}>
                    {preview.site_images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ))}
                  </div>
                )}
                {/* Gradient overlay */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${dominantColor}dd 0%, rgba(0,0,0,0.3) 60%, transparent 100%)` }} />

                {/* Logo + business name on top */}
                <div style={{ position: "relative", zIndex: 2, padding: "20px 20px 16px", display: "flex", alignItems: "flex-end", gap: 14, minHeight: 180 }}>
                  <div style={{ marginTop: "auto" }}>
                    {preview.logo ? (
                      <img
                        src={preview.logo}
                        alt="logo"
                        style={{ width: 60, height: 60, borderRadius: 12, objectFit: "contain", background: "white", padding: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: 12, background: `linear-gradient(135deg, ${dominantColor}, ${secondColor})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                        {preview.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{preview.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600, marginTop: 2 }}>{preview.type}</div>
                  </div>
                </div>
              </div>

              {/* Content panel */}
              <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.25)", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "18px 20px 20px" }}>

                {/* Brand Colors */}
                {preview.colors?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>צבעי מותג:</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {preview.colors.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          title={c}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: c,
                            border: "2px solid rgba(255,255,255,0.2)",
                            boxShadow: `0 3px 10px ${c}88`,
                            cursor: "default",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: 4 }}>
                      {preview.colors.map((c, i) => (
                        <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insight */}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", borderRight: `3px solid ${dominantColor}` }}>
                  {preview.product}
                </div>

                {/* Extra images row */}
                {preview.site_images?.length > 3 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                    {preview.site_images.slice(3, 7).map((img, i) => (
                      <motion.img
                        key={i}
                        src={img}
                        alt=""
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        style={{ width: 80, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}
                        onError={(e) => { e.target.parentNode.removeChild(e.target); }}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onAnalyzed(preview)}
                  style={{
                    width: "100%", padding: "14px",
                    background: `linear-gradient(135deg, ${dominantColor}, ${secondColor})`,
                    color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                    fontFamily: "'Heebo', sans-serif", cursor: "pointer",
                    boxShadow: `0 4px 20px ${dominantColor}66`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  ✨ נראה מעולה! המשך לפרסומות מנצחות
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}