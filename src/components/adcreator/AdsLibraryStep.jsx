import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ExternalLink, Check, RefreshCw, Search, Globe, Users, Eye, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

// Visual keywords → Unsplash search terms for realistic ad visuals
const TOPIC_IMAGES = [
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
];

function isRealImageUrl(url) {
  if (!url) return false;
  // reject fake/hallucinated URLs
  if (url.includes('access_token=ACT')) return false;
  if (url.includes('XXXXXXX')) return false;
  if (url.includes('_def&oe=') || url.includes('_ghi&oe=')) return false;
  return url.startsWith('http');
}

function AdVisual({ ad, index }) {
  const [imgError, setImgError] = useState(false);

  // Use real image URL if available and valid
  const realImage = isRealImageUrl(ad.ad_image_url) ? ad.ad_image_url
    : isRealImageUrl(ad.demo_image) ? ad.demo_image
    : null;

  if (realImage && !imgError) {
    return (
      <div style={{ height: 200, overflow: "hidden" }}>
        <img
          src={realImage}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: use a real Unsplash image based on index + ad copy overlay
  const fallbackImg = TOPIC_IMAGES[index % TOPIC_IMAGES.length];
  return (
    <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
      <img
        src={fallbackImg}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.55)" }}
      />
      {/* Ad copy overlay */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "16px 14px",
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)"
      }}>
        <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>{ad.page_name}</div>
        {ad.ad_creative_link_titles?.[0] && (
          <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.3, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            {ad.ad_creative_link_titles[0]}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdsLibraryStep({ businessInfo, onSelected }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState(businessInfo?.keywords?.[0] || businessInfo?.type || "");
  const [isDemo, setIsDemo] = useState(false);
  const [expandedAd, setExpandedAd] = useState(null);

  const DEMO_ADS = [
    { id: "d1", page_name: "דוגמה — עסק דומה לשלך", ad_creative_link_titles: ["גלה מה אתה מפספס כל יום 🔥"], ad_creative_bodies: ["כל לקוח שלא עונים לו תוך שעה — הולך למתחרה. עם המערכת שלנו, 97% מהפניות מקבלות מענה אוטומטי תוך דקות."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop", impressions: { lower_bound: "5000", upper_bound: "10000" }, spend: { lower_bound: "200", upper_bound: "500" }, currency: "ILS", publisher_platforms: ["facebook", "instagram"], ad_creation_time: "2024-03-01" },
    { id: "d2", page_name: "דוגמה — מתחרה בתחום", ad_creative_link_titles: ["₪0 ראשון. תוצאות ראשון. 💎"], ad_creative_bodies: ["הצטרף ל-2,000+ עסקים שכבר מרוויחים יותר עם אוטומציה חכמה. ניסיון חינם ל-14 יום."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop", impressions: { lower_bound: "10000", upper_bound: "50000" }, spend: { lower_bound: "500", upper_bound: "1000" }, currency: "ILS", publisher_platforms: ["facebook"], ad_creation_time: "2024-02-15" },
    { id: "d3", page_name: "דוגמה — פרסומת מנצחת", ad_creative_link_titles: ["לקוחות מחכים. אל תגרום להם להמתין ⏰"], ad_creative_bodies: ["מחקר מראה: 78% מהלקוחות קונים מהעסק שענה ראשון. האם אתה תמיד ראשון?"], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=300&fit=crop", impressions: { lower_bound: "1000", upper_bound: "5000" }, spend: { lower_bound: "100", upper_bound: "200" }, currency: "ILS", publisher_platforms: ["facebook", "instagram", "messenger"], ad_creation_time: "2024-04-01" },
    { id: "d4", page_name: "דוגמה — סגנון רגשי", ad_creative_link_titles: ["כשהייתי מפספס פניות, הייתי מרגיש ❤️"], ad_creative_bodies: ["בעל עסק כמוך שיתף: 'הייתי ישן בלילה ומחמיץ לידים. מאז שהפעלתי את הבוט — הכנסות עלו ב-40% תוך חודש.'"], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop", impressions: { lower_bound: "50000", upper_bound: "200000" }, spend: { lower_bound: "1000", upper_bound: "5000" }, currency: "ILS", publisher_platforms: ["facebook"], ad_creation_time: "2024-01-10" },
    { id: "d5", page_name: "דוגמה — הצעת ערך ברורה", ad_creative_link_titles: ["3 שניות = לקוח מרוצה ✅"], ad_creative_bodies: ["הבוט שלנו עונה תוך 3 שניות, 24/7, בעברית מושלמת. מתאים את עצמו לעסק שלך."], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=300&fit=crop", impressions: { lower_bound: "5000", upper_bound: "10000" }, spend: { lower_bound: "200", upper_bound: "500" }, currency: "ILS", publisher_platforms: ["instagram"], ad_creation_time: "2024-03-20" },
    { id: "d6", page_name: "דוגמה — הוכחה חברתית", ad_creative_link_titles: ["2,847 עסקים כבר בפנים 🏆"], ad_creative_bodies: ["מה המשותף לסלון היופי בתל אביב, קליניקת השיניים בחיפה, והגרפיקאי מבאר שבע? כולם הגדילו הכנסות ב-30%+"], ad_snapshot_url: null, demo_image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=300&fit=crop", impressions: { lower_bound: "200000", upper_bound: "500000" }, spend: { lower_bound: "5000", upper_bound: "10000" }, currency: "ILS", publisher_platforms: ["facebook", "instagram"], ad_creation_time: "2024-02-01" },
  ];

  const fetchAds = async (keywords) => {
    setLoading(true);
    setIsDemo(false);
    try {
      const res = await base44.functions.invoke("searchFacebookAds", { keywords, limit: 12 });
      if (res.data.error || !res.data.ads || res.data.ads.length === 0) {
        setIsDemo(true);
        setAds(DEMO_ADS);
      } else {
        setAds(res.data.ads);
      }
    } catch {
      setIsDemo(true);
      setAds(DEMO_ADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(searchTerm); }, []);

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

  const formatImpressions = (imp) => {
    if (!imp) return null;
    const lo = parseInt(imp.lower_bound || 0);
    if (lo >= 1000000) return `${(lo / 1000000).toFixed(1)}M+`;
    if (lo >= 1000) return `${(lo / 1000).toFixed(0)}K+`;
    return `${lo}+`;
  };

  const formatSpend = (spend, currency) => {
    if (!spend) return null;
    const lo = parseInt(spend.lower_bound || 0);
    const symbol = currency === "ILS" ? "₪" : currency === "USD" ? "$" : "€";
    if (lo >= 1000) return `${symbol}${(lo / 1000).toFixed(1)}K+`;
    return `${symbol}${lo}+`;
  };

  const platformIcon = (p) => ({ facebook: "f", instagram: "📷", messenger: "💬", audience_network: "🌐" }[p] || p);

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
            style={{ width: "100%", paddingRight: 38, paddingLeft: 14, paddingTop: 11, paddingBottom: 11, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, fontSize: 14, color: "white", outline: "none", fontFamily: "'Heebo', sans-serif", boxSizing: "border-box" }}
          />
        </div>
        <button
          onClick={() => fetchAds(searchTerm)}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "11px 18px", color: "white", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontSize: 13, fontWeight: 600 }}
        >
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
          חפש
        </button>
      </div>

      {isDemo && (
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
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id || i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(ad)}
              style={{
                background: selected === ad.id ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                border: selected === ad.id ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s", position: "relative",
              }}
              onMouseEnter={(e) => { if (selected !== ad.id) e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
              onMouseLeave={(e) => { if (selected !== ad.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {selected === ad.id && (
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "#a78bfa", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(167,139,250,0.6)" }}>
                  <Check size={14} color="white" />
                </div>
              )}

              {/* Ad Visual */}
              <AdVisual ad={ad} index={i} />

              {/* Ad Info */}
              <div style={{ padding: "14px 14px 12px" }}>
                <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 5 }}>{ad.page_name || "מפרסם לא ידוע"}</div>
                {ad.ad_creative_link_titles?.[0] && (
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, lineHeight: 1.35 }}>
                    {ad.ad_creative_link_titles[0]}
                  </div>
                )}
                {ad.ad_creative_bodies?.[0] && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10 }}>
                    {ad.ad_creative_bodies[0]}
                  </div>
                )}

                {/* Stats row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {formatImpressions(ad.impressions) && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 20, padding: "3px 8px", color: "#93c5fd" }}>
                      <Eye size={10} /> {formatImpressions(ad.impressions)} חשיפות
                    </span>
                  )}
                  {formatSpend(ad.spend, ad.currency) && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 20, padding: "3px 8px", color: "#6ee7b7" }}>
                      <DollarSign size={10} /> {formatSpend(ad.spend, ad.currency)} הושקעו
                    </span>
                  )}
                  {ad.ad_creation_time && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "3px 8px", color: "rgba(255,255,255,0.5)" }}>
                      <Calendar size={10} /> {new Date(ad.ad_creation_time).toLocaleDateString("he-IL", { month: "short", year: "numeric" })}
                    </span>
                  )}
                  {ad.publisher_platforms?.length > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20, padding: "3px 8px", color: "#c4b5fd" }}>
                      <Globe size={10} /> {ad.publisher_platforms.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}