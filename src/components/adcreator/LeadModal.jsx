import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function LeadModal({ isOpen, onClose, businessInfo, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setSubmitted(true);

    await base44.entities.Lead.create({
      name,
      email,
      phone,
      company: businessInfo?.name || "",
      source: "ad_creator",
      notes: `סוג עסק: ${businessInfo?.type || ""}`,
    });

    setTimeout(() => {
      if (onSuccess) onSuccess();
      else onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, padding: 32,
              width: "100%", maxWidth: 400, position: "relative",
              color: "#000", fontFamily: "'Heebo', sans-serif",
            }}
          >
            <button
              onClick={onClose}
              style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer", color: "#666" }}
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>מוריד את התמונה...</div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
                  הורד את התמונה שלך
                </h3>
                <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginBottom: 20 }}>
                  השאר פרטים כדי לקבל את התמונה בחינם
                </p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8,
                      fontSize: 14, fontFamily: "'Heebo', sans-serif", outline: "none",
                      direction: "rtl",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="כתובת אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8,
                      fontSize: 14, fontFamily: "'Heebo', sans-serif", outline: "none",
                      direction: "rtl",
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="מספר טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8,
                      fontSize: 14, fontFamily: "'Heebo', sans-serif", outline: "none",
                      direction: "rtl",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#000", color: "#fff", border: "none",
                      borderRadius: 8, padding: "13px", fontSize: 15, fontWeight: 800,
                      cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginTop: 4,
                    }}
                  >
                    הורד תמונה
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}