export default function About() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F8F6FF", fontFamily: "'Heebo', sans-serif", color: "#2d1b69", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24, color: "#2d1b69" }}>אודות בילדו</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16, color: "#3d2e6b" }}>
          בילדו היא פלטפורמת אוטומציה לעסקים המבוססת על WhatsApp Business API הרשמי של Meta. אנחנו עוזרים לעסקים קטנים ובינוניים לא לפספס אף לקוח — בזכות בוטים חכמים שעונים אוטומטית, מתזמנים פגישות, ומנהלים תקשורת עם לקוחות בצורה טבעית ומקצועית.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16, color: "#3d2e6b" }}>
          המחשבון החינמי שלנו מאפשר לכל בעל עסק לגלות בדיוק כמה הכנסה הוא מפספס בכל חודש בגלל פניות שלא נענו בזמן. על ידי הזנת נתוני העסק — כמות ההודעות החודשית, מספר הלקוחות הפוטנציאליים וערך עסקה ממוצע — מקבלים תחזית מדויקת של הרווח הפוטנציאלי שניתן לממש עם מערכת אוטומציה חכמה.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16, color: "#3d2e6b" }}>
          הפלטפורמה מיועדת לבעלי עסקים, מנהלי שיווק, וצוותי מכירות שרוצים לשפר את זמני המענה שלהם ולהגדיל את אחוזי ההמרה — בלי להוסיף כוח אדם. בילדו מתאים במיוחד לקליניקות, מסעדות, סוכנויות נדל"ן, חנויות מקוונות, ומשרדי שירות.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16, color: "#3d2e6b" }}>
          אנחנו שותף רשמי של Meta ומספקים פתרון מלא: מהגדרת הבוט ועד הדרכה אישית ותמיכה שוטפת. כל לקוח מקבל הדגמה חינמית ומותאמת לתחום שלו לפני כל התחייבות.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#3d2e6b" }}>
          בילדו נוסדה מתוך אמונה שכל עסק — גדול כקטן — ראוי לכלים שעד היום היו שמורים רק לחברות הגדולות. אנחנו כאן כדי לשנות את זה.
        </p>

        <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
          <a href="/" style={{ color: "#5a3fa8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← חזרה לדף הבית</a>
          <a href="/contact" style={{ color: "#5a3fa8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>צור קשר →</a>
        </div>
      </div>
    </div>
  );
}