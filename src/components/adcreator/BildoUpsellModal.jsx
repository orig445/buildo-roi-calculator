import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";

const services = [
  "פרסומות ממותגות",
  "סרטונים לעסק",
  "אתר לעסק",
  "קמפיינים ממומנים",
  "ניהול סושיאל, תכנים ותזמונים",
];

export default function BildoUpsellModal({ lang = "he" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVisible(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%) !important",
              zIndex: 9999,
              background: "#fff",
              borderRadius: 24,
              padding: "36px 32px 32px",
              width: "min(460px, 92vw)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
              textAlign: "center",
              direction: "rtl",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setVisible(false)}
              style={{
                position: "absolute", top: 14, left: 14,
                background: "#f5f5f5", border: "none", borderRadius: "50%",
                width: 32, height: 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} color="#666" />
            </button>

            {/* Logo */}
            <div style={{ marginBottom: 18 }}>
              <img
                src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/09f0d2769_b-arrow-1.png"
                alt="Bildo"
                style={{ width: 90, height: 90, objectFit: "contain" }}
              />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              מחלקת שיווק שלמה — בלי עובד אחד
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1a0a2e", margin: "0 0 8px" }}>
              הצטרפו לבילדו
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: "0 0 20px" }}>
              קבלו את כל מה שצריך כדי לצמוח אונליין — במחיר של עובד חצי משרה
            </p>

            {/* Services list */}
            <div style={{
              background: "#f9f6ff",
              border: "1px solid rgba(124,58,237,0.15)",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "right",
            }}>
              {services.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 0",
                  borderBottom: i < services.length - 1 ? "1px solid rgba(124,58,237,0.08)" : "none",
                  fontSize: 14, color: "#1a0a2e", fontWeight: 600,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#7c3aed", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}>✓</span>
                  {s}
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://buildoai.com/worker-onboarding"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "14px 0",
                background: "#7c3aed", color: "#fff",
                borderRadius: 12, fontSize: 16, fontWeight: 800,
                textDecoration: "none", fontFamily: "'Heebo', sans-serif",
                boxShadow: "0 6px 24px rgba(124,58,237,0.35)",
                transition: "all 0.2s",
              }}
            >
              התחל עכשיו בחינם
              <ArrowLeft size={16} />
            </a>

            <div style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>
              ללא כרטיס אשראי · ניסיון חינם · מענה תוך שעות
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}