import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContactFormV2 from "@/components/calculator/ContactFormV2";
import TrustBar from "@/components/calculator/TrustBar";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";
import confetti from "canvas-confetti";

const fmt = (n) => `₪${Math.round(n).toLocaleString("he-IL")}`;

const BUSINESS_SIZES = [
  { max: 50,    label: "עסק זעיר",   badge: "xs", emoji: "🌱", desc: "עד 50 לקוחות/חודש" },
  { max: 200,   label: "עסק קטן",    badge: "sm", emoji: "🏪", desc: "50–200 לקוחות/חודש" },
  { max: 600,   label: "עסק בינוני", badge: "md", emoji: "🏢", desc: "200–600 לקוחות/חודש" },
  { max: 2000,  label: "עסק גדול",   badge: "lg", emoji: "🏗️", desc: "600–2000 לקוחות/חודש" },
  { max: 99999, label: "תאגיד",      badge: "xl", emoji: "🏦", desc: "2000+ לקוחות/חודש" },
];

const getSize = (c) => BUSINESS_SIZES.find((s) => c <= s.max) || BUSINESS_SIZES[4];

const getResponseLabel = (r) => {
  if (r < 30) return { label: "נמוך מאוד", color: "var(--rust)" };
  if (r < 60) return { label: "ממוצע", color: "var(--gold)" };
  if (r < 80) return { label: "טוב", color: "var(--forest-mid)" };
  return { label: "מצוין", color: "var(--forest)" };
};

