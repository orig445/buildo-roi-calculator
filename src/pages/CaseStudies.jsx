import { Link } from "react-router-dom";
import { Star, TrendingUp, ArrowRight } from "lucide-react";

const CASES = [
  {
    name: "מאפיית לחם הזהב",
    industry: "מזון ומשקאות",
    location: "תל אביב",
    avatar: "🥐",
    challenge: "המאפייה קיבלה עשרות שאלות ביום דרך וואטסאפ — שעות פתיחה, סוגי לחם, הזמנות מראש — ובעלת העסק ענתה לכולן ידנית בין אפייה לאפייה.",
    solution: "חיברנו chatbot שעונה אוטומטית לשאלות נפוצות, שולח תפריט יומי בבוקר ל-400 לקוחות רשומים, ומאפשר הזמנות מראש בלחיצת כפתור.",
    results: [
      { label: "הכנסות מהזמנות מראש", before: "₪8,000", after: "₪31,000", delta: "+287%" },
      { label: "זמן שהוקדש לתגובות", before: "3 שעות/יום", after: "20 דק'/יום", delta: "-89%" },
      { label: "לקוחות חוזרים", before: "38%", after: "71%", delta: "+33pp" },
    ],
    quote: "לא האמנתי שתוך 48 שעות הכל יהיה אוטומטי. עכשיו אני אופה במקום לענות להודעות.",
    author: "מירב כהן, בעלת המאפייה",
    timeframe: "3 חודשים",
    color: "#dc6b19",
  },
  {
    name: "מרפאת שיניים אור",
    industry: "בריאות ורפואה",
    location: "רחובות",
    avatar: "🦷",
    challenge: "הצוות הקדיש שעות לתיאום תורים טלפוניים. ביטולים ברגע האחרון גרמו להפסדי הכנסה של אלפי שקלים בחודש.",
    solution: "מערכת תזמון אוטומטית שמאשרת תורים, שולחת תזכורות 24 שעות מראש ב-WhatsApp, ומאפשרת ביטול/שינוי תור ישירות מהצ'אט.",
    results: [
      { label: "ביטולי תורים ברגע האחרון", before: "22%", after: "6%", delta: "-73%" },
      { label: "הכנסה חודשית נטו", before: "₪52,000", after: "₪79,000", delta: "+52%" },
      { label: "שביעות רצון מטופלים", before: "7.1/10", after: "9.4/10", delta: "+32%" },
    ],
    quote: "המטופלים מאהבים את זה. התזכורת מגיעה בדיוק בזמן ויש להם אפשרות לשנות תור בלי להתקשר.",
    author: "ד\"ר יוסי לוי, בעל המרפאה",
    timeframe: "6 שבועות",
    color: "#0284c7",
  },
  {
    name: "סוכנות נדל\"ן פריים",
    industry: "נדל\"ן",
    location: "הרצליה",
    avatar: "🏠",
    challenge: "הסוכנים מפספסים לידים חמים — לקוח שמילא טופס בלילה מקבל מענה רק למחרת בבוקר, ועד אז פנה למתחרים.",
    solution: "חיבור אוטומטי בין דפי נחיתה ל-WhatsApp: כל ליד חדש מקבל הודעה תוך 30 שניות עם פרטי נכסים רלוונטיים ופגישה מוצעת.",
    results: [
      { label: "שיעור המרה מליד לפגישה", before: "12%", after: "41%", delta: "+242%" },
      { label: "עמלות חודשיות", before: "₪38,000", after: "₪94,000", delta: "+147%" },
      { label: "זמן תגובה ממוצע לליד", before: "8 שעות", after: "30 שניות", delta: "-99.9%" },
    ],
    quote: "הלקוח שמקבל מענה תוך חצי דקה הוא לקוח שסוגר. זה שינה לנו את כל הגישה לשיווק.",
    author: "רועי אברהם, מנכ\"ל הסוכנות",
    timeframe: "2 חודשים",
    color: "#059669",
  },
  {
    name: "סטודיו לכושר פלוס",
    industry: "כושר ובריאות",
    location: "ירושלים",
    avatar: "💪",
    challenge: "עזיבת מנויים הייתה גבוהה — 35% בחצי שנה. לא היה מנגנון לזהות מנויים שהפסיקו להגיע לפני שביטלו.",
    solution: "מערכת שמזהה מנויים שלא הגיעו 2 שבועות, שולחת הודעה אישית עם הצעה מיוחדת לחזרה, ועוקבת אחר שיעורי החזרה.",
    results: [
      { label: "שיעור עזיבת מנויים", before: "35%", after: "14%", delta: "-60%" },
      { label: "הכנסה מחידוש מנויים", before: "₪15,000", after: "₪38,000", delta: "+153%" },
      { label: "מעורבות ממוצעת בחודש", before: "6 ביקורים", after: "10 ביקורים", delta: "+67%" },
    ],
    quote: "הלקוחות תמהים איך ידעתי שהם התרחקו. זה מרגיש אישי — כי זה אישי.",
    author: "שירה גרין, בעלת הסטודיו",
    timeframe: "4 חודשים",
    color: "#7c3aed",
  },
];

function ResultRow({ label, before, after, delta }) {
  const isPositive = delta.startsWith("+");
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 13, color: "#555" }}>{label}</span>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#999", textDecoration: "line-through" }}>{before}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{after}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: isPositive ? "#059669" : "#dc2626", background: isPositive ? "#f0fdf4" : "#fef2f2", borderRadius: 6, padding: "2px 8px" }}>{delta}</span>
      </div>
    </div>
  );
}

function CaseCard({ c }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
      {/* Header */}
      <div style={{ background: c.color + "10", borderBottom: `2px solid ${c.color}20`, padding: "20px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ fontSize: 40 }}>{c.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{c.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.color + "15", borderRadius: 20, padding: "2px 10px" }}>{c.industry}</span>
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>📍 {c.location} · תוצאות תוך {c.timeframe}</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Challenge / Solution */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#fff5f5", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>האתגר</div>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>{c.challenge}</p>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>הפתרון</div>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>{c.solution}</p>
          </div>
        </div>

        {/* Results */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#111", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={13} color={c.color} /> תוצאות מדידות
          </div>
          {c.results.map((r, i) => <ResultRow key={i} {...r} />)}
        </div>

        {/* Quote */}
        <div style={{ background: "#faf9ff", border: `1px solid ${c.color}30`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={c.color} color={c.color} />)}
          </div>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "#444", margin: "0 0 8px", lineHeight: 1.6 }}>"{c.quote}"</p>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>— {c.author}</div>
        </div>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Heebo', sans-serif", color: "#000" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>Buildo</span>
        </Link>
        <Link to="/faq" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>שאלות נפוצות ←</Link>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 16px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 14 }}>
            ✅ סיפורי הצלחה אמיתיים
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 12px" }}>לקוחות שהפכו את הכלכלה</h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            עסקים קטנים ובינוניים שהשתמשו ב-WhatsApp Business API עם Buildo — ומה קרה אחרי.
          </p>
        </div>

        {CASES.map((c, i) => <CaseCard key={i} c={c} />)}

        <div style={{ background: "linear-gradient(135deg,#1a0a2e,#3b1f8c)", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 10px" }}>הסיפור הבא יכול להיות שלכם</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: "0 0 22px" }}>התחילו בחינם — אנחנו מחברים, מגדירים ומפעילים הכל תוך 48 שעות.</p>
          <a href="https://buildoai.com/worker-onboarding" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#7c3aed", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 800 }}>
            רוצים תוצאות כאלה? <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}