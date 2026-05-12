import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Clock } from "lucide-react";

export default function ContactFormV2({ isOpen, onClose, calculatorData }) {
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
        style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(26,18,8,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", damping: 25 }}
          className="card-v corner-frame corner-inner"
          style={{ width: "100%", maxWidth: 420, background: "var(--cream)", borderRadius: 4, padding: "32px 28px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, background: "none", border: "none", cursor: "pointer", color: "var(--ink-light)", padding: 4 }}>
            <X style={{ width: 15, height: 15 }} />
          </button>

          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>◆</div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>פנייתך התקבלה!</h3>
              <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7 }}>נחזור אליך תוך שעות ספורות עם הדגמה מותאמת אישית</p>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 16, fontSize: 11, color: "var(--forest-mid)",
                background: "#F0F7F3", borderRadius: 3, padding: "8px 14px",
                border: "1px solid rgba(26,51,37,0.18)", fontFamily: "'Josefin Sans',sans-serif", letterSpacing: "0.08em"
              }}>
                ✓ אירוע נוסף ביומן Google שלך
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <span className="font-label" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>◆ הדגמה אישית</span>
                <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>קבל הדגמה אישית</h3>
                <p style={{ fontSize: 12, color: "var(--ink-light)", marginTop: 4 }}>נראה לך בדיוק איך זה עובד בעסק שלך</p>
              </div>

              {/* Summary */}
              <div style={{ background: "var(--cream-mid)", border: "1px solid var(--gold-border)", borderRadius: 3, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--rust)", fontWeight: 700 }}>הפסד: ₪{calculatorData.monthlyLoss?.toLocaleString("he-IL")}/חודש</span>
                <span style={{ fontSize: 11, color: "var(--forest-mid)", fontWeight: 700 }}>פוטנציאל: +₪{calculatorData.potentialGain?.toLocaleString("he-IL")}/חודש</span>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "name", label: "שם מלא *", placeholder: "ישראל ישראלי", type: "text", required: true },
                  { key: "phone", label: "טלפון *", placeholder: "050-1234567", type: "tel", required: true },
                  { key: "email", label: "אימייל", placeholder: "you@company.co.il", type: "email" },
                  { key: "company", label: "שם העסק", placeholder: "שם החברה", type: "text" },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "block", marginBottom: 5, letterSpacing: "0.12em" }}>{label}</label>
                    <input
                      type={type} required={required} placeholder={placeholder}
                      value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-v"
                    />
                  </div>
                ))}

                {/* DB Size */}
                <div>
                  <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "block", marginBottom: 6, letterSpacing: "0.12em" }}>גודל מאגר לקוחות</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {["עד 1,000", "1,000–10,000", "10,000–50,000", "50,000–200,000", "200,000+", "לא יודע"].map((opt) => (
                      <button
                        key={opt} type="button"
                        onClick={() => setForm({ ...form, db_size: opt })}
                        style={{
                          padding: "7px 4px", borderRadius: 2, fontSize: 10, cursor: "pointer", transition: "all 0.2s",
                          background: form.db_size === opt ? "var(--forest)" : "white",
                          color: form.db_size === opt ? "var(--gold-light)" : "var(--ink-mid)",
                          border: form.db_size === opt ? "1px solid var(--gold)" : "1px solid var(--gold-border)",
                          fontFamily: "'Heebo',sans-serif",
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                {/* Slot Picker */}
                <div>
                  <label className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6, letterSpacing: "0.12em" }}>
                    <Clock style={{ width: 12, height: 12 }} /> בחר מועד להדגמה
                  </label>
                  <div style={{ maxHeight: 160, overflowY: "auto", borderRadius: 3, border: "1px solid var(--gold-border)", background: "var(--cream-mid)" }}>
                    {slots.map((slot, i) => {
                      const isSelected = selectedSlot?.toISOString() === slot.toISOString();
                      const dayName = slot.toLocaleDateString("he-IL", { weekday: "short", month: "numeric", day: "numeric" });
                      const timeStr = slot.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <button
                          key={i} type="button"
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "8px 12px", fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                            background: isSelected ? "var(--forest)" : "transparent",
                            color: isSelected ? "var(--gold-light)" : "var(--ink-mid)",
                            border: "none", borderBottom: "1px solid rgba(196,150,42,0.1)",
                            fontFamily: "'Heebo',sans-serif", fontWeight: isSelected ? 700 : 400,
                          }}
                        >
                          <span>{dayName}</span>
                          <span>{timeStr}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!selectedSlot && <p style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 4, fontStyle: "italic" }}>לא חובה — ניצור קשר לתיאום</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-stamp" style={{ width: "100%", fontSize: 12, padding: "14px", marginTop: 4 }}>
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