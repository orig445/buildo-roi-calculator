import { motion } from "framer-motion";

const stats = [
  { number: "500+", label: "עסקים פעילים", icon: "🏢" },
  { number: "50M+", label: "הודעות נשלחו", icon: "💬" },
  { number: "98%", label: "שביעות רצון", icon: "⭐" },
  { number: "24h", label: "זמן הטמעה", icon: "⚡" },
];

const testimonials = [
  {
    name: "אמיר כהן",
    role: "מנכ\"ל, SaaS לוגיסטיקה",
    text: "בתוך שבוע מהחיבור ל-API של בילדו, ראינו עלייה של 35% בשיעור הסגירה. הלקוחות מקבלים מענה מידי.",
    gain: "+₪42,000/חודש"
  },
  {
    name: "שירה לוי",
    role: "CTO, פלטפורמת מסחר",
    text: "האינטגרציה הייתה פשוטה להפליא. ה-API מתועד מצוין ותמיכה זמינה 24/7.",
    gain: "+₪28,000/חודש"
  }
];

export default function TrustSection() {
  return (
    <section className="py-16 px-4">
      {/* Stats */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center rounded-2xl p-5 gold-border"
              style={{ background: 'hsl(28 12% 11%)' }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black gradient-text">{stat.number}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-8"
          style={{ fontFamily: 'Frank Ruhl Libre, serif' }}
        >
          מה לקוחות שלנו אומרים
        </motion.h3>

        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl p-6 relative"
              style={{ background: 'hsl(28 12% 11%)', border: '1px solid hsl(271 60% 25% / 0.4)' }}
            >
              <div className="absolute top-4 left-4 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                {t.gain}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 mt-6">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}