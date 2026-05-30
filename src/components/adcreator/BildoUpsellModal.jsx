import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";

const services = [
  "Branded Ads",
  "Business Videos",
  "Website for Your Business",
  "Paid Campaigns",
  "Social Media Management & Scheduling",
];

export default function BildoUpsellModal({ lang = "he" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const modal = (
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
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 99998,
            }}
          />

          {/* Modal — centered via flexbox on the backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              pointerEvents: "none",
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                background: "#fff",
                borderRadius: 24,
                padding: "36px 32px 32px",
                width: "100%",
                maxWidth: 460,
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                textAlign: "center",
                direction: "ltr",
                position: "relative",
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
              <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
                <img
                  src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/09f0d2769_b-arrow-1.png"
                  alt="Bildo"
                  style={{ width: 90, height: 90, objectFit: "contain" }}
                />
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Full Marketing Department — Zero Employees
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1a0a2e", margin: "0 0 8px" }}>
                Join Bildo
              </h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: "0 0 20px" }}>
                Get everything you need to grow online — for the price of a part-time employee
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
                }}
              >
                Get Started for Free
                <ArrowLeft size={16} />
              </a>

              <div style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>
                No credit card · Free trial · Response within hours
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}