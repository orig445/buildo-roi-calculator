import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "רוני כהן",
    role: "מנכ\"ל, Ice Class",
    avatar: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png",
    text: "לפני בילדו היינו מאבדים לפחות 40 לקוחות בחודש שפשוט לא קיבלו מענה. היום הבוט עונה תוך שניות — המכירות עלו ב-30% בתוך חודשיים.",
    metric: "+30% מכירות",
    metricColor: "#1a7a44",
    stars: 5,
  },
  {
    name: "טל לוי",
    role: "בעלת עסק, A Head Spa",
    avatar: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg",
    text: "ניסיתי כמה פתרונות אחרים אבל כלום לא היה כמו בילדו. ההגדרה לקחה יום וכבר בשבוע הראשון היה לי 12 תורים חדשים שהגיעו מהוואטסאפ.",
    metric: "12 תורים בשבוע הראשון",
    metricColor: "#5a3fa8",
    stars: 5,
  },
  {
    name: "דני שפיר",
    role: "מנהל שיווק, TRIPEX",
    avatar: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png",
    text: "שלחנו קמפיין ל-3,000 לקוחות ב-20 דקות. 18% אחוז תגובה — זה פי 3 ממייל. ROI חיובי תוך שבוע.",
    metric: "18% תגובה לקמפיין",
    metricColor: "#c4962a",
    stars: 5,
  },
];

function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
      {[...Array(count)].map((_, i) => (
        <Star key={i} style={{ width: 13, height: 13, fill: "#ffd166", color: "#ffd166" }} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#7c5cbf", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>✦ מה אומרים עלינו</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2d1b69", margin: 0 }}>לקוחות שכבר מרוויחים יותר</h3>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{ background: "white", border: "1px solid #ede8ff", borderRadius: 16, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 4px 20px rgba(90,63,168,0.06)" }}
          >
            <Stars count={t.stars} />

            <p style={{ fontSize: 13, color: "#3d2e6b", lineHeight: 1.7, margin: 0, flex: 1 }}>
              "{t.text}"
            </p>

            <div style={{ background: "#f8f6ff", border: "1px solid #ede8ff", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: t.metricColor }}>{t.metric}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #f0ecff", paddingTop: 12 }}>
              <img src={t.avatar} alt={t.name}
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #ede8ff", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1b69" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#8b7ab8" }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 760px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}