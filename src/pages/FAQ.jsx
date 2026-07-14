import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MessageSquare, CreditCard, Settings, HelpCircle } from "lucide-react";

const CATEGORIES = [
  {
    id: "general",
    icon: <MessageSquare size={18} />,
    label: "כללי — WhatsApp API",
    color: "#7c3aed",
    faqs: [
      { q: "מה ההבדל בין WhatsApp Business לבין WhatsApp Business API?", a: "WhatsApp Business היא אפליקציה בחינם לעסקים קטנים — ניתנת לשימוש ממכשיר אחד, עם אפשרויות אוטומציה מוגבלות. WhatsApp Business API היא פלטפורמה ליזמים ועסקים שרוצים לשלוח הודעות מאות ואלפי לקוחות, לנהל chatbot, ולחבר מערכות CRM — הכל מבלי לגעת בטלפון." },
      { q: "האם מותר לשלוח הודעות שיווקיות דרך WhatsApp API?", a: "כן — בתנאי שהלקוח הסכים לקבל הודעות (opt-in). Meta מאפשרת שליחת הודעות שיווקיות, עסקאות, ועדכונים לאחר שהלקוח הביע הסכמה. Buildo מסייעת בהגדרת מנגנון ה-opt-in הנכון לעסק שלכם." },
      { q: "כמה זמן לוקח להפעיל את ה-API?", a: "עם Buildo — 48-72 שעות. זה כולל: אישור חשבון Meta Business, חיבור ה-API, הגדרת תבניות הודעה ואישורן, וחיבור לכלים הקיימים שלכם. ללא עזרה מקצועית — תהליך האישור לבד יכול לקחת שבועות." },
      { q: "האם ה-API עובד עם CRM כמו HubSpot, Salesforce, Zoho?", a: "כן. Buildo מחברת את WhatsApp API לכל CRM מוביל. כל שיחה, ליד ותגובה מסונכרנים אוטומטית. אנחנו תומכים גם ב-webhooks לחיבור עם כל מערכת אחרת." },
    ],
  },
  {
    id: "pricing",
    icon: <CreditCard size={18} />,
    label: "תמחור ועלויות",
    color: "#059669",
    faqs: [
      { q: "כמה עולה WhatsApp Business API?", a: "המחיר מורכב משני חלקים: (1) שיחות — Meta גובה לפי שיחה ולפי מדינה. ישראל עומדת על כ-$0.05 לשיחה שיווקית. (2) דמי שירות Buildo — תלוי בחבילה שתבחרו. 1,000 השיחות הראשונות בחודש חינמיות לחלוטין ב-Meta." },
      { q: "יש עלות חד-פעמית להקמה?", a: "עם Buildo אין עלות הקמה. אתם משלמים רק לפי שימוש. הגדרת הח§שבון, תבניות ההודעות, חיבור ה-CRM וההדרכה — כלולים בחבילה." },
      { q: "מה קורה אם אגיע לגבול ה-1,000 שיחות החינמיות?", a: "Meta מחייבת אוטומטית לפי שיחה מעבר לגבול החינמי. ב-Buildo תקבלו התראה כשאתם מתקרבים לגבול, ותוכלו לנהל תקציב חודשי מקסימלי." },
      { q: "האם יש חוזה מינימום?", a: "לא. Buildo עובדת בחיוב חודשי ללא התחייבות. ניתן לבטל בכל עת. אנחנו מאמינים שאם השירות טוב — אתם תישארו." },
    ],
  },
  {
    id: "technical",
    icon: <Settings size={18} />,
    label: "שאלות טכניות",
    color: "#dc6b19",
    faqs: [
      { q: "צריך לדעת לתכנת כדי להשתמש ב-API?", a: "לא — עם Buildo. אנחנו מנהלים את כל הצד הטכני: API, webhooks, chatbot, integrations. אתם מגדירים מה אתם רוצים — אנחנו מוציאים לפועל. יש גם ממשק ניהול נוח ללא קוד." },
      { q: "מה זה תבנית הודעה (Message Template) ולמה צריך אישור?", a: "כל הודעה יוצאת ב-WhatsApp API שאתם שולחים בשלב ראשוני חייבת להיות תבנית מאושרת מראש על ידי Meta. זה מונע ספאם ומבטיח איכות. תבנית טיפוסית נראית כך: 'שלום {{שם}}, תזכורת לפגישה שלך ב-{{תאריך}}.' אישור לוקח בד\"כ 2-24 שעות." },
      { q: "מה קורה אם לקוח שלח לי הודעה ראשון?", a: "אם לקוח שלח הודעה ראשון, נפתח חלון שירות של 24 שעות שבו תוכלו לשלוח כל הודעה בחינם ללא צורך בתבנית. זה הזמן האידיאלי לסגור עסקה או לענות לשאלות." },
      { q: "כמה הודעות ניתן לשלוח בחודש?", a: "Meta מאפשרת להתחיל מ-1,000 שיחות ייחודיות לחודש. כשהחשבון מגיע לרמת איכות גבוהה, ניתן לבקש העלאה ל-10,000, 100,000 ויותר. Buildo מסייעת בניהול רמת האיכות ובבקשות להעלאת מגבלות." },
      { q: "האם הנתונים שלי מאובטחים?", a: "כן. כל ההודעות מוצפנות end-to-end. Buildo לא שומרת תוכן הודעות. הנתונים נשמרים בשרתי Meta בלבד, בהתאם לתנאי השירות שלהם ול-GDPR." },
    ],
  },
  {
    id: "support",
    icon: <HelpCircle size={18} />,
    label: "תמיכה ואחריות",
    color: "#0284c7",
    faqs: [
      { q: "מה רמת התמיכה שמקבלים?", a: "תמיכה בעברית ב-WhatsApp, מייל וטלפון. זמן תגובה: עד שעה בשעות עסקים. כולל: עזרה בהגדרת תבניות, ניפוי שגיאות, ייעוץ אסטרטגי." },
      { q: "מה קורה אם Meta חוסמת את חשבוני?", a: "Buildo פועלת לפי כל הנחיות Meta ועוזרת ללקוחות לשמור על ציון איכות גבוה. במקרה נדיר של חסימה, אנחנו מלווים אתכם בתהליך הערעור מול Meta ועוזרים לשחזר את הפעילות." },
      { q: "האם מקבלים הדרכה?", a: "כן — כולל session הדרכה ראשוני של 60 דקות, גישה למדריך ההצלחה המלא שלנו, ותמיכה שוטפת. אנחנו לא 'מחברים ונעלמים'." },
    ],
  },
];

