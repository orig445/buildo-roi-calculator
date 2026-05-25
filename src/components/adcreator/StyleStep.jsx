import { useState } from "react";
import { motion } from "framer-motion";

const STYLES = [
  { id: "emotional", emoji: "❤️", label: "רגשי", desc: "מחבר ללב, מספר סיפור" },
  { id: "direct", emoji: "⚡", label: "ישיר", desc: "תועלות ברורות, מספרים" },
  { id: "humorous", emoji: "😄", label: "הומוריסטי", desc: "קליל, חכם, מחייך" },
  { id: "luxury", emoji: "💎", label: "יוקרתי", desc: "פרימיום, בלעדי, איכות" },
  { id: "urgency", emoji: "🔥", label: "דחיפות", desc: "הצעה מוגבלת, FOMO" },
];

export default function StyleStep({ businessInfo, onSelected }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>שלב 3 מתוך 4</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>באיזה סגנון לכתוב?</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          ה-AI יכתוב 3 גרסאות פרסומת בסגנון שתבחר עבור {businessInfo?.name || "העסק שלך"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
        {STYLES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setSelected(s.id)}
            style={{
              background: selected === s.id ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
              border: selected === s.id ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "20px 14px", cursor: "pointer",
              textAlign: "center", transition: "all 0.2s",
              boxShadow: selected === s.id ? "0 0 20px rgba(167,139,250,0.3)" : "none",
            }}
            onMouseEnter={(e) => { if (selected !== s.id) e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
            onMouseLeave={(e) => { if (selected !== s.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => selected && onSelected(selected)}
        disabled={!selected}
        style={{
          width: "100%", padding: "15px",
          background: selected ? "linear-gradient(135deg, #7c3aed, #2563eb)" : "rgba(255,255,255,0.08)",
          color: selected ? "white" : "rgba(255,255,255,0.3)",
          border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800,
          fontFamily: "'Heebo', sans-serif", cursor: selected ? "pointer" : "not-allowed",
          boxShadow: selected ? "0 4px 24px rgba(124,58,237,0.5)" : "none",
          transition: "all 0.3s",
        }}
      >
        ✨ צור את הפרסומות שלי עם GPT-5.5
      </button>
    </div>
  );
}