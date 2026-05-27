import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  {
    title: "פרטי איש קשר",
    fields: [
      { key: "full_name", label: "שם מלא", type: "text", required: true, placeholder: "ישראל ישראלי" },
      { key: "phone", label: "מספר טלפון", type: "tel", required: true, placeholder: "050-0000000" },
      { key: "email", label: "אימייל", type: "email", required: false, placeholder: "your@email.com" },
    ],
  },
  {
    title: "על העסק",
    fields: [
      { key: "business_name", label: "שם העסק", type: "text", required: true, placeholder: "חברת X" },
      { key: "business_type", label: "סוג העסק", type: "text", required: false, placeholder: "מסעדה, קליניקה, חנות אופנה..." },
      { key: "value_proposition", label: "הצעת הערך של העסק", type: "textarea", required: false, placeholder: "מה מייחד אתכם? למה לקוח יבחר בכם?" },
      { key: "products_services", label: "מוצרים / שירותים", type: "textarea", required: false, placeholder: "פירוט המוצרים או השירותים שאתם מציעים" },
    ],
  },
  {
    title: "פוקוס שיווקי",
    fields: [
      { key: "focused_product", label: "שירות / מוצר ממוקד להתחלה", type: "textarea", required: false, placeholder: "על מה נרצה להתמקד בהתחלה?" },
      { key: "marketing_budget", label: "תקציב שיווקי חודשי", type: "text", required: false, placeholder: "₪2,000 / ₪5,000 / גמיש / נדון יחד" },
      { key: "marketing_goals", label: "מטרות השיווק", type: "textarea", required: false, placeholder: "יצירת לידים, הגדלת מכירות, מודעות למותג..." },
      { key: "target_audience", label: "קהל יעד", type: "textarea", required: false, placeholder: "גיל, מין, מיקום, תחומי עניין..." },
    ],
  },
  {
    title: "נכסים קיימים",
    fields: [
      { key: "existing_platforms", label: "פלטפורמות קיימות", type: "textarea", required: false, placeholder: "פייסבוק, אינסטגרם, גוגל, אתר אינטרנט..." },
      { key: "platforms_credentials", label: "פרטי גישה לפלטפורמות", type: "textarea", required: false, placeholder: "שמות משתמש / סיסמאות / הרשאות גישה" },
      { key: "competitors", label: "מתחרים עיקריים", type: "textarea", required: false, placeholder: "שמות עסקים / אתרים של מתחרים" },
      { key: "brand_assets", label: "לוגו וחומרי מותג", type: "text", required: false, placeholder: "לינק ל-Drive / Dropbox / אין עדיין" },
      { key: "visual_style", label: "סגנון ויזואלי מועדף", type: "text", required: false, placeholder: "מינימליסטי / צבעוני / מקצועי / כיפי" },
      { key: "notes", label: "הערות חופשיות", type: "textarea", required: false, placeholder: "כל מה שחשוב שנדע..." },
    ],
  },
];

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 10,
  fontSize: 15,
  fontFamily: "'Heebo', sans-serif",
  outline: "none",
  background: "#fff",
  color: "#000",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  direction: "rtl",
};

function FieldInput({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const style = { ...inputStyle, borderColor: focused ? "#000" : "#e0e0e0" };

  if (field.type === "textarea") {
    return (
      <textarea
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        style={{ ...style, resize: "vertical", minHeight: 90 }}
      />
    );
  }
  return (
    <input
      type={field.type}
      placeholder={field.placeholder}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={style}
    />
  );
}

export default function ClientBriefForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const updateField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    return step.fields
      .filter((f) => f.required)
      .every((f) => data[f.key]?.trim());
  };

  const handleNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await base44.entities.ClientBrief.create(data);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Heebo', sans-serif" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: "center", padding: 40 }}
        >
          <div style={{ width: 72, height: 72, background: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>קיבלנו! תודה 🙌</h2>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>
            הפרטים נשמרו בהצלחה.<br />ניצור איתך קשר בהקדם.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Heebo', sans-serif", color: "#000" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #e0e0e0", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png"
          alt="Bildo"
          style={{ height: 32 }}
        />
        <span style={{ fontSize: 16, fontWeight: 800 }}>טופס אפיון לקוח</span>
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 4, borderRadius: 4,
                background: i <= currentStep ? "#000" : "#e0e0e0",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step label */}
        <div style={{ fontSize: 12, color: "#999", fontWeight: 700, marginBottom: 6 }}>
          שלב {currentStep + 1} מתוך {STEPS.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 28 }}>{step.title}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {step.fields.map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#333" }}>
                    {field.label}
                    {field.required && <span style={{ color: "#000", marginRight: 4 }}>*</span>}
                  </label>
                  <FieldInput
                    field={field}
                    value={data[field.key]}
                    onChange={(val) => updateField(field.key, val)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={isFirst}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "1.5px solid #e0e0e0", borderRadius: 10,
              padding: "11px 20px", fontSize: 14, fontWeight: 700,
              cursor: isFirst ? "not-allowed" : "pointer",
              color: isFirst ? "#ccc" : "#000",
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            <ChevronRight size={16} /> חזור
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: canProceed() && !loading ? "#000" : "#ddd",
              color: canProceed() && !loading ? "#fff" : "#999",
              border: "none", borderRadius: 10,
              padding: "13px 28px", fontSize: 15, fontWeight: 800,
              cursor: canProceed() && !loading ? "pointer" : "not-allowed",
              fontFamily: "'Heebo', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {loading ? "שומר..." : isLast ? "שלח טופס" : "המשך"}
            {!loading && <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}