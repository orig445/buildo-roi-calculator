import { useState } from "react";
import { Mail, MessageSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeadActions({ lead }) {
  const [smsSending, setSmsSending] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [smsStatus, setSmsStatus] = useState(null); // 'ok' | 'err'
  const [emailStatus, setEmailStatus] = useState(null);

  const sendSms = async () => {
    if (!lead.phone) return alert("אין מספר טלפון ללייד זה");
    setSmsSending(true);
    setSmsStatus(null);
    try {
      await base44.functions.invoke("buildoDispatch", {
        channel: "sms",
        to: lead.phone,
        body: `שלום ${lead.name || ""}! בילדו כאן 👋 נשמח להראות לך איך אוטומציית וואטסאפ יכולה לתגדיל את ההכנסות שלך. צור קשר: 053-286-1565`,
      });
      setSmsStatus("ok");
    } catch {
      setSmsStatus("err");
    } finally {
      setSmsSending(false);
    }
  };

  const sendEmail = async () => {
    if (!lead.email) return alert("אין אימייל ללייד זה");
    setEmailSending(true);
    setEmailStatus(null);
    try {
      await base44.functions.invoke("buildoDispatch", {
        channel: "email",
        to: lead.email,
        subject: `${lead.name || "שלום"} — בילדו: הפוטנציאל שלך עם WhatsApp`,
        body: `שלום ${lead.name || ""},\n\nתודה שמילאת את המחשבון שלנו!\n\nחישבנו שאתה עשוי להרוויח עד ₪${Math.round(lead.calculated_gain || 0).toLocaleString("he-IL")} נוספים בחודש עם אוטומציית WhatsApp חכמה.\n\nנשמח לקבוע שיחה קצרה להדגמה חינמית — ללא התחייבות.\n\nלתיאום: 053-286-1565\n\nצוות בילדו`,
      });
      setEmailStatus("ok");
    } catch {
      setEmailStatus("err");
    } finally {
      setEmailSending(false);
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === "ok") return <CheckCircle style={{ width: 12, height: 12, color: "#2a7d55" }} />;
    if (status === "err") return <XCircle style={{ width: 12, height: 12, color: "#c0392b" }} />;
    return null;
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {/* SMS */}
      <button
        onClick={sendSms}
        disabled={smsSending || !lead.phone}
        title={lead.phone ? `שלח SMS ל-${lead.phone}` : "אין טלפון"}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          border: "1px solid rgba(26,51,37,0.25)",
          background: lead.phone ? "rgba(26,51,37,0.07)" : "rgba(0,0,0,0.03)",
          color: lead.phone ? "var(--forest)" : "var(--ink-light)",
          cursor: lead.phone ? "pointer" : "not-allowed",
          fontFamily: "'Heebo', sans-serif",
          opacity: smsSending ? 0.6 : 1,
          transition: "all 0.15s",
        }}
      >
        {smsSending
          ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
          : <MessageSquare style={{ width: 11, height: 11 }} />
        }
        SMS
        <StatusIcon status={smsStatus} />
      </button>

      {/* Email */}
      <button
        onClick={sendEmail}
        disabled={emailSending || !lead.email}
        title={lead.email ? `שלח אימייל ל-${lead.email}` : "אין אימייל"}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          border: "1px solid rgba(196,150,42,0.3)",
          background: lead.email ? "rgba(196,150,42,0.08)" : "rgba(0,0,0,0.03)",
          color: lead.email ? "var(--gold)" : "var(--ink-light)",
          cursor: lead.email ? "pointer" : "not-allowed",
          fontFamily: "'Heebo', sans-serif",
          opacity: emailSending ? 0.6 : 1,
          transition: "all 0.15s",
        }}
      >
        {emailSending
          ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
          : <Mail style={{ width: 11, height: 11 }} />
        }
        מייל
        <StatusIcon status={emailStatus} />
      </button>
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}