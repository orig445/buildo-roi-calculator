import { motion } from "framer-motion";

const clients = [
  { name: "ICE CLASS", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png" },
  { name: "TRIPEX", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png" },
  { name: "ש.פארם", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/c7aa070c2_2026-05-05110024.png" },
  { name: "A Head Spa", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg" },
];

const stats = [
  { value: "500+", label: "עסקים" },
  { value: "50M+", label: "הודעות" },
  { value: "98%", label: "שביעות רצון" },
  { value: "24h", label: "הטמעה" },
];

const testimonials = [
  { name: "אמיר כהן", role: "מנכ\"ל, TechSales", gain: "+₪42,000/חודש", text: "בתוך שבועיים ראינו תוצאות. הצוות כבר לא מבזבז זמן על הודעות ידניות." },
  { name: "שירה לוי", role: "בעלת מכון יופי", gain: "+₪28,000/חודש", text: "הלקוחות מקבלים תזכורות אוטומטיות ואנחנו ממלאים את היומן שלנו בלי מאמץ." },
];

export default function TrustBarV2() {
  return (
    <div>
      {/* Ornament divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div className="gold-line" style={{ flex: 1 }} />
        <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em", whiteSpace: "nowrap" }}>
          עסקים שכבר עובדים עם בילדו
        </span>
        <div className="gold-line" style={{ flex: 1 }} />
      </div>

      {/* Logos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {clients.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="card-v"
            style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px" }}
          >
            <img
              src={c.logo}
              alt={c.name}
              style={{ maxHeight: 32, maxWidth: "100%", objectFit: "contain", filter: "grayscale(1) sepia(0.2)", opacity: 0.65, transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.target.style.filter = "none"; e.target.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.target.style.filter = "grayscale(1) sepia(0.2)"; e.target.style.opacity = "0.65"; }}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-ledger"
            style={{ padding: "18px", textAlign: "center" }}
          >
            <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: "var(--gold)" }}>{s.value}</div>
            <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", letterSpacing: "0.12em", marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-v"
            style={{ padding: "20px 22px" }}
          >
            <p style={{ fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 }}>
              "{t.text}"
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{t.role}</div>
              </div>
              <span style={{
                fontFamily: "'Josefin Sans',sans-serif", fontSize: 10, letterSpacing: "0.08em",
                background: "var(--gold-pale)", color: "var(--gold)", border: "1px solid var(--gold-border)",
                borderRadius: 2, padding: "4px 10px", fontWeight: 600,
              }}>
                {t.gain}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}