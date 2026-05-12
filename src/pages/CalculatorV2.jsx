import { useState, useMemo, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronLeft, Sparkles, TrendingUp, Users, MessageCircle, Zap } from "lucide-react";
import ContactFormV2 from "@/components/calculator/ContactFormV2";
import TrustBar from "@/components/calculator/TrustBar";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";

const fmt = (n) => `₪${Math.round(n).toLocaleString("he-IL")}`;

const BUSINESS_SIZES = [
  { max: 50,    label: "עסק קטן",    emoji: "🌱" },
  { max: 200,   label: "עסק בינוני", emoji: "🏪" },
  { max: 600,   label: "עסק פעיל",   emoji: "🏢" },
  { max: 2000,  label: "עסק גדול",   emoji: "🏗️" },
  { max: 99999, label: "תאגיד",      emoji: "🏦" },
];
const getSize = (c) => BUSINESS_SIZES.find((s) => c <= s.max) || BUSINESS_SIZES[4];

const getResponseLabel = (r) => {
  if (r < 30) return { label: "נמוך", color: "#e05858" };
  if (r < 60) return { label: "ממוצע", color: "#9b7fd4" };
  if (r < 80) return { label: "טוב", color: "#7c5cbf" };
  return { label: "מצוין!", color: "#5a3fa8" };
};

