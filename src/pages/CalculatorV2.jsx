import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContactFormV2 from "@/components/calculator/ContactFormV2";
import ROIChart from "@/components/calculator/ROIChart";
import TrustBarV2 from "@/components/calculator/TrustBarV2";
import VintageSlider from "@/components/calculator/VintageSlider";
import AnimatedStat from "@/components/calculator/AnimatedStat";
import BenchmarkBadge from "@/components/calculator/BenchmarkBadge";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";
import confetti from "canvas-confetti";

export default function CalculatorV2() {
  const [messages, setMessages] = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [showForm, setShowForm] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSlider = (setter) => (val) => {
    setter(val);
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 200);
  };

  const r = useMemo(() => {
    const lostCust = Math.round(customers * 0.18);
    const monthLoss = lostCust * dealValue;
    const monthGain = Math.round(customers * 0.25) * dealValue;
    const msgCost = Math.round(messages * 0.08);
    const roi = monthGain > 0 ? Math.round((monthGain * 12) / (msgCost * 12 || 1)) : 0;
    return { monthLoss, annualLoss: monthLoss * 12, monthGain, annualGain: monthGain * 12, lostCust, msgCost, roi };
  }, [messages, customers, dealValue]);

  const prevRoi = useRef(0);
  useEffect(() => {
    const threshold = Math.floor(r.roi / 5);
    if (r.roi > 20 && threshold !== Math.floor(prevRoi.current / 5)) {
      confetti({ particleCount: 80, spread: 60, colors: ["#C4962A", "#E8C96B", "#1A3325"] });
    }
    prevRoi.current = r.roi;
  }, [r.roi]);

  const dailyLoss = Math.round(r.monthLoss / 30);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", direction: "rtl", fontFamily: "'Heebo', sans-serif" }}>

      {/* STICKY HEADER */}
      <header style={{
        background: "white", borderBottom: "1px solid var(--gold-border)",
        position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(8px)"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png" alt="Bildo" style={{ height: 36 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="font-label" style={{ fontSize: 10, color: "var(--ink-light)", display: "none" }}>WhatsApp Business API</span>
            <button className="btn-stamp" style={{ fontSize: 11, padding: "10px 20px" }} onClick={() => setShowForm(true)}>
              קבל הדגמה חינם ◆
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "white", borderBottom: "1px solid var(--gold-border)", padding: "60px 20px 50px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em", display: "block", marginBottom: 20 }}>
              ◆ מחשבון ROI חינמי · ספק רשמי Meta ◆
            </span>
          </motion.div>

          <div className="gold-line gold-line-anim" style={{ marginBottom: 28, width: "60%", margin: "0 auto 28px" }} />

          <motion.h1 className="font-display hero-h1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, lineHeight: 1.15, color: "var(--ink)", marginBottom: 8 }}>
            כמה כסף אתה מפסיד
          </motion.h1>
          <motion.h1 className="font-display hero-h1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, fontStyle: "italic", color: "var(--rust)", marginBottom: 24 }}>
            כל חודש?
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontSize: 16, color: "var(--ink-light)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
            עסקים שמנהלים וואטסאפ ידנית מפסידים לקוחות כל יום. הגדר את הנתונים שלך וגלה את האמת.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["✅ ספק רשמי Meta", "🔒 API מאובטח", "⚡ הטמעה תוך 24 שעות"].map((b) => (
              <span key={b} className="font-label" style={{
                fontSize: 9, padding: "6px 14px", border: "1px solid var(--gold-border)",
                borderRadius: 2, color: "var(--ink-mid)", background: "var(--gold-pale)"
              }}>{b}</span>
            ))}
          </motion.div>

          <div className="gold-line gold-line-anim" style={{ marginTop: 36, width: "60%", margin: "36px auto 0" }} />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px" }}>

        {/* WEBSITE ANALYZER */}
        <FadeSection delay={0}>
          <div className="card-v corner-frame corner-inner" style={{ padding: "24px 28px", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.14em" }}>מלא אוטומטית לפי האתר שלך</span>
            </div>
            <WebsiteAnalyzer onAnalyzed={({ messages: m, customers: c, dealValue: d }) => {
              setMessages(m); setCustomers(c); setDealValue(d);
            }} />
          </div>
        </FadeSection>

        {/* CALCULATOR GRID */}
        <div className="grid-calc" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, alignItems: "start" }}>

          {/* LEDGER PANEL */}
          <FadeSection delay={0.05}>
            <div className="card-ledger" style={{ padding: "28px" }}>
              <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.14em" }}>I. הגדר את הנתונים</span>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: "6px 0 20px" }}>פרמטרי העסק</h2>
              <div className="gold-line" style={{ marginBottom: 24 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SliderBlock
                  roman="I" label="הודעות וואטסאפ בחודש"
                  value={messages} min={100} max={100000} step={100}
                  onChange={handleSlider(setMessages)}
                  display={messages.toLocaleString("he-IL")}
                  benchmarkType="messages"
                />
                <div className="gold-line" />
                <SliderBlock
                  roman="II" label="לקוחות / עסקאות בחודש"
                  value={customers} min={10} max={5000} step={10}
                  onChange={handleSlider(setCustomers)}
                  display={customers.toLocaleString("he-IL")}
                  benchmarkType="customers"
                />
                <div className="gold-line" />
                <SliderBlock
                  roman="III" label="ערך ממוצע לעסקה"
                  value={dealValue} min={100} max={50000} step={100}
                  onChange={handleSlider(setDealValue)}
                  display={`₪${dealValue.toLocaleString("he-IL")}`}
                  benchmarkType="dealValue"
                />
              </div>

              <div style={{ borderTop: "2px solid var(--gold-border)", marginTop: 24, paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-light)" }}>
                  <span>לקוחות אבודים:</span>
                  <span style={{ fontWeight: 700, color: "var(--rust)" }}>{r.lostCust} / חודש</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-light)" }}>
                  <span>עלות API:</span>
                  <span style={{ fontWeight: 700, color: "var(--ink-mid)" }}>₪{r.msgCost} / חודש</span>
                </div>
              </div>
            </div>
          </FadeSection>

          {/* RESULTS PANEL */}
          <FadeSection delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* LOSS */}
              <div className={`card-loss ${isCalculating ? "is-calc" : ""}`} style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rust)", display: "inline-block" }} />
                  <span className="font-label" style={{ fontSize: 9, color: "var(--rust)", letterSpacing: "0.12em" }}>מה אתה מפסיד היום</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle style={{ width: 13, height: 13, color: "var(--ink-light)", cursor: "help", marginRight: "auto" }} />
                      </TooltipTrigger>
                      <TooltipContent side="top" style={{ maxWidth: 220, textAlign: "right" }}>
                        <p style={{ fontSize: 11, lineHeight: 1.6 }}>18% מהלקוחות שלך לא מקבלים מענה מהיר ועוזבים — נתון מבוסס מחקר שוק.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRight: "1px solid rgba(139,58,26,0.12)" }}>
                  <div style={{ textAlign: "center", paddingLeft: 12 }}>
                    <AnimatedStat value={r.monthLoss} color="var(--rust)" size={28} />
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginTop: 3 }}>חודשי</div>
                  </div>
                  <div style={{ textAlign: "center", paddingRight: 12 }}>
                    <AnimatedStat value={r.annualLoss} color="var(--rust)" size={22} />
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginTop: 3 }}>שנתי</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--rust)", opacity: 0.7, textAlign: "center" }}>
                  {r.lostCust} לקוחות נושרים בחודש
                </div>
              </div>

              {/* GAIN */}
              <div className={`card-gain ${isCalculating ? "is-calc" : ""}`} style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--forest-mid)", display: "inline-block" }} />
                  <span className="font-label" style={{ fontSize: 9, color: "var(--forest-mid)", letterSpacing: "0.12em" }}>פוטנציאל עם בילדו</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle style={{ width: 13, height: 13, color: "var(--ink-light)", cursor: "help", marginRight: "auto" }} />
                      </TooltipTrigger>
                      <TooltipContent side="top" style={{ maxWidth: 220, textAlign: "right" }}>
                        <p style={{ fontSize: 11, lineHeight: 1.6 }}>שיפור של 25% בסגירת עסקאות עם מענה אוטומטי מיידי, תזכורות חכמות וקמפיינים.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRight: "1px solid rgba(26,51,37,0.12)" }}>
                  <div style={{ textAlign: "center", paddingLeft: 12 }}>
                    <AnimatedStat value={r.monthGain} prefix="+₪" color="var(--forest-mid)" size={28} />
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginTop: 3 }}>חודשי</div>
                  </div>
                  <div style={{ textAlign: "center", paddingRight: 12 }}>
                    <AnimatedStat value={r.annualGain} prefix="+₪" color="var(--forest-mid)" size={22} />
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginTop: 3 }}>שנתי</div>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className="card-dark" style={{ padding: "20px 22px" }}>
                <div className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.15em", textAlign: "center", marginBottom: 12 }}>◆ ROI שנתי ◆</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--gold-light)", opacity: 0.7, fontFamily: "'Josefin Sans',sans-serif", letterSpacing: "0.08em" }}>עלות הודעה</div>
                    <div className="font-display roi-glow" style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>₪0.08</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--gold-light)", opacity: 0.7, fontFamily: "'Josefin Sans',sans-serif", letterSpacing: "0.08em" }}>מכפיל ROI</div>
                    <div className="font-display roi-glow" style={{ fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "var(--gold-light)" }}>
                      {r.roi}x
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--gold-light)", opacity: 0.7, fontFamily: "'Josefin Sans',sans-serif", letterSpacing: "0.08em" }}>Break-even</div>
                    <div className="font-display roi-glow" style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>30 יום</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button className="btn-stamp" style={{ width: "100%", fontSize: 12, padding: "16px", gap: 8 }} onClick={() => setShowForm(true)}>
                🚀 קבל הדגמה חינם — ראה זאת בפועל
              </button>
              <p className="font-label" style={{ textAlign: "center", fontSize: 9, color: "var(--ink-light)" }}>
                ללא התחייבות · תגובה תוך 24 שעות
              </p>
            </div>
          </FadeSection>
        </div>

        {/* CHART */}
        <FadeSection delay={0.05}>
          <div style={{ marginTop: 32 }}>
            <ROIChart monthLoss={r.monthLoss} monthGain={r.monthGain} />
          </div>
        </FadeSection>

        {/* TRUST */}
        <FadeSection delay={0.05}>
          <div style={{ marginTop: 32 }}>
            <TrustBarV2 />
          </div>
        </FadeSection>
      </div>

      {/* FOOTER CTA */}
      <FadeSection delay={0}>
        <section style={{ background: "var(--forest)", borderTop: "1px solid var(--gold)", padding: "60px 20px", textAlign: "center", marginTop: 20 }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ color: "var(--gold)", fontSize: 18, marginBottom: 16, letterSpacing: "0.2em" }}>◆ ◇ ◆</div>
            <h2 className="font-display" style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, color: "var(--cream)", marginBottom: 8 }}>
              כל יום שעובר עולה לך
            </h2>
            <div className="font-display roi-glow" style={{ fontSize: "clamp(36px, 7vw, 60px)", fontWeight: 900, fontStyle: "italic", color: "var(--gold)", marginBottom: 28 }}>
              ₪{dailyLoss.toLocaleString("he-IL")} ביום
            </div>
            <button className="btn-stamp" style={{ fontSize: 13, padding: "18px 40px", marginBottom: 16 }} onClick={() => setShowForm(true)}>
              🚀 קבל הדגמה חינם — ₪0 לנצח
            </button>
            <p style={{ fontSize: 12, color: "var(--gold-light)", opacity: 0.6, fontFamily: "'Josefin Sans',sans-serif", letterSpacing: "0.1em" }}>
              ₪3,000/חודש בלבד לאחר הדגמה
            </p>
            <div style={{ color: "var(--gold)", fontSize: 18, marginTop: 32, letterSpacing: "0.2em" }}>◆ ◇ ◆</div>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ background: "white", borderTop: "1px solid var(--gold-border)", padding: "20px", textAlign: "center" }}>
        <p className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em" }}>
          © 2026 בילדו · שותף רשמי Meta · WhatsApp Business API · ◆
        </p>
      </footer>

      <ContactFormV2
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthLoss, potentialGain: r.monthGain }}
      />
    </div>
  );
}

function SliderBlock({ roman, label, value, min, max, step, onChange, display, benchmarkType }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="font-label" style={{ fontSize: 8, color: "var(--gold)", letterSpacing: "0.15em" }}>{roman}</span>
          <span style={{ fontSize: 13, color: "var(--ink-mid)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BenchmarkBadge value={value} min={min} max={max} type={benchmarkType} />
          <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{display}</span>
        </div>
      </div>
      <VintageSlider value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  );
}

function FadeSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}