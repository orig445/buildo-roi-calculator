import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ChevronDown, ChevronUp, Zap, TrendingUp, MessageSquare, Clock, Users, Star } from "lucide-react";

const CHAPTERS = [
  {
    icon: <MessageSquare size={20} />,
    title: "הגדרת תבניות הודעה אפקטיביות",
    color: "#7c3aed",
    steps: [
      "השתמשו בשם הלקוח בפתיחה — הודעות מותאמות אישית מקבלות שיעור פתיחה גבוה ב-26%",
      "שמרו על הודעות קצרות: עד 160 תווים לגוף הראשי",
      "הוסיפו CTA ברור אחד בכל הודעה — 'לחצו כאן', 'התקשרו עכשיו' או 'קבלו מחיר'",
      "הימנעו ממילים כמו 'חינם', 'מבצע' בהתחלה — WhatsApp מסנן אותן",
      "הוסיפו emoji אחד-שניים להגדלת ה-engagement — אך לא יותר",
    ],
  },
  {
    icon: <Clock size={20} />,
    title: "תזמון אופטימלי לשליחת הודעות",
    color: "#059669",
    steps: [
      "שלחו הודעות בימי א'-ה' בין 09:00–11:00 או 18:00–20:00",
      "הימנעו משישי אחר הצהריים ושבת — שיעורי פתיחה נמוכים ב-40%",
      "בחרו טריגרים מבוססי פעולה: לאחר ביקור בדף מוצר, אחרי טופס, 24 שעות לאחר יצירת קשר",
      "הגדירו follow-up אוטומטי אחרי 48 שעות אם אין תגובה",
      "שמרו על תדירות של לא יותר מ-2 הודעות שיווקיות בשבוע",
    ],
  },
  {
    icon: <Users size={20} />,
    title: "ניהול רשימות קהל ופילוח",
    color: "#dc6b19",
    steps: [
      "חלקו את הלקוחות ל-3 קבוצות: לידים חמים, לקוחות פעילים, לקוחות ישנים",
      "הגדירו תזרים שונה לכל קבוצה — אל תשלחו אותו מסר לכולם",
      "נקו את הרשימה אחת ל-3 חודשים — הסירו מספרים שלא נענו ב-4+ הודעות",
      "השתמשו בתגיות (labels) בממשק ה-API לסיווג לפי שלב במכירה",
      "הפנו לקוחות מרוצים לוואטסאפ ולא לדוא\"ל — שיעור תגובה גבוה ב-5X",
    ],
  },
  {
    icon: <TrendingUp size={20} />,
    title: "מדידת ביצועים ואופטימיזציה",
    color: "#7c3aed",
    steps: [
      "עקבו אחר 3 מדדים קריטיים: Open Rate, Reply Rate, Conversion Rate",
      "Open Rate מעל 60% — טוב. מעל 80% — מצוין. מתחת ל-40% — שנו את השורת הנושא",
      "בצעו A/B test על זמן שליחה, אורך הודעה ו-CTA — שנו משתנה אחד בכל פעם",
      "מדדו את עלות ה-CAC (עלות רכישת לקוח) ביחס להכנסה ממנו",
      "סיכמו נתונים שבועית ועדכנו את התבניות בהתאם לביצועים",
    ],
  },
  {
    icon: <Zap size={20} />,
    title: "אוטומציות חכמות לחיסכון בזמן",
    color: "#059669",
    steps: [
      "הגדירו תגובה אוטומטית מיידית לכל הודעה נכנסת — אפילו 'קיבלנו, נחזור תוך שעה'",
      "בנו chatbot פשוט לשאלות נפוצות: שעות פתיחה, מחיר, מיקום",
      "חברו את ה-API ל-CRM שלכם לעדכון אוטומטי של סטטוס לקוח",
      "הגדירו תזכורות אוטומטיות לפגישות ולתשלומים — מפחית no-show ב-30%",
      "צרו תזרים onboarding: 5 הודעות בשבוע הראשון לכל לקוח חדש",
    ],
  },
];

const TIPS = [
  { icon: "📊", title: "ROI ממוצע", value: "340%", desc: "תשואה ממוצעת על ה-API בשנה הראשונה" },
  { icon: "⚡", title: "זמן תגובה", value: "<2 דק'", desc: "זמן תגובה אוטומטי מומלץ" },
  { icon: "💬", title: "Open Rate", value: "95%", desc: "שיעור פתיחה ממוצע בוואטסאפ לעומת 22% במייל" },
  { icon: "🎯", title: "המרה", value: "×3", desc: "שיפור בהמרות עם תגובה תוך 5 דקות" },
];

function Chapter({ chapter, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: open ? "#faf9ff" : "#fff", border: "none", cursor: "pointer", textAlign: "right" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ color: chapter.color }}>{chapter.icon}</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{chapter.title}</span>
        </div>
        {open ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
      </button>
      {open && (
        <div style={{ padding: "4px 20px 20px", background: "#faf9ff" }}>
          {chapter.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < chapter.steps.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <CheckCircle size={15} style={{ color: chapter.color, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuccessGuide() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Heebo', sans-serif", color: "#000" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>Buildo</span>
        </Link>
        <Link to="/tools" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>← כל הכלים</Link>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 14 }}>
            <Star size={12} /> מדריך מקצועי
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 12px", lineHeight: 1.2 }}>מדריך הצלחה: WhatsApp Business API</h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            שיטות עבודה מומלצות ואסטרטגיות מוכחות למקסום רווחים עם WhatsApp Business API — מעסקים שכבר עשו את זה.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
          {TIPS.map((t, i) => (
            <div key={i} style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#7c3aed", marginBottom: 4 }}>{t.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Chapters */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 16 }}>פרקי המדריך</h2>
        {CHAPTERS.map((chapter, i) => (
          <Chapter key={i} chapter={chapter} index={i} />
        ))}

        {/* CTA */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg,#1a0a2e,#3b1f8c)", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 10px" }}>מוכנים להתחיל?</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.7 }}>
            תנו ל-Buildo לחבר את העסק שלכם ל-WhatsApp API ולהפעיל את כל האוטומציות האלה — תוך 48 שעות.
          </p>
          <a href="https://buildoai.com/worker-onboarding" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#7c3aed", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 800, fontFamily: "'Heebo', sans-serif" }}>
            התחילו בחינם →
          </a>
        </div>
      </div>
    </div>
  );
}