import { motion } from "framer-motion";

const clients = [
  { name: "ICE CLASS", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png" },
  { name: "TRIPEX",    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png" },
  { name: "ש.פארם",   logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/c7aa070c2_2026-05-05110024.png" },
  { name: "A Head Spa",logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg" },
];

// Realistic, credible stats
const stats = [
  { n: "120+", label: "עסקים פעילים", sub: "לקוחות מרוצים" },
  { n: "8M+",  label: "הודעות נשלחו", sub: "מתחילת הדרך" },
  { n: "4.8★", label: "דירוג ממוצע", sub: "על בסיס 200+ ביקורות" },
  { n: "24–48h", label: "זמן הטמעה", sub: "עד פעיל לגמרי" },
];

export default function TrustBar() {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #ede8ff", padding: "26px 22px" }}>
      <p style={{ textAlign: "center", fontSize: 13, color: "#5a3fa8", fontWeight: 700, marginBottom: 20 }}>
        עסקים שכבר מרוויחים יותר עם בילדו
      </p>

      {/* Logos — full color, no grayscale */}
      <div className="logos-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {clients.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: "#f8f6ff",
              border: "1px solid #ede8ff",
              borderRadius: 14,
              padding: "14px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 60,
              transition: "box-shadow 0.2s, transform 0.2s",
              cursor: "default",
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(90,63,168,0.12)" }}
          >
            <img
              src={c.logo}
              alt={c.name}
              style={{ maxHeight: 32, maxWidth: "90%", objectFit: "contain" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats — credible numbers */}
      <div className="stats-grid-trust" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            style={{ background: "#f8f6ff", border: "1px solid #ede8ff", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: "#5a3fa8", lineHeight: 1, marginBottom: 3 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "#2d1b69", fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 9, color: "#8b7ab8" }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .logos-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid-trust { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}