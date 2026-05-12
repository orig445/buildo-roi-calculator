import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle, Clock, CalendarCheck } from "lucide-react";

export default function ContactForm({ isOpen, onClose, calculatorData }) {
  const buildSlots = () => {
    const slots = [];
    const now = new Date();
    for (let d = 1; d <= 7; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      if (day.getDay() === 6) continue;
      for (let h = 9; h <= 17; h++) {
        const dt = new Date(day);
        dt.setHours(h, 0, 0, 0);
        slots.push(dt);
      }
    }
    return slots;
  };
  const slots = buildSlots();

  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", db_size: "" });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await Promise.all([
      base44.entities.Lead.create({
        ...form,
        monthly_messages: calculatorData.messages,
        monthly_customers: calculatorData.customers,
        avg_deal_value: calculatorData.dealValue,
        calculated_loss: calculatorData.monthlyLoss,
        calculated_gain: calculatorData.potentialGain,
        notes: form.db_size ? `מאגר לקוחות: ${form.db_size}` : undefined,
      }),
      base44.functions.invoke("createCalendarEvent", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        company: form.company,
        monthlyLoss: calculatorData.monthlyLoss,
        potentialGain: calculatorData.potentialGain,
        selectedDateTime: selectedSlot ? selectedSlot.toISOString() : null,
      }),
    ]);
    setLoading(false);
    setSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(26,18,8,0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25 }}
          style={{
            width: "100%", maxWidth: 400,
            background: "var(--cream)", border: "1px solid var(--gold)",
            borderRadius: 6, padding: "30px 26px",
            position: "relative", maxHeight: "90vh", overflowY: "auto"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, background: "none", border: "none", cursor: "pointer", color: "var(--ink-light)", padding: 4 }}>
            <X style={{ width: 15, height: 15 }} />
          </button>

          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircle style={{ width: 44, height: 44, color: "var(--gold)", margin: "0 auto 12px", display: "block" }} />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>פנייתך התקבלה!</h3>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7 }}>נחזור אליך תוך שעות ספורות עם הדגמה מותאמת</p>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 16, fontSize: 11, background: "var(--gold-pale)",
                border: "1px solid var(--gold-border)", borderRadius: 4, padding: "8px 14px",
                color: "var(--ink-mid)", fontFamily: "'DM Sans', sans-serif"
              }}>
                <CalendarCheck style={{ width: 13, height: 13 }} />
                <span>אירוע נוסף ביומן Google שלך</span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.15em", display: "block", marginBottom: 5 }}>◆ הדגמה אישית</span>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>קבל הדגמה אישית</h3>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 13, color: "var(--ink-light)" }}>נראה לך בדיוק איך זה עובד בעסק שלך</p>
              </div>

              {/* Summary strip */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                background: "white", border: "1px solid var(--gold-border)",
                borderRadius: 4, padding: "10px 14px", marginBottom: 18
              }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 12, color: "var(--rust)", fontWeight: 700 }}>
                  הפסד: ₪{calculatorData.monthlyLoss?.toLocaleString("he-IL")}/חודש
                </span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 12, color: "var(--forest-mid)", fontWeight: 700 }}>
                  פוטנציאל: +₪{calculatorData.potentialGain?.toLocaleString("he-IL")}/חודש
                </span>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "name", label: "שם מלא *", placeholder: "ישראל ישראלי", type: "text", required: true },
                  { key: "phone", label: "טלפון *", placeholder: "050-1234567", type: "tel", required: true },
                  { key: "email", label: "אימייל", placeholder: "you@company.co.il", type: "email" },
                  { key: "company", label: "שם העסק", placeholder: "שם החברה", type: "text" },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "block", marginBottom: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
                    <input type={type} required={required} placeholder={placeholder} value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-v" />
                  </div>
                ))}

                <div>
                  <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "block", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>גודל מאגר לקוחות</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {["עד 1,000", "1,000–10,000", "10,000–50,000", "50,000–200,000", "200,000+", "לא יודע"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setForm({ ...form, db_size: opt })}
                        style={form.db_size === opt
                          ? { background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 3, padding: "7px 4px", fontSize: 10, cursor: "pointer", fontFamily: "'Heebo', sans-serif", transition: "all 0.2s" }
                          : { background: "white", color: "var(--ink-mid)", border: "1px solid var(--gold-border)", borderRadius: 3, padding: "7px 4px", fontSize: 10, cursor: "pointer", fontFamily: "'Heebo', sans-serif", transition: "all 0.2s" }
                        }>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <Clock style={{ width: 11, height: 11 }} /> בחר מועד להדגמה
                  </label>
                  <div style={{ maxHeight: 160, overflowY: "auto", borderRadius: 3, border: "1px solid var(--gold-border)" }}>
                    {slots.map((slot, i) => {
                      const isSelected = selectedSlot?.toISOString() === slot.toISOString();
                      const dayName = slot.toLocaleDateString("he-IL", { weekday: "short", month: "numeric", day: "numeric" });
                      const timeStr = slot.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <button key={i} type="button" onClick={() => setSelectedSlot(slot)}
                          style={isSelected
                            ? { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", fontSize: 11, cursor: "pointer", border: "none", borderBottom: "1px solid rgba(196,150,42,0.1)", background: "var(--forest)", color: "var(--gold-light)", fontWeight: 700, fontFamily: "'Heebo', sans-serif" }
                            : { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", fontSize: 11, cursor: "pointer", border: "none", borderBottom: "1px solid rgba(196,150,42,0.1)", background: "var(--cream-mid)", color: "var(--ink-mid)", fontFamily: "'Heebo', sans-serif" }
                          }>
                          <span>{dayName}</span>
                          <span>{timeStr}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!selectedSlot && <p style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 4, fontStyle: "italic" }}>לא חובה — ניצור קשר לתיאום</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-stamp" style={{ width: "100%", padding: "13px", fontSize: 11, marginTop: 4 }}>
                  {loading ? "שולח..." : "שלח ותזמן הדגמה ◆"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}