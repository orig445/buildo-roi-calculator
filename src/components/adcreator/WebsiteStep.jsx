import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Globe, Search, AlertCircle, ChevronRight } from "lucide-react";
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

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 8 }}>שלב 1 מתוך 3</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, color: "#000" }}>נתח את האתר שלך</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
          ה-AI יזהה את המיתוג, המוצר וקהל היעד שלך אוטומטית
        </p>
      </div>

      <div style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Globe style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#999" }} />
            <input
              type="text"
              placeholder="הכנס כתובת האתר שלך..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && analyze()}
              disabled={loading}
              style={{
                width: "100%", paddingRight: 40, paddingLeft: 14, paddingTop: 13, paddingBottom: 13,
                background: "#fff", border: "1.5px solid #ddd",
                borderRadius: 10, fontSize: 14, color: "#000", outline: "none",
                fontFamily: "'Heebo', sans-serif", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#000"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ddd"; }}
            />
          </div>
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: loading || !url.trim() ? "#ddd" : "#000",
              color: loading || !url.trim() ? "#999" : "#fff",
              border: "none", borderRadius: 10,
              padding: "13px 22px", fontSize: 14, fontWeight: 700,
              fontFamily: "'Heebo', sans-serif",
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
            {loading ? "מנתח..." : "נתח"}
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
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#000" }}
                />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>סורק מיתוג, תמונות וצבעים...</div>
          </motion.div>
        )}

        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
              {/* Business info card */}
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

                {/* Brand Colors */}
                {preview.colors?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "#999" }}>צבעי מותג:</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {preview.colors.map((c, i) => (
                        <div key={i} title={c} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: "1px solid #e0e0e0" }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, padding: "10px 14px", background: "#f9f9f9", borderRadius: 8, borderRight: "3px solid #000" }}>
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
                נראה מעולה, המשך לבחירת סגנון
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