export default function CalculatorV2() {
  const [messages, setMessages] = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [responseRate, setResponseRate] = useState(40);
  const [showForm, setShowForm] = useState(false);

  const r = useMemo(() => {
    const lostRate  = (1 - responseRate / 100) * 0.6;
    const liftRate  = Math.min((responseRate / 100) * 0.4 + 0.1, 0.45);
    const lostCust  = Math.round(customers * lostRate);
    const monthLoss = lostCust * dealValue;
    const monthGain = Math.round(customers * liftRate) * dealValue;
    const msgCost   = Math.round(messages * 0.08);
    const roi       = msgCost > 0 ? Math.round((monthGain * 12) / (msgCost * 12)) : 0;
    const size      = getSize(customers);
    const dailyLoss = Math.round(monthLoss / 30);
    return { monthLoss, annualLoss: monthLoss * 12, monthGain, annualGain: monthGain * 12, lostCust, msgCost, roi, size, dailyLoss };
  }, [messages, customers, dealValue, responseRate]);

  const handleCTAClick = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#C4962A", "#E8C96B", "#F5E9C5", "#1A3325", "#4A8C60"],
      scalar: 1.1,
    });
    setTimeout(() => setShowForm(true), 350);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", direction: "rtl", fontFamily: "'Heebo', sans-serif" }}>

      {/* HEADER */}
      <header style={{
        background: "rgba(245,240,232,0.93)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--gold-border)",
        position: "sticky", top: 0, zIndex: 40,
        boxShadow: "0 1px 12px rgba(26,18,8,0.06)"
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png" alt="בילדו" style={{ height: 34, borderRadius: 8 }} />
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", lineHeight: 1.2 }}>בילדו</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase" }}>WhatsApp Business API</div>
            </div>
          </div>
          <button className="btn-stamp" style={{ padding: "9px 22px", fontSize: 11 }} onClick={handleCTAClick}>
            קבל הדגמה חינם
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "white", borderBottom: "1px solid var(--gold-border)", padding: "52px 24px 44px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {["◆", "◇", "◆"].map((c, i) => (
                <span key={i} style={{ color: "var(--gold)", fontSize: 10, letterSpacing: 4 }}>{c}</span>
              ))}
            </div>
            <div className="font-label" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 9, color: "var(--gold)",
              border: "1px solid var(--gold-border)", background: "var(--gold-pale)",
              padding: "5px 16px", borderRadius: 20, marginBottom: 22
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              מחשבון ROI חינמי · בילדו · ספק רשמי Meta
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, lineHeight: 1.12, color: "var(--ink)", marginBottom: 4 }}>
            כמה כסף אתה מפסיד
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, fontStyle: "italic", color: "var(--rust)", marginBottom: 22 }}>
            מדי חודש?
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontSize: 16, color: "var(--ink-light)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.75 }}>
            עסקים שמנהלים וואטסאפ ידנית מפסידים לקוחות כל יום.{" "}
            <strong style={{ color: "var(--ink-mid)", fontWeight: 600 }}>הגדר את הנתונים שלך — ראה את האמת.</strong>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.42 }}
            style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ icon: "✅", t: "ספק רשמי Meta" }, { icon: "🔒", t: "API מאובטח" }, { icon: "⚡", t: "הטמעה תוך 24 שעות" }].map((b) => (
              <span key={b.t} className="font-label" style={{ fontSize: 9, padding: "5px 14px", border: "1px solid var(--gold-border)", borderRadius: 20, color: "var(--ink-light)", background: "var(--cream)" }}>
                {b.icon} {b.t}
              </span>
            ))}
          </motion.div>

          <span className="gold-line" style={{ width: "40%", display: "block", margin: "32px auto 0" }} />
        </div>
      </section>

      {/* MAIN */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 72px" }}>

        {/* ANALYZER */}
        <FadeSection delay={0}>
          <div className="card-v corner-frame corner-inner" style={{ padding: "22px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.14em" }}>מלא אוטומטית לפי האתר שלך</span>
            </div>
            <WebsiteAnalyzer onAnalyzed={({ messages: m, customers: c, dealValue: d }) => {
              setMessages(m); setCustomers(c); setDealValue(d);
            }} />
          </div>
        </FadeSection>

        {/* BUSINESS SIZE BANNER */}
        <FadeSection delay={0.04}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            marginBottom: 20, padding: "14px 20px",
            background: "white", border: "1px solid var(--gold-border)", borderRadius: 6
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24 }}>{r.size.emoji}</span>
              <div>
                <span className={`size-badge ${r.size.badge}`}>{r.size.label}</span>
                <div style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>{r.size.desc}</div>
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="font-label" style={{ fontSize: 9, color: "var(--ink-light)" }}>הפסד יומי משוער</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--rust)" }}>
                ₪{r.dailyLoss.toLocaleString("he-IL")}
              </div>
            </div>
          </div>
        </FadeSection>

        {/* CALC GRID */}
        <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, alignItems: "start" }}>

          {/* SLIDERS */}
          <FadeSection delay={0.06}>
            <div className="card-ledger corner-frame corner-inner" style={{ padding: "26px 24px 22px" }}>
              <div style={{ marginBottom: 22 }}>
                <div className="font-label" style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 5 }}>הגדרת פרמטרים</div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>פרמטרי העסק שלך</h2>
                <span className="gold-line" style={{ width: "50%", display: "block", marginTop: 10 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <VintageSliderRow
                  roman="I" label="הודעות וואטסאפ בחודש"
                  value={messages} min={100} max={100000} step={100}
                  onChange={setMessages} display={messages.toLocaleString("he-IL")}
                  accent="var(--gold)"
                  hint={messages < 1000 ? "נמוך" : messages < 10000 ? "ממוצע לתעשייה" : "גבוה — מצוין!"}
                  hintColor={messages < 1000 ? "var(--rust)" : messages < 10000 ? "var(--gold)" : "var(--forest-mid)"}
                />
                <span className="gold-line" />
                <VintageSliderRow
                  roman="II" label="לקוחות / עסקאות בחודש"
                  value={customers} min={10} max={5000} step={10}
                  onChange={setCustomers} display={customers.toLocaleString("he-IL")}
                  accent="var(--gold)"
                  hint={r.size.label} hintEmoji={r.size.emoji}
                  hintColor={r.size.badge === "xs" ? "var(--ink-light)" : r.size.badge === "sm" ? "var(--gold)" : r.size.badge === "md" ? "var(--forest-mid)" : r.size.badge === "lg" ? "var(--forest)" : "var(--rust)"}
                />
                <span className="gold-line" />
                <VintageSliderRow
                  roman="III" label="ערך ממוצע לעסקה"
                  value={dealValue} min={100} max={50000} step={100}
                  onChange={setDealValue} display={`₪${dealValue.toLocaleString("he-IL")}`}
                  accent="var(--rust)"
                  hint={dealValue < 500 ? "עסקה קטנה" : dealValue < 5000 ? "עסקה בינונית" : "עסקה גדולה"}
                  hintColor={dealValue < 500 ? "var(--ink-light)" : dealValue < 5000 ? "var(--gold)" : "var(--forest-mid)"}
                />
                <span className="gold-line" />
                <VintageSliderRow
                  roman="IV" label="אחוז מענה נוכחי לפניות"
                  value={responseRate} min={5} max={95} step={5}
                  onChange={setResponseRate} display={`${responseRate}%`}
                  accent="var(--forest-mid)"
                  hint={getResponseLabel(responseRate).label}
                  hintColor={getResponseLabel(responseRate).color}
                  subHint="כמה % מהפניות מקבלות מענה תוך שעה?"
                />
              </div>

              {/* Mini stats */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(196,150,42,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="card-v" style={{ padding: "10px 14px", borderRadius: 4 }}>
                  <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 3 }}>לקוחות אבודים</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--rust)" }}>{r.lostCust}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-light)" }}>לחודש</div>
                </div>
                <div className="card-v" style={{ padding: "10px 14px", borderRadius: 4 }}>
                  <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 3 }}>עלות API</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--ink-mid)" }}>₪{r.msgCost}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-light)" }}>לחודש</div>
                </div>
              </div>
            </div>
          </FadeSection>

          {/* RESULTS */}
          <FadeSection delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Loss */}
              <div className="card-loss" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--rust)", display: "inline-block" }} />
                  <span className="font-label" style={{ fontSize: 9, color: "var(--rust)", letterSpacing: "0.12em" }}>מה אתה מפסיד היום</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle style={{ width: 13, height: 13, color: "var(--ink-light)", cursor: "help", marginRight: "auto" }} />
                      </TooltipTrigger>
                      <TooltipContent side="top" style={{ maxWidth: 220, textAlign: "right" }}>
                        <p style={{ fontSize: 11 }}>מחושב לפי אחוז המענה הנוכחי × לקוחות × ערך עסקה.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 4 }}>חודשי</div>
                    <motion.div key={r.monthLoss} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "var(--rust)" }}>
                      {fmt(r.monthLoss)}
                    </motion.div>
                  </div>
                  <div>
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 4 }}>שנתי</div>
                    <motion.div key={r.annualLoss} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--rust)", opacity: 0.8 }}>
                      {fmt(r.annualLoss)}
                    </motion.div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: "var(--ink-light)", borderTop: "1px solid rgba(139,58,26,0.1)", paddingTop: 8 }}>
                  * {r.lostCust} לקוחות נושרים מדי חודש ללא מענה מהיר
                </div>
              </div>

              {/* Gain */}
              <div className="card-gain" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--forest-accent)", display: "inline-block" }} />
                  <span className="font-label" style={{ fontSize: 9, color: "var(--forest-mid)", letterSpacing: "0.12em" }}>פוטנציאל עם בילדו</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle style={{ width: 13, height: 13, color: "var(--ink-light)", cursor: "help", marginRight: "auto" }} />
                      </TooltipTrigger>
                      <TooltipContent side="top" style={{ maxWidth: 220, textAlign: "right" }}>
                        <p style={{ fontSize: 11 }}>שיפור של עד 40% בסגירת עסקאות עם מענה אוטומטי מיידי, תזכורות וקמפיינים.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 4 }}>רווח חודשי</div>
                    <motion.div key={r.monthGain} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "var(--forest-mid)" }}>
                      +{fmt(r.monthGain)}
                    </motion.div>
                  </div>
                  <div>
                    <div className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", marginBottom: 4 }}>רווח שנתי</div>
                    <motion.div key={r.annualGain} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--forest-mid)", opacity: 0.85 }}>
                      +{fmt(r.annualGain)}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* ROI Dark Card */}
              <div className="card-dark" style={{ padding: "18px 20px" }}>
                <div className="font-label" style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(232,201,107,0.6)", marginBottom: 10, textAlign: "center" }}>
                  ◆ &nbsp; סיכום ROI שנתי &nbsp; ◆
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="font-label" style={{ fontSize: 8, color: "rgba(232,201,107,0.5)", marginBottom: 3 }}>עלות/הודעה</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: "var(--gold-light)" }}>
                      ₪{(r.msgCost / Math.max(messages, 1)).toFixed(3)}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <motion.div key={r.roi} className="roi-glow" style={{
                      fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, fontStyle: "italic", lineHeight: 1,
                      color: r.roi < 5 ? "var(--gold)" : r.roi < 15 ? "var(--gold-light)" : "#7FD4A0",
                    }}>
                      {r.roi}x
                    </motion.div>
                    <div className="font-label" style={{ fontSize: 8, letterSpacing: "0.1em", color: "rgba(232,201,107,0.45)", marginTop: 3 }}>ROI שנתי</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div className="font-label" style={{ fontSize: 8, color: "rgba(232,201,107,0.5)", marginBottom: 3 }}>החזר</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "var(--gold-light)" }}>תוך חודש</div>
                  </div>
                </div>
              </div>

              <button className="btn-stamp" style={{ width: "100%", padding: "16px 24px", fontSize: 12 }} onClick={handleCTAClick}>
                🚀 &nbsp; קבל הדגמה חינם — ראה זאת בפועל
              </button>
              <p className="font-label" style={{ textAlign: "center", fontSize: 9, color: "var(--ink-light)" }}>
                ללא התחייבות · תגובה תוך 24 שעות
              </p>
            </div>
          </FadeSection>
        </div>

        {/* TRUST */}
        <FadeSection delay={0.05}>
          <div style={{ marginTop: 36 }}>
            <TrustBar />
          </div>
        </FadeSection>
      </main>

      {/* FOOTER CTA — DARK */}
      <section style={{ background: "var(--forest)", padding: "52px 24px", borderTop: "1px solid var(--gold)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="font-label" style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(232,201,107,0.5)", marginBottom: 16 }}>◆ ◇ ◆</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "var(--gold-light)", marginBottom: 10, lineHeight: 1.2 }}>
            כל יום שעובר עולה לך
            <br />
            <span style={{ fontStyle: "italic", color: "var(--gold)" }}>₪{r.dailyLoss.toLocaleString("he-IL")} נוספים</span>
          </h2>
          <p style={{ fontSize: 13, color: "rgba(232,201,107,0.55)", marginBottom: 28, fontFamily: "'Heebo', sans-serif" }}>
            הדגמה חינמית · ₪0 עד שרואים תוצאות · אינטגרציה תוך 24 שעות
          </p>
          <button className="btn-stamp" style={{ padding: "16px 40px", fontSize: 13, boxShadow: "0 4px 30px rgba(196,150,42,0.3)" }} onClick={handleCTAClick}>
            🚀 &nbsp; התחל להרוויח יותר עכשיו
          </button>
          <div className="font-label" style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(232,201,107,0.3)", marginTop: 28 }}>◆ ◇ ◆</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "white", borderTop: "1px solid var(--gold-border)", padding: "14px 24px", textAlign: "center" }}>
        <div className="font-label" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-light)", textTransform: "uppercase" }}>
          © 2026 בילדו · שותף רשמי Meta · WhatsApp Business API
        </div>
      </footer>

      <ContactFormV2
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthLoss, potentialGain: r.monthGain }}
      />
    </div>
  );
}

function VintageSliderRow({ roman, label, value, min, max, step, onChange, display, accent, hint, hintColor, hintEmoji, subHint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="font-label" style={{
            fontSize: 8, color: "var(--gold)", border: "1px solid var(--gold-border)",
            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 3, flexShrink: 0, background: "var(--gold-pale)"
          }}>{roman}</span>
          <div>
            <span style={{ fontSize: 13, color: "var(--ink-mid)", fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{label}</span>
            {subHint && <div style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 1 }}>{subHint}</div>}
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <motion.span key={display} initial={{ opacity: 0.6, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: accent, display: "block", lineHeight: 1 }}>
            {display}
          </motion.span>
          {hint && (
            <span className="font-label" style={{ fontSize: 9, color: hintColor, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2 }}>
              {hintEmoji && <span>{hintEmoji}</span>} {hint}
            </span>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-v"
        style={{ background: `linear-gradient(to left, ${accent} ${pct}%, rgba(196,150,42,0.12) ${pct}%)` }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--ink-light)", marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>
        <span>{min.toLocaleString("he-IL")}</span>
        <span>{max.toLocaleString("he-IL")}</span>
      </div>
    </div>
  );
}

function FadeSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}