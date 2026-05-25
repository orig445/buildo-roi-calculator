import { useState } from "react";
import { Loader2, Copy, Check, ArrowRight, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AD_IMAGES = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=340&fit=crop",
];

function AdCard({ ad, index, businessInfo }) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = `${ad.headline}\n${ad.subheadline}\n\n${ad.body}\n\n${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const imgUrl = AD_IMAGES[index % AD_IMAGES.length];
  const pageName = businessInfo?.name || "העסק שלך";
  const pageInitial = pageName.charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}
    >
      {/* LEFT: Facebook Ad Mockup */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", color: "#000" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>
              {pageInitial}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{pageName}</div>
              <div style={{ fontSize: 11, color: "#65676b" }}>ממומן · 🌐</div>
            </div>
          </div>
          <MoreHorizontal size={18} color="#65676b" />
        </div>

        {/* Body text */}
        <div style={{ padding: "0 14px 10px", fontSize: 14, color: "#050505", lineHeight: 1.6, direction: "rtl" }}>
          {ad.body?.slice(0, 120)}{ad.body?.length > 120 ? "..." : ""}
        </div>

        {/* Ad Image */}
        <img src={imgUrl} alt="ad" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />

        {/* Headline bar */}
        <div style={{ background: "#f0f2f5", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ direction: "rtl" }}>
            <div style={{ fontSize: 12, color: "#65676b", marginBottom: 2 }}>{businessInfo?.url?.replace(/^https?:\/\//, "") || "yoursite.com"}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#050505" }}>{ad.headline}</div>
            {ad.subheadline && <div style={{ fontSize: 12, color: "#65676b" }}>{ad.subheadline}</div>}
          </div>
          <div style={{ background: "#e4e6eb", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#050505", whiteSpace: "nowrap", marginRight: 10, flexShrink: 0 }}>
            {ad.cta}
          </div>
        </div>

        {/* Reactions bar */}
        <div style={{ padding: "8px 14px", borderTop: "1px solid #e4e6eb", display: "flex", gap: 4 }}>
          {[<><ThumbsUp size={14} /> אהבתי</>, <><MessageCircle size={14} /> תגובה</>, <><Share2 size={14} /> שיתוף</>].map((item, i) => (
            <button key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "none", border: "none", color: "#65676b", fontSize: 13, fontWeight: 600, padding: "6px 0", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Copy panel */}
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>גרסה {index + 1}</div>
          <button onClick={copyAll} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "5px 12px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 11, fontFamily: "'Heebo', sans-serif" }}>
            {copied ? <><Check size={11} color="#4ade80" /> הועתק!</> : <><Copy size={11} /> העתק הכל</>}
          </button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>כותרת ראשית</div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{ad.headline}</div>
          </div>
          {ad.subheadline && (
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>כותרת משנה</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{ad.subheadline}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>גוף הפרסומת</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", borderRight: "3px solid #a78bfa" }}>
              {ad.body}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>CTA</div>
            <div style={{ display: "inline-flex", background: "linear-gradient(135deg, #7c3aed, #2563eb)", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 800 }}>
              {ad.cta}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsStep({ ads, isLoading, businessInfo }) {
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block", marginBottom: 20 }}
        >
          <Loader2 size={48} color="#a78bfa" />
        </motion.div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>GPT-5.5 כותב את הפרסומות שלך...</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>מנתח את הפרסומות המנצחות ומתאים לעסק שלך</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>שלב 4 מתוך 4</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>✨ הפרסומות שלך מוכנות!</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          GPT-5.5 יצר {ads.length} גרסאות מותאמות אישית לעסק שלך
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        {ads.map((ad, i) => <AdCard key={i} ad={ad} index={i} businessInfo={businessInfo} />)}
      </div>

      {/* CTA to sign up */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))",
            border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: 20, padding: "28px 24px", textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>🚀</div>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>רוצה לקבל את הפרסומות האלה כתמונות מוכנות?</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 20 }}>
            הצטרף לבילדו וקבל גישה ל<strong style={{ color: "#a78bfa" }}>עובדים דיגיטליים</strong> שיצרו פרסומות,<br />
            ינהלו את הוואטסאפ שלך ויגדילו את המכירות אוטומטית.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/972532861565"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white", textDecoration: "none",
                borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 800,
                fontFamily: "'Heebo', sans-serif",
                boxShadow: "0 4px 24px rgba(124,58,237,0.5)",
              }}
            >
              🔒 הצטרף לבילדו עכשיו <ArrowRight size={16} />
            </a>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>ללא כרטיס אשראי · ניסיון חינם · מענה תוך שעות</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}