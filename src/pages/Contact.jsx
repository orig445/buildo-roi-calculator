export default function Contact() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F8F6FF", fontFamily: "'Heebo', sans-serif", color: "#2d1b69", padding: "60px 20px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, color: "#2d1b69" }}>צור קשר</h1>
        <p style={{ fontSize: 15, color: "#8b7ab8", marginBottom: 36, lineHeight: 1.7 }}>
          נשמח לשמוע ממך! צור קשר בכל אחת מהדרכים הבאות ונחזור אליך בהקדם.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <a href="mailto:hello@bildo.co.il" style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "white", border: "1.5px solid #ede8ff", borderRadius: 14,
            padding: "18px 22px", textDecoration: "none", color: "#2d1b69",
            boxShadow: "0 2px 12px rgba(90,63,168,0.07)", transition: "box-shadow 0.2s",
          }}>
            <span style={{ fontSize: 22 }}>✉️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>אימייל</div>
              <div style={{ fontSize: 14, color: "#5a3fa8", fontWeight: 600 }}>hello@bildo.co.il</div>
            </div>
          </a>

          <a href="https://wa.me/972500000000" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "white", border: "1.5px solid #ede8ff", borderRadius: 14,
            padding: "18px 22px", textDecoration: "none", color: "#2d1b69",
            boxShadow: "0 2px 12px rgba(90,63,168,0.07)",
          }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>WhatsApp</div>
              <div style={{ fontSize: 14, color: "#5a3fa8", fontWeight: 600 }}>שלח לנו הודעה ישירה</div>
            </div>
          </a>

          <a href="https://www.linkedin.com/company/bildo" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "white", border: "1.5px solid #ede8ff", borderRadius: 14,
            padding: "18px 22px", textDecoration: "none", color: "#2d1b69",
            boxShadow: "0 2px 12px rgba(90,63,168,0.07)",
          }}>
            <span style={{ fontSize: 22 }}>💼</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>LinkedIn</div>
              <div style={{ fontSize: 14, color: "#5a3fa8", fontWeight: 600 }}>linkedin.com/company/bildo</div>
            </div>
          </a>
        </div>

        <div style={{ marginTop: 40 }}>
          <a href="/" style={{ color: "#5a3fa8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← חזרה לדף הבית</a>
        </div>
      </div>
    </div>
  );
}