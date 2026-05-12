import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle } from "lucide-react";

export default function ContactForm({ isOpen, onClose, calculatorData }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", db_size: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Lead.create({
      ...form,
      monthly_messages: calculatorData.messages,
      monthly_customers: calculatorData.customers,
      avg_deal_value: calculatorData.dealValue,
      calculated_loss: calculatorData.monthlyLoss,
      calculated_gain: calculatorData.potentialGain,
      notes: form.db_size ? `מאגר לקוחות: ${form.db_size}` : undefined,
    });
    setLoading(false);
    setSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-7 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">פנייתך התקבלה!</h3>
              <p className="text-sm text-gray-500">נחזור אליך תוך שעות ספורות עם הדגמה מותאמת</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">קבל הדגמה אישית</h3>
                <p className="text-sm text-gray-500 mt-0.5">נראה לך בדיוק איך זה עובד בעסק שלך</p>
              </div>

              {/* Summary strip */}
              <div className="flex justify-between text-xs bg-gray-50 rounded-lg px-4 py-2.5 mb-5">
                <span className="text-red-500 font-semibold">הפסד: ₪{calculatorData.monthlyLoss?.toLocaleString('he-IL')}/חודש</span>
                <span className="text-violet-600 font-semibold">פוטנציאל: +₪{calculatorData.potentialGain?.toLocaleString('he-IL')}/חודש</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: "name",    label: "שם מלא *",    placeholder: "ישראל ישראלי",          type: "text",  required: true },
                  { key: "phone",   label: "טלפון *",     placeholder: "050-1234567",            type: "tel",   required: true },
                  { key: "email",   label: "אימייל",      placeholder: "you@company.co.il",      type: "email"                },
                  { key: "company", label: "שם העסק",     placeholder: "שם החברה",               type: "text"                 },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                    <input
                      type={type}
                      required={required}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">גודל מאגר לקוחות</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["עד 1,000", "1,000–10,000", "10,000–50,000", "50,000–200,000", "200,000+", "לא יודע"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm({ ...form, db_size: opt })}
                        className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                          form.db_size === opt
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-60 mt-1"
                >
                  {loading ? "שולח..." : "שלח ותזמן הדגמה →"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}