import { useState } from "react";
import { motion } from "framer-motion";

const STYLES = [
  { id: "emotional", label: "רגשי", desc: "מחבר ללב, מספר סיפור" },
  { id: "direct", label: "ישיר", desc: "תועלות ברורות, מספרים" },
  { id: "humorous", label: "הומוריסטי", desc: "קליל, חכם, מחייך" },
  { id: "luxury", label: "יוקרתי", desc: "פרימיום, בלעדי, איכות" },
  { id: "urgency", label: "דחיפות", desc: "הצעה מוגבלת, FOMO" },
];

export default function StyleStep({ businessInfo, onSelected }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 8 }}>שלב 2 מתוך 3</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "#000" }}>באיזה סגנון לכתוב?</h2>
        <p style={{ fontSize: 13, color: "#666" }}>
          ה-AI יכתוב 3 גרסאות פרסומת בסגנון שתבחר עבור {businessInfo?.name || "העסק שלך"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
        {STYLES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setSelected(s.id)}
            style={{
              background: selected === s.id ? "#000" : "#f5f5f5",
              border: selected === s.id ? "2px solid #000" : "2px solid transparent",
              borderRadius: 12, padding: "18px 12px", cursor: "pointer",
              textAlign: "center", transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: selected === s.id ? "#fff" : "#000" }}>{s.label}</div>
            <div style={{ fontSize: 11, color: selected === s.id ? "rgba(255,255,255,0.6)" : "#888", lineHeight: 1.5 }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => selected && onSelected(selected)}
        disabled={!selected}
        style={{
          width: "100%", padding: "15px",
          background: selected ? "#000" : "#e0e0e0",
          color: selected ? "#fff" : "#999",
          border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800,
          fontFamily: "'Heebo', sans-serif", cursor: selected ? "pointer" : "not-allowed",
          transition: "all 0.3s",
        }}
      >
        צור את הפרסומות שלי
      </button>
    </div>
  );
}