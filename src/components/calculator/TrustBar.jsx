import { motion } from "framer-motion";

const clients = [
  { name: "ICE CLASS", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png" },
  { name: "TRIPEX",    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png" },
  { name: "ש.פארם",   logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/c7aa070c2_2026-05-05110024.png" },
  { name: "A Head Spa",logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg" },
];

const stats = [
  { n: "500+", label: "עסקים פעילים" },
  { n: "50M+", label: "הודעות נשלחו" },
  { n: "98%",  label: "שביעות רצון" },
  { n: "24h",  label: "זמן הטמעה" },
];

export default function TrustBar() {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #ede8ff", padding: "28px 24px" }}>
      <p style={{ textAlign: "center", fontSize: 12, color: "#8b7ab8", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em" }}>
        עסקים שכבר מרוויחים יותר עם בילדו
      </p>

      {/* Logos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {clients.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            style={{ background: "#f8f6ff", border: "1px solid #ede8ff", borderRadius: 12, padding: "14px 10px", display: "flex", alignItems: "center", justifyContent: "center", height: 56 }}>
            <img src={c.logo} alt={c.name}
              style={{ maxHeight: 28, maxWidth: "100%", objectFit: "contain", filter: "grayscale(60%)", opacity: 0.75, transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.target.style.filter = "none"; e.target.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.target.style.filter = "grayscale(60%)"; e.target.style.opacity = "0.75"; }}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            style={{ background: "#f8f6ff", border: "1px solid #ede8ff", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#7c5cbf", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 10, color: "#8b7ab8", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}