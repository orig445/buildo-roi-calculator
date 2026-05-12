import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Clock, CheckCircle, CalendarCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function ContactFormV2({ isOpen, onClose, calculatorData, source = "home" }) {
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
    trackEvent("form_submit", "v2", "contact_form", { has_slot: !!selectedSlot });
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
        source,
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
    trackEvent("form_success", "v2", "contact_form");
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #ede8ff", borderRadius: 10,
    background: "#f8f6ff", color: "#2d1b69",
    fontFamily: "'Heebo', sans-serif", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(45,27,105,0.5)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", damping: 25 }}
          style={{
            width: "100%", maxWidth: 420,
            background: "white", border: "1px solid #ede8ff",
            borderRadius: 20, padding: "28px 26px",
            position: "relative", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(90,63,168,0.2)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer", color: "#8b7ab8", padding: 4, borderRadius: 8 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>

          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle style={{ width: 52, height: 52, color: "#7c5cbf", margin: "0 auto 14px", display: "block" }} />
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#2d1b69", marginBottom: 8 }}>מעולה! פנייתך התקבלה 🎉</h3>
              <p style={{ fontSize: 14, color: "#8b7ab8", lineHeight: 1.7 }}>נחזור אליך תוך שעות ספורות עם הדגמה מותאמת</p>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 14, fontSize: 12, background: "#f3f0ff",
                borderRadius: 10, padding: "8px 14px", color: "#5a3fa8", fontWeight: 600
              }}>
                <CalendarCheck style={{ width: 14, height: 14 }} />
                <span>אירוע נוסף ביומן Google שלך</span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#7c5cbf", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>✨ הדגמה חינמית</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2d1b69", marginBottom: 4 }}>נראה לך איך זה עובד</h3>
                <p style={{ fontSize: 13, color: "#8b7ab8" }}>15 דקות שיכולות לשנות את העסק שלך</p>
              </div>

              {/* Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", background: "#f8f6ff", border: "1px solid #ede8ff", borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
                <span style={{ fontSize: 12, color: "#d44", fontWeight: 700 }}>מפספס: ₪{calculatorData.monthlyLoss?.toLocaleString("he-IL")}/חודש</span>
                <span style={{ fontSize: 12, color: "#2a7d55", fontWeight: 700 }}>פוטנציאל: +₪{calculatorData.potentialGain?.toLocaleString("he-IL")}/חודש</span>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "name", label: "שם מלא *", placeholder: "ישראל ישראלי", type: "text", required: true },
                  { key: "phone", label: "טלפון *", placeholder: "050-1234567", type: "tel", required: true },
                  { key: "email", label: "אימייל", placeholder: "you@company.co.il", type: "email" },
                  { key: "company", label: "שם העסק", placeholder: "שם החברה", type: "text" },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#8b7ab8", display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
                    <input type={type} required={required} placeholder={placeholder} value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = "#7c5cbf"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,191,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#ede8ff"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 11, color: "#8b7ab8", display: "block", marginBottom: 6, fontWeight: 600 }}>גודל מאגר לקוחות</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {["עד 1,000", "1,000–10,000", "10,000–50,000", "50,000–200,000", "200,000+", "לא יודע"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setForm({ ...form, db_size: opt })}
                        style={{
                          padding: "7px 4px", borderRadius: 8, fontSize: 10, cursor: "pointer",
                          fontFamily: "'Heebo', sans-serif", fontWeight: 600, transition: "all 0.15s",
                          background: form.db_size === opt ? "#5a3fa8" : "#f8f6ff",
                          color: form.db_size === opt ? "white" : "#2d1b69",
                          border: form.db_size === opt ? "1.5px solid #5a3fa8" : "1.5px solid #ede8ff",
                        }}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#8b7ab8", display: "flex", alignItems: "center", gap: 4, marginBottom: 6, fontWeight: 600 }}>
                    <Clock style={{ width: 12, height: 12 }} /> בחר מועד להדגמה
                  </label>
                  <div style={{ maxHeight: 160, overflowY: "auto", borderRadius: 10, border: "1.5px solid #ede8ff", background: "#f8f6ff" }}>
                    {slots.map((slot, i) => {
                      const isSelected = selectedSlot?.toISOString() === slot.toISOString();
                      return (
                        <button key={i} type="button" onClick={() => setSelectedSlot(slot)}
                          style={{
                            width: "100%", display: "flex", justifyContent: "space-between",
                            padding: "8px 12px", fontSize: 12, cursor: "pointer",
                            border: "none", borderBottom: "1px solid #ede8ff",
                            background: isSelected ? "#5a3fa8" : "transparent",
                            color: isSelected ? "white" : "#2d1b69",
                            fontFamily: "'Heebo', sans-serif", fontWeight: isSelected ? 700 : 400,
                          }}>
                          <span>{slot.toLocaleDateString("he-IL", { weekday: "short", month: "numeric", day: "numeric" })}</span>
                          <span>{slot.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!selectedSlot && <p style={{ fontSize: 10, color: "#8b7ab8", marginTop: 4 }}>לא חובה — ניצור קשר לתיאום</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "13px", fontSize: 14, fontWeight: 800,
                    background: loading ? "#c4b5e8" : "#5a3fa8", color: "white",
                    border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Heebo', sans-serif", marginTop: 4,
                    boxShadow: "0 4px 18px rgba(90,63,168,0.3)", transition: "all 0.2s",
                  }}>
                  {loading ? "שולח..." : "שלח ותזמן הדגמה ✨"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}