function FAQItem({ q, a, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "16px 0", background: "none", border: "none", cursor: "pointer", textAlign: "right" }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.5, flex: 1 }}>{q}</span>
        {open ? <ChevronUp size={16} color="#999" style={{ flexShrink: 0, marginTop: 2 }} /> : <ChevronDown size={16} color="#999" style={{ flexShrink: 0, marginTop: 2 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: 16 }}>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("general");
  const active = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Heebo', sans-serif", color: "#000" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>Buildo</span>
        </Link>
        <Link to="/case-studies" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>סיפורי לקוחות ←</Link>
      </header>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 16px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 14 }}>
            ❓ שאלות נפוצות
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 12px" }}>שאלות ותשובות</h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            כל מה שרציתם לדעת על WhatsApp Business API, תמחור, ועבודה עם Buildo.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, justifyContent: "center" }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 20, border: "1.5px solid",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === c.id ? c.color : "#fff",
                color: activeTab === c.id ? "#fff" : c.color,
                borderColor: c.color + (activeTab === c.id ? "" : "60"),
                transition: "all 0.2s",
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "8px 24px" }}>
          {active?.faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} color={active.color} />
          ))}
        </div>

        {/* Still have questions */}
        <div style={{ marginTop: 32, background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 16, padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>עדיין יש שאלות?</h3>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>הצוות שלנו זמין בוואטסאפ — תגובה תוך שעה בשעות עסקים.</p>
          <a
            href="https://wa.me/972000000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 800 }}
          >
            💬 שלחו לנו הודעה
          </a>
        </div>
      </div>
    </div>
  );
}