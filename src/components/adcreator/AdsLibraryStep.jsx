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

  const DEMO_ADS = [
    { id: "d1", page_name: "דוגמה — עסק דומה לשלך", ad_creative_link_titles: ["גלה מה אתה מפספס כל יום 🔥"], ad_creative_bodies: ["כל לקוח שלא עונים לו תוך שעה — הולך למתחרה. עם המערכת שלנו, 97% מהפניות מקבלות מענה אוטומטי תוך דקות. בלי להפסיד עסקאות."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=220&fit=crop" },
    { id: "d2", page_name: "דוגמה — מתחרה בתחום", ad_creative_link_titles: ["₪0 ראשון. תוצאות ראשון. 💎"], ad_creative_bodies: ["הצטרף ל-2,000+ עסקים שכבר מרוויחים יותר עם אוטומציה חכמה. ניסיון חינם ל-14 יום — ללא כרטיס אשראי, ללא התחייבות."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=220&fit=crop" },
    { id: "d3", page_name: "דוגמה — פרסומת מנצחת", ad_creative_link_titles: ["לקוחות מחכים. אל תגרום להם להמתין ⏰"], ad_creative_bodies: ["מחקר מראה: 78% מהלקוחות קונים מהעסק שענה ראשון. האם אתה תמיד ראשון? אם לא — הגיע הזמן לשנות את זה."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=220&fit=crop" },
    { id: "d4", page_name: "דוגמה — סגנון רגשי", ad_creative_link_titles: ["כשהייתי מפספס פניות, הייתי מרגיש ❤️"], ad_creative_bodies: ["בעל עסק כמוך שיתף: 'הייתי ישן בלילה ומחמיץ לידים. מאז שהפעלתי את הבוט — הכנסות עלו ב-40% תוך חודש.' זה יכול להיות הסיפור שלך."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=220&fit=crop" },
    { id: "d5", page_name: "דוגמה — הצעת ערך ברורה", ad_creative_link_titles: ["3 שניות = לקוח מרוצה ✅"], ad_creative_bodies: ["הבוט שלנו עונה תוך 3 שניות, 24/7, בעברית מושלמת. מתאים את עצמו לעסק שלך, שולח הצעות מחיר, וסוגר עסקאות — בזמן שאתה ישן."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=220&fit=crop" },
    { id: "d6", page_name: "דוגמה — הוכחה חברתית", ad_creative_link_titles: ["2,847 עסקים כבר בפנים 🏆"], ad_creative_bodies: ["מה המשותף לסלון היופי בתל אביב, קליניקת השיניים בחיפה, והגרפיקאי מבאר שבע? כולם הגדילו הכנסות ב-30%+ עם אוטומציית וואטסאפ. מתי תצטרף?"], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=220&fit=crop" },
  ];

  const fetchAds = async (keywords) => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("searchFacebookAds", { keywords, limit: 12 });
      if (res.data.error) {
        // Fallback to demo ads with info message
        setError("API_PERMISSION");
        setAds(DEMO_ADS);
      } else if (!res.data.ads || res.data.ads.length === 0) {
        setAds(DEMO_ADS);
      } else {
        setAds(res.data.ads);
      }
    } catch (e) {
      setAds(DEMO_ADS);
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

      {error === "API_PERMISSION" && (
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "12px 16px", color: "#fbbf24", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
          💡 <strong>מצב הדגמה:</strong> מציג פרסומות לדוגמה — Facebook Ads Library API דורש אישור מיוחד מ-Meta.
          {" "}<a href="https://www.facebook.com/ads/library/api" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>לחץ כאן להגשת בקשת גישה</a>
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
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, background: "#a78bfa", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(167,139,250,0.6)" }}>
                  <Check size={13} color="white" />
                </div>
              )}

              {/* Ad Image */}
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12, height: 130, background: "rgba(255,255,255,0.06)", position: "relative" }}>
                {ad.demo_image ? (
                  <img src={ad.demo_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))" }}>
                    <div style={{ fontSize: 32 }}>📢</div>
                  </div>
                )}
                {ad.ad_snapshot_url && (
                  <a
                    href={ad.ad_snapshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: "absolute", bottom: 6, left: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "white", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 20, textDecoration: "none", backdropFilter: "blur(4px)" }}
                  >
                    <ExternalLink size={9} /> צפה במקור
                  </a>
                )}
              </div>

              <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, marginBottom: 5 }}>{ad.page_name || "מפרסם לא ידוע"}</div>
              {ad.ad_creative_link_titles?.[0] && (
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, lineHeight: 1.4 }}>
                  {ad.ad_creative_link_titles[0]}
                </div>
              )}
              {ad.ad_creative_bodies?.[0] && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ad.ad_creative_bodies[0]}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}