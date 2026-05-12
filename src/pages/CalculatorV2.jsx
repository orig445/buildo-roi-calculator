import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, Sparkles, Users, MessageCircle, Zap } from "lucide-react";
import ContactFormV2 from "@/components/calculator/ContactFormV2";
import TrustBar from "@/components/calculator/TrustBar";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";
import DemoChat from "@/components/calculator/DemoChat";
import Testimonials from "@/components/calculator/Testimonials";
import { trackEvent } from "@/lib/analytics";

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
  if (r < 30) return { label: "נמוך — אפשר לשפר הרבה", color: "#e05858" };
  if (r < 60) return { label: "ממוצע בשוק", color: "#9b7fd4" };
  if (r < 80) return { label: "טוב", color: "#5a3fa8" };
  return { label: "מצוין!", color: "#2a7d55" };
};

export default function CalculatorV2() {
  const [messages, setMessages] = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [responseRate, setResponseRate] = useState(40);
  const [showForm, setShowForm] = useState(false);
  const [activeSlider, setActiveSlider] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const chatSectionRef = useRef(null);
  const analyzerRef = useRef(null);
  const pageViewTracked = useRef(false);

  useEffect(() => {
    if (!pageViewTracked.current) {
      pageViewTracked.current = true;
      trackEvent("page_view", "v2", "landing");
    }
  }, []);

  const scrollToAnalyzer = useCallback(() => {
    trackEvent("cta_click", "v2", "hero", { button: "קבל הדגמה חינם - הדר" });
    if (analyzerRef.current) {
      analyzerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const scrollToChat = useCallback(() => {
    trackEvent("cta_click", "v2", "results", { button: "אני רוצה לראות את זה בפועל" });
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setShowForm(true);
    }
  }, []);

  const r = useMemo(() => {
    // Missed customers: those who don't get a fast reply leave (industry avg ~35% of non-answered)
    const nonAnsweredRate = 1 - responseRate / 100;
    const leaveRate = nonAnsweredRate * 0.35; // 35% of non-answered actually leave
    const missedCust = Math.round(customers * leaveRate);
    const monthMissed = missedCust * dealValue;

    // With Bildo: recover ~55% of missed customers (realistic benchmark)
    const recoveredCust = Math.round(missedCust * 0.55);
    const monthGain = recoveredCust * dealValue;

    // Real API cost: ~0.05 USD per message ≈ ₪0.19, but billing is per conversation (~₪0.4)
    // Approx: (messages / 5) * 0.4 NIS per conversation
    const monthApiCost = Math.max(Math.round((messages / 5) * 0.4), 200); // min ₪200/month
    const platformFee = 500; // typical monthly platform fee
    const totalMonthlyCost = monthApiCost + platformFee;

    // ROI: how much extra revenue vs total cost
    const roiMonths = totalMonthlyCost > 0 ? (monthGain / totalMonthlyCost).toFixed(1) : "0";

    return {
      monthMissed,
      annualMissed: monthMissed * 12,
      monthGain,
      annualGain: monthGain * 12,
      missedCust,
      recoveredCust,
      totalMonthlyCost,
      roiMonths: parseFloat(roiMonths),
      size: getSize(customers),
    };
  }, [messages, customers, dealValue, responseRate]);

  const handleCTA = useCallback((source = "unknown") => {
    trackEvent("form_open", "v2", "contact_form", { trigger: source });
    setShowForm(true);
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F8F6FF", fontFamily: "'Heebo', sans-serif", color: "#2d1b69" }}>

      {/* HEADER */}
      <header style={{ background: "white", borderBottom: "1px solid #ede8ff", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 16px rgba(90,63,168,0.07)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="בילדו" style={{ height: 40 }} />
          <button onClick={() => handleCTA("header")} className="cta-btn" style={{ padding: "9px 20px", fontSize: 13 }}>
            קבע פגישה ללא עלות <ChevronLeft style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle" }} />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #5a3fa8 0%, #7c5cbf 50%, #9b7fd4 100%)", padding: "52px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "5px 16px", marginBottom: 22, fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
              ✨ מחשבון חינמי לעסקים · ספק רשמי Meta
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "clamp(26px, 5vw, 50px)", color: "white", lineHeight: 1.2, marginBottom: 14 }}>
              כמה לקוחות פשוט{" "}
              <span style={{ color: "#ffd166", fontStyle: "italic" }}>עוזבים בלי לקנות?</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>
              כשלקוח שולח הודעה ולא מקבל מענה מהיר — הוא הולך למתחרה.{" "}
              <strong style={{ color: "white" }}>בוא נראה בדיוק כמה זה שווה לך.</strong>
            </p>
            <button onClick={() => { trackEvent("cta_click", "v2", "hero", { button: "חשב את הפוטנציאל שלי" }); scrollToAnalyzer(); }} className="cta-btn cta-btn-white" style={{ padding: "13px 32px", fontSize: 15 }}>
              חשב את הפוטנציאל שלי 🚀
            </button>
          </motion.div>
        </div>
      </section>

      {/* MAIN */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* ANALYZER */}
        <FadeIn delay={0}>
          <div ref={analyzerRef} className="soft-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Sparkles style={{ width: 16, height: 16, color: "#7c5cbf" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#7c5cbf" }}>מלא אוטומטית לפי האתר שלך</span>
            </div>
            <WebsiteAnalyzer
              onAnalyzed={({ messages: m, customers: c, dealValue: d }) => {
                setMessages(m); setCustomers(c); setDealValue(d);
                trackEvent("website_scanned", "v2", "analyzer");
              }}
              onSiteData={setSiteData}
              onScanningChange={(scanning) => {
                setIsScanning(scanning);
                if (scanning) trackEvent("scan_started", "v2", "analyzer");
              }}
            />
          </div>
        </FadeIn>

        {/* CALC GRID — stacks on mobile */}
        <div className="calc-grid">

          {/* SLIDERS */}
          <FadeIn delay={0.06}>
            <div className="soft-card" style={{ padding: "24px 22px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2d1b69", marginBottom: 4 }}>הגדר את הנתונים שלך</h2>
              <p style={{ fontSize: 13, color: "#8b7ab8", marginBottom: 22 }}>הזז את הסליידרים לפי המצב האמיתי שלך</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                <SliderRow
                  id="messages"
                  icon={<MessageCircle style={{ width: 14, height: 14 }} />}
                  label="הודעות וואטסאפ בחודש"
                  value={messages} min={100} max={20000} step={100}
                  onChange={setMessages}
                  onDragStart={() => setActiveSlider("messages")}
                  onDragEnd={() => setActiveSlider(null)}
                  isActive={activeSlider === "messages"}
                  display={messages.toLocaleString("he-IL")}
                  hint={messages < 1000 ? "נמוך" : messages < 10000 ? "ממוצע" : "גבוה 🔥"}
                  hintOk={messages >= 10000}
                />
                <div style={{ height: 1, background: "#f0ecff" }} />
                <SliderRow
                  id="customers"
                  icon={<Users style={{ width: 14, height: 14 }} />}
                  label="לקוחות פוטנציאליים בחודש"
                  value={customers} min={1} max={1000} step={1}
                  onChange={setCustomers}
                  onDragStart={() => setActiveSlider("customers")}
                  onDragEnd={() => setActiveSlider(null)}
                  isActive={activeSlider === "customers"}
                  display={`${customers.toLocaleString("he-IL")} ${r.size.emoji}`}
                  hint={r.size.label}
                  hintOk={customers >= 200}
                />
                <div style={{ height: 1, background: "#f0ecff" }} />
                <SliderRow
                  id="dealValue"
                  icon={<span style={{ fontSize: 13, color: "#7c5cbf" }}>₪</span>}
                  label="ערך ממוצע לעסקה / לקוח"
                  value={dealValue} min={10} max={50000} step={10}
                  onChange={setDealValue}
                  onDragStart={() => setActiveSlider("dealValue")}
                  onDragEnd={() => setActiveSlider(null)}
                  isActive={activeSlider === "dealValue"}
                  display={`₪${dealValue.toLocaleString("he-IL")}`}
                  hint={dealValue < 500 ? "נמוך" : dealValue < 5000 ? "בינוני" : "גבוה 💰"}
                  hintOk={dealValue >= 1000}
                />
                <div style={{ height: 1, background: "#f0ecff" }} />
                <SliderRow
                  id="responseRate"
                  icon={<Zap style={{ width: 14, height: 14 }} />}
                  label="% פניות שמקבלות מענה תוך שעה"
                  value={responseRate} min={5} max={95} step={5}
                  onChange={setResponseRate}
                  onDragStart={() => setActiveSlider("responseRate")}
                  onDragEnd={() => setActiveSlider(null)}
                  isActive={activeSlider === "responseRate"}
                  display={`${responseRate}%`}
                  hint={getResponseLabel(responseRate).label}
                  hintColor={getResponseLabel(responseRate).color}
                  subHint="ממוצע בשוק: 35–50%"
                />
              </div>

              {/* Mini insight box */}
              <div style={{ marginTop: 22, padding: "14px 16px", background: "#f3f0ff", borderRadius: 12, border: "1px solid #e0d9f5" }}>
                <div style={{ fontSize: 12, color: "#7c5cbf", fontWeight: 700, marginBottom: 5 }}>💡 מה המספרים אומרים?</div>
                <div style={{ fontSize: 13, color: "#2d1b69", lineHeight: 1.65 }}>
                  כרגע בערך <strong style={{ color: "#d44" }}>{r.missedCust} לקוחות בחודש</strong> לא מקבלים מענה מהיר ועוזבים.
                  {" "}עם בילדו אפשר לשמור בחזרה על <strong style={{ color: "#2a7d55" }}>~{r.recoveredCust} מהם</strong> אוטומטית.
                </div>
              </div>
            </div>
          </FadeIn>

          {/* RESULTS */}
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Missed revenue */}
              <div className="soft-card result-card-red">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>😔</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2d1b69" }}>הכנסה שאתה מפספס כרגע</div>
                    <div style={{ fontSize: 11, color: "#c47a7a" }}>לא הפסד — כסף שיכול להיות שלך</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <ResultNumber label="בחודש" value={fmt(r.monthMissed)} color="#cc3333" bg="#fff5f5" />
                  <ResultNumber label="בשנה" value={fmt(r.annualMissed)} color="#cc3333" bg="#fff5f5" small />
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "#c47a7a", background: "#fff5f5", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5 }}>
                  🤷 {r.missedCust} לקוחות בחודש פשוט לא מקבלים מענה מהיר ועוזבים
                </div>
              </div>

              {/* Potential gain */}
              <div className="soft-card result-card-green">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2d1b69" }}>הפוטנציאל שלך עם בילדו</div>
                    <div style={{ fontSize: 11, color: "#5a9b7a" }}>על בסיס שחזור ~55% מהלקוחות שנשרו</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <ResultNumber label="בחודש" value={`+${fmt(r.monthGain)}`} color="#1a7a44" bg="#f0faf5" />
                  <ResultNumber label="בשנה" value={`+${fmt(r.annualGain)}`} color="#1a7a44" bg="#f0faf5" small />
                </div>
              </div>

              {/* ROI — realistic */}
              <div style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>📊 כמה מרוויחים ביחס לעלות השירות</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: "#ffd166", lineHeight: 1, fontStyle: "italic" }}>
                      {r.roiMonths}x
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>תשואה חודשית</div>
                  </div>
                  <div style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", height: 50 }} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>עלות שירות משוערת</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{fmt(r.totalMonthlyCost)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>/חודש</span></div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  * כולל עלות API + דמי פלטפורמה. החישוב מבוסס על נתוני ממוצע שוק.
                </div>
              </div>

              <button onClick={() => { trackEvent("cta_click", "v2", "results", { button: "ראה בפועל" }); scrollToChat(); }} className="cta-btn" style={{ width: "100%", padding: "15px", fontSize: 14 }}>
                אני רוצה לראות את זה בפועל 🚀
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "#8b7ab8" }}>ללא התחייבות · מענה תוך שעות</p>
            </div>
          </FadeIn>
        </div>

        {/* DEMO CHAT */}
        <FadeIn delay={0.05}>
          <div ref={chatSectionRef} style={{ marginTop: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#7c5cbf", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>✦ הדגמה חיה</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2d1b69", marginBottom: 6 }}>כך הבוט מדבר עם הלקוחות שלך</h3>
              <p style={{ fontSize: 13, color: "#8b7ab8", margin: 0 }}>הכנס כתובת אתר למעלה — הבוט יתאים את עצמו לעסק שלך אוטומטית</p>
            </div>
            <DemoChat siteData={siteData} isScanning={isScanning} onOpenCTA={handleCTA} />
          </div>
        </FadeIn>

        {/* TESTIMONIALS */}
        <FadeIn delay={0.05}>
          <Testimonials />
        </FadeIn>

        {/* TRUST */}
        <FadeIn delay={0.05}>
          <div style={{ marginTop: 28 }}>
            <TrustBar />
          </div>
        </FadeIn>
      </main>

      {/* FOOTER CTA */}
      <section style={{ background: "linear-gradient(135deg, #5a3fa8 0%, #7c5cbf 100%)", padding: "52px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>💜</div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(20px, 4vw, 34px)", color: "white", marginBottom: 12, lineHeight: 1.3 }}>
            הלקוחות שלך כבר שולחים הודעות.<br />
            <span style={{ color: "#ffd166" }}>השאלה היא מי עונה להם.</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 26, lineHeight: 1.7 }}>
            קבל הדגמה חינמית ב-15 דקות ותראה בדיוק<br />
            כמה עסקאות אפשר להוסיף לעסק שלך עכשיו.
          </p>
          <button onClick={() => handleCTA("footer")} className="cta-btn cta-btn-white" style={{ padding: "15px 36px", fontSize: 15 }}>
            קבל הדגמה חינם עכשיו →
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 14 }}>ללא כרטיס אשראי · ללא התחייבות</p>
        </div>
      </section>

      <footer style={{ background: "white", borderTop: "1px solid #ede8ff", padding: "14px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#8b7ab8", marginBottom: 6 }}>© 2026 בילדו · שותף רשמי Meta · WhatsApp Business API</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <a href="/about" style={{ fontSize: 11, color: "#7c5cbf", textDecoration: "none", fontWeight: 600 }}>אודות</a>
          <a href="/contact" style={{ fontSize: 11, color: "#7c5cbf", textDecoration: "none", fontWeight: 600 }}>צור קשר</a>
        </div>
      </footer>

      <ContactFormV2
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthMissed, potentialGain: r.monthGain }}
        source="v2"
      />

      <style>{`
        .soft-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #ede8ff;
          box-shadow: 0 4px 24px rgba(90,63,168,0.06);
        }
        .result-card-red { padding: 20px; border-top: 3px solid #ffb3b3; }
        .result-card-green { padding: 20px; border-top: 3px solid #a8e6cf; }
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
        .cta-btn-white { background: white; color: #5a3fa8; box-shadow: 0 4px 18px rgba(0,0,0,0.12); }
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
          width: 26px; height: 26px;
          border-radius: 50%;
          background: white;
          border: 3px solid #7c5cbf;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(90,63,168,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .slider-purple::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 16px rgba(90,63,168,0.4);
        }
        .slider-purple::-moz-range-thumb {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: white;
          border: 3px solid #7c5cbf;
          cursor: pointer;
        }
        /* GRID */
        .calc-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
          align-items: start;
        }
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        /* MOBILE */
        @media (max-width: 700px) {
          .calc-grid { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Only animates when this specific slider is active
function SliderRow({ id, icon, label, value, min, max, step, onChange, onDragStart, onDragEnd, isActive, display, hint, hintOk, hintColor, subHint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
          <span style={{ color: "#7c5cbf", marginTop: 2 }}>{icon}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2d1b69" }}>{label}</span>
            {subHint && <div style={{ fontSize: 10, color: "#8b7ab8", marginTop: 1 }}>{subHint}</div>}
          </div>
        </div>
        <div style={{ textAlign: "left", flexShrink: 0, marginRight: 8 }}>
          {isActive ? (
            <motion.span
              key={display}
              initial={{ scale: 1.15, color: "#5a3fa8" }}
              animate={{ scale: 1, color: "#5a3fa8" }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 20, fontWeight: 800, display: "block", lineHeight: 1 }}
            >
              {display}
            </motion.span>
          ) : (
            <span style={{ fontSize: 20, fontWeight: 800, color: "#5a3fa8", display: "block", lineHeight: 1 }}>{display}</span>
          )}
          {hint && (
            <span style={{ fontSize: 10, color: hintColor || (hintOk ? "#2a7d55" : "#9b7fd4"), fontWeight: 600, display: "block", textAlign: "left", marginTop: 2 }}>
              {hint}
            </span>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseDown={onDragStart} onTouchStart={onDragStart}
        onMouseUp={onDragEnd} onTouchEnd={onDragEnd}
        className="slider-purple"
        style={{ background: `linear-gradient(to left, #7c5cbf ${pct}%, #ede8ff ${pct}%)` }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#c4b8e0", marginTop: 4 }}>
        <span>{min.toLocaleString("he-IL")}</span>
        <span>{max.toLocaleString("he-IL")}</span>
      </div>
    </div>
  );
}

function ResultNumber({ label, value, color, bg, small }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: small ? 18 : 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
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