export default function CalculatorV2() {
  const [messages, setMessages] = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [responseRate, setResponseRate] = useState(40);
  const [showForm, setShowForm] = useState(false);

  const r = useMemo(() => {
    const missedRate = (1 - responseRate / 100) * 0.6;
    const potentialRate = Math.min((responseRate / 100) * 0.4 + 0.1, 0.45);
    const missedCust  = Math.round(customers * missedRate);
    const monthMissed = missedCust * dealValue;
    const monthGain   = Math.round(customers * potentialRate) * dealValue;
    const msgCost     = Math.round(messages * 0.08);
    const roi         = msgCost > 0 ? Math.round((monthGain * 12) / (msgCost * 12)) : 0;
    const size        = getSize(customers);
    return { monthMissed, annualMissed: monthMissed * 12, monthGain, annualGain: monthGain * 12, missedCust, msgCost, roi, size };
  }, [messages, customers, dealValue, responseRate]);

  const handleCTA = useCallback(() => setShowForm(true), []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F8F6FF", fontFamily: "'Heebo', sans-serif", color: "#2d1b69" }}>

      {/* HEADER */}
      <header style={{ background: "white", borderBottom: "1px solid #ede8ff", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 16px rgba(90,63,168,0.07)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png" alt="בילדו" style={{ height: 36 }} />
          <button onClick={handleCTA} className="cta-btn" style={{ padding: "10px 24px", fontSize: 13 }}>
            קבל הדגמה חינם <ChevronLeft style={{ width: 15, height: 15, display: "inline", verticalAlign: "middle" }} />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #5a3fa8 0%, #7c5cbf 50%, #9b7fd4 100%)", padding: "64px 24px 72px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Soft bg circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "5px 16px", marginBottom: 24, fontSize: 12, color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}>
              ✨ מחשבון חינמי לעסקים · ספק רשמי Meta
            </div>
            <h1 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 52px)", color: "white", lineHeight: 1.2, marginBottom: 16 }}>
              כמה לקוחות פשוט <br />
              <span style={{ color: "#ffd166", fontStyle: "italic" }}>עוזבים בלי לקנות?</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>
              כשלקוח שולח הודעה ולא מקבל מענה מהיר — הוא הולך למתחרה.
              <br />
              <strong style={{ color: "white" }}>בוא נראה בדיוק כמה זה שווה לך.</strong>
            </p>
            <button onClick={handleCTA} className="cta-btn cta-btn-white" style={{ padding: "14px 36px", fontSize: 15 }}>
              חשב את הפוטנציאל שלי 🚀
            </button>
          </motion.div>
        </div>
      </section>

      {/* MAIN */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ANALYZER */}
        <FadeIn delay={0}>
          <div className="soft-card" style={{ padding: "22px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Sparkles style={{ width: 16, height: 16, color: "#7c5cbf" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#7c5cbf" }}>מלא אוטומטית לפי האתר שלך</span>
            </div>
            <WebsiteAnalyzer onAnalyzed={({ messages: m, customers: c, dealValue: d }) => {
              setMessages(m); setCustomers(c); setDealValue(d);
            }} />
          </div>
        </FadeIn>

        {/* CALC GRID */}
        <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, alignItems: "start" }}>

          {/* SLIDERS */}
          <FadeIn delay={0.06}>
            <div className="soft-card" style={{ padding: "28px 26px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2d1b69", marginBottom: 6 }}>הגדר את הנתונים שלך</h2>
              <p style={{ fontSize: 13, color: "#8b7ab8", marginBottom: 24 }}>הזז את הסליידרים לפי המצב האמיתי שלך</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SliderRow
                  icon={<MessageCircle style={{ width: 15, height: 15 }} />}
                  label="הודעות וואטסאפ בחודש"
                  value={messages} min={100} max={100000} step={100}
                  onChange={setMessages}
                  display={messages.toLocaleString("he-IL")}
                  hint={messages < 1000 ? "נמוך" : messages < 10000 ? "ממוצע" : "גבוה 🔥"}
                  hintOk={messages >= 10000}
                />
                <SliderRow
                  icon={<Users style={{ width: 15, height: 15 }} />}
                  label="לקוחות פוטנציאליים בחודש"
                  value={customers} min={10} max={5000} step={10}
                  onChange={setCustomers}
                  display={`${customers.toLocaleString("he-IL")} ${r.size.emoji}`}
                  hint={r.size.label}
                  hintOk={customers >= 200}
                />
                <SliderRow
                  icon={<span style={{ fontSize: 14 }}>₪</span>}
                  label="ערך ממוצע לעסקה / לקוח"
                  value={dealValue} min={100} max={50000} step={100}
                  onChange={setDealValue}
                  display={`₪${dealValue.toLocaleString("he-IL")}`}
                  hint={dealValue < 500 ? "נמוך" : dealValue < 5000 ? "בינוני" : "גבוה 💰"}
                  hintOk={dealValue >= 1000}
                />
                <SliderRow
                  icon={<Zap style={{ width: 15, height: 15 }} />}
                  label="אחוז פניות שמקבלות מענה תוך שעה"
                  value={responseRate} min={5} max={95} step={5}
                  onChange={setResponseRate}
                  display={`${responseRate}%`}
                  hint={getResponseLabel(responseRate).label}
                  hintOk={responseRate >= 70}
                  subHint="רוב העסקים עונים לפחות מ-40% מהפניות בזמן"
                />
              </div>

              {/* Mini insight */}
              <div style={{ marginTop: 24, padding: "14px 16px", background: "#f3f0ff", borderRadius: 12, border: "1px solid #e0d9f5" }}>
                <div style={{ fontSize: 12, color: "#7c5cbf", fontWeight: 600, marginBottom: 4 }}>💡 מה המספרים אומרים?</div>
                <div style={{ fontSize: 13, color: "#2d1b69", lineHeight: 1.6 }}>
                  כרגע בערך <strong style={{ color: "#e05858" }}>{r.missedCust} לקוחות בחודש</strong> לא מקבלים מענה מהיר ועוזבים.
                  עם בילדו אפשר לשמור על רובם אוטומטית.
                </div>
              </div>
            </div>
          </FadeIn>

          {/* RESULTS */}
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Missed opportunity */}
              <div className="soft-card" style={{ padding: "20px", borderTop: "3px solid #ffb3b3" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>😔</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1b69" }}>רווח שאתה מפספס כרגע</div>
                    <div style={{ fontSize: 11, color: "#8b7ab8" }}>לא הפסד — הכסף פשוט עוד לא בכיס שלך</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#fff5f5", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#c47a7a", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>בחודש</div>
                    <motion.div key={r.monthMissed} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ fontSize: 24, fontWeight: 900, color: "#d44", lineHeight: 1 }}>
                      {fmt(r.monthMissed)}
                    </motion.div>
                  </div>
                  <div style={{ background: "#fff5f5", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#c47a7a", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>בשנה</div>
                    <motion.div key={r.annualMissed} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ fontSize: 20, fontWeight: 800, color: "#d44", lineHeight: 1 }}>
                      {fmt(r.annualMissed)}
                    </motion.div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "#c47a7a", background: "#fff5f5", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5 }}>
                  🤷 בערך {r.missedCust} לקוחות בחודש פשוט לא מקבלים מענה מהיר ועוזבים
                </div>
              </div>

              {/* Potential with Bildo */}
              <div className="soft-card" style={{ padding: "20px", borderTop: "3px solid #a8e6cf" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1b69" }}>הפוטנציאל שלך עם בילדו</div>
                    <div style={{ fontSize: 11, color: "#8b7ab8" }}>מה אפשר להשיג עם מענה אוטומטי חכם</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#f0faf5", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#5a9b7a", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>בחודש</div>
                    <motion.div key={r.monthGain} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ fontSize: 24, fontWeight: 900, color: "#2a7d55", lineHeight: 1 }}>
                      +{fmt(r.monthGain)}
                    </motion.div>
                  </div>
                  <div style={{ background: "#f0faf5", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#5a9b7a", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>בשנה</div>
                    <motion.div key={r.annualGain} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ fontSize: 20, fontWeight: 800, color: "#2a7d55", lineHeight: 1 }}>
                      +{fmt(r.annualGain)}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* ROI pill */}
              <div style={{ background: "linear-gradient(135deg, #5a3fa8, #9b7fd4)", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 8, letterSpacing: "0.05em" }}>🏆 כל ₪1 שמשקיעים בבילדו מחזיר בממוצע</div>
                <motion.div key={r.roi} style={{ fontSize: 52, fontWeight: 900, color: "#ffd166", lineHeight: 1, fontStyle: "italic" }}
                  initial={{ opacity: 0.7, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  {r.roi}x
                </motion.div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>החזר שנתי על ההשקעה</div>
              </div>

              <button onClick={handleCTA} className="cta-btn" style={{ width: "100%", padding: "16px", fontSize: 14 }}>
                אני רוצה לראות את זה בפועל 🚀
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "#8b7ab8" }}>ללא התחייבות · מענה תוך שעות</p>
            </div>
          </FadeIn>
        </div>

        {/* HOW IT WORKS — simple 3-step */}
        <FadeIn delay={0.05}>
          <div style={{ marginTop: 40, padding: "32px 28px", background: "white", borderRadius: 20, border: "1px solid #ede8ff" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2d1b69", textAlign: "center", marginBottom: 24 }}>איך בילדו עוזר לך לסגור יותר עסקאות?</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { icon: "⚡", title: "מענה מיידי", desc: "כל לקוח שפונה מקבל תשובה תוך שניות — גם בלילה, גם בשישי" },
                { icon: "🔄", title: "תזכורות חכמות", desc: "מערכת שולחת תזכורות אוטומטיות ללקוחות שלא ענו ומחזירה אותם" },
                { icon: "📊", title: "קמפיינים ממוקדים", desc: "שלח הודעות ממוקדות לאלפי לקוחות בלחיצה אחת ותראה תוצאות" },
              ].map((s) => (
                <div key={s.title} style={{ textAlign: "center", padding: "20px 16px", background: "#f8f6ff", borderRadius: 14, border: "1px solid #ede8ff" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2d1b69", marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "#8b7ab8", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* TRUST */}
        <FadeIn delay={0.05}>
          <div style={{ marginTop: 32 }}>
            <TrustBar />
          </div>
        </FadeIn>
      </main>

      {/* FOOTER CTA */}
      <section style={{ background: "linear-gradient(135deg, #5a3fa8 0%, #7c5cbf 100%)", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💜</div>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 36px)", color: "white", marginBottom: 12, lineHeight: 1.3 }}>
            הלקוחות שלך כבר שולחים הודעות.<br />
            <span style={{ color: "#ffd166" }}>השאלה היא מי עונה להם.</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.7 }}>
            קבל הדגמה חינמית ב-15 דקות ותראה בדיוק<br />
            כמה עסקאות אפשר להוסיף לעסק שלך עכשיו.
          </p>
          <button onClick={handleCTA} className="cta-btn cta-btn-white" style={{ padding: "16px 40px", fontSize: 15 }}>
            קבל הדגמה חינם עכשיו →
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>ללא כרטיס אשראי · ללא התחייבות</p>
        </div>
      </section>

      <footer style={{ background: "white", borderTop: "1px solid #ede8ff", padding: "14px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#8b7ab8" }}>© 2026 בילדו · שותף רשמי Meta · WhatsApp Business API</p>
      </footer>

      <ContactFormV2
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthMissed, potentialGain: r.monthGain }}
      />

      <style>{`
        .soft-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #ede8ff;
          box-shadow: 0 4px 24px rgba(90,63,168,0.06);
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #5a3fa8;
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Heebo', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 18px rgba(90,63,168,0.3);
        }
        .cta-btn:hover { background: #4a3290; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(90,63,168,0.4); }
        .cta-btn:active { transform: translateY(0); }
        .cta-btn-white {
          background: white;
          color: #5a3fa8;
          box-shadow: 0 4px 18px rgba(0,0,0,0.12);
        }
        .cta-btn-white:hover { background: #f8f6ff; box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
        .slider-purple {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          width: 100%;
        }
        .slider-purple::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid #7c5cbf;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(90,63,168,0.25);
          transition: transform 0.15s;
        }
        .slider-purple::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .slider-purple::-moz-range-thumb {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid #7c5cbf;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SliderRow({ icon, label, value, min, max, step, onChange, display, hint, hintOk, subHint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "#7c5cbf" }}>{icon}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2d1b69" }}>{label}</span>
            {subHint && <div style={{ fontSize: 10, color: "#8b7ab8", marginTop: 1 }}>{subHint}</div>}
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <motion.span key={display} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}
            style={{ fontSize: 20, fontWeight: 800, color: "#5a3fa8", display: "block", lineHeight: 1 }}>
            {display}
          </motion.span>
          {hint && <span style={{ fontSize: 10, color: hintOk ? "#2a7d55" : "#9b7fd4", fontWeight: 600, display: "block", textAlign: "left" }}>{hint}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-purple"
        style={{ background: `linear-gradient(to left, #7c5cbf ${pct}%, #ede8ff ${pct}%)` }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#b8aad4", marginTop: 4 }}>
        <span>{min.toLocaleString("he-IL")}</span>
        <span>{max.toLocaleString("he-IL")}</span>
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}