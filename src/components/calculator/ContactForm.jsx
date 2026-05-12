import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CheckCircle, X } from "lucide-react";

export default function ContactForm({ isOpen, onClose, calculatorData }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-md rounded-3xl p-8 relative card-glow"
          style={{ background: 'hsl(28 12% 11%)', border: '1px solid hsl(271 60% 35%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                פנייתך התקבלה! 🎉
              </h3>
              <p className="text-muted-foreground">
                נחזור אליך תוך שעות ספורות עם הדגמה מותאמת אישית לעסק שלך
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <img
                  src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
                  alt="Bildo"
                  className="w-12 h-12 rounded-xl mx-auto mb-3"
                />
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                  קבל הדגמה אישית
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ונראה לך בדיוק איך בילדו עובד עם הסוגרת שלך
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "שם מלא", placeholder: "ישראל ישראלי", type: "text", required: true },
                  { key: "phone", label: "טלפון", placeholder: "050-1234567", type: "tel", required: true },
                  { key: "email", label: "אימייל", placeholder: "israel@business.co.il", type: "email" },
                  { key: "company", label: "שם העסק", placeholder: "שם החברה / עסק", type: "text" },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      {label} {required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                      style={{ background: 'hsl(28 10% 16%)', border: '1px solid hsl(28 10% 22%)' }}
                    />
                  </div>
                ))}

                {/* Show results summary */}
                <div className="rounded-xl p-4 text-sm" style={{ background: 'hsl(28 10% 14%)' }}>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>הפסד חודשי מחושב:</span>
                    <span className="text-red-400 font-semibold">₪{calculatorData.monthlyLoss?.toLocaleString('he-IL')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>פוטנציאל עם בילדו:</span>
                    <span className="text-purple-400 font-semibold">+₪{calculatorData.potentialGain?.toLocaleString('he-IL')}</span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl text-base font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, hsl(271 60% 45%) 0%, hsl(271 60% 60%) 100%)' }}
                >
                  {loading ? "שולח..." : "🚀 שלח ותזמן הדגמה"}
                </motion.button>

                <p className="text-xs text-muted-foreground text-center">
                  אנחנו לא שולחים ספאם. תגובה תוך 24 שעות.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}