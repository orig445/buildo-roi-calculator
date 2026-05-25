import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ExternalLink, Check, RefreshCw, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdsLibraryStep({ businessInfo, onSelected }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState(businessInfo?.keywords?.[0] || businessInfo?.type || "");
  const [error, setError] = useState("");

  const fetchAds = async (keywords) => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("searchFacebookAds", { keywords, limit: 12 });
      if (res.data.error) {
        setError(res.data.error);
        setAds([]);
      } else {
        setAds(res.data.ads || []);
      }
    } catch (e) {
      setError("שגיאה בטעינת פרסומות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(searchTerm);
  }, []);

  const handleSelect = (ad) => {
    setSelected(ad.id);
    onSelected({
      id: ad.id,
      title: ad.ad_creative_link_titles?.[0] || "",
      body: ad.ad_creative_bodies?.[0] || "",
      page_name: ad.page_name || "",
      snapshot_url: ad.ad_snapshot_url || "",
    });
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>שלב 2 מתוך 4</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>פרסומות מנצחות בתחומך</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          בחר פרסומת שמוצאת חן בעיניך — ה-AI ישתמש בה כהשראה
        </p>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAds(searchTerm)}
            placeholder="חפש לפי מילות מפתח..."
            style={{
              width: "100%", paddingRight: 38, paddingLeft: 14, paddingTop: 11, paddingBottom: 11,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, fontSize: 14, color: "white", outline: "none",
              fontFamily: "'Heebo', sans-serif", boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={() => fetchAds(searchTerm)}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10, padding: "11px 18px", color: "white", cursor: "pointer",
            fontFamily: "'Heebo', sans-serif", fontSize: 13, fontWeight: 600,
          }}
        >
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
          חפש
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "#a78bfa", margin: "0 auto 12px", display: "block" }} />
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>טוען פרסומות מ-Facebook Ads Library...</div>
        </div>
      ) : ads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          לא נמצאו פרסומות. נסה מילות מפתח אחרות.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id || i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(ad)}
              style={{
                background: selected === ad.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)",
                border: selected === ad.id ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: 16, cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (selected !== ad.id) e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
              onMouseLeave={(e) => { if (selected !== ad.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {selected === ad.id && (
                <div style={{ position: "absolute", top: 10, left: 10, background: "#a78bfa", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} color="white" />
                </div>
              )}
              <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 6 }}>{ad.page_name || "מפרסם לא ידוע"}</div>
              {ad.ad_creative_link_titles?.[0] && (
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, lineHeight: 1.4 }}>
                  {ad.ad_creative_link_titles[0]}
                </div>
              )}
              {ad.ad_creative_bodies?.[0] && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ad.ad_creative_bodies[0]}
                </div>
              )}
              {ad.ad_snapshot_url && (
                <a
                  href={ad.ad_snapshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#60a5fa", textDecoration: "none" }}
                >
                  <ExternalLink size={10} /> צפה בפרסומת המקורית
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}