import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";

const BILDO_AVATAR = "https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png";

function TypingBubble() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
      <img src={BILDO_AVATAR} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      <div style={{ background: "white", border: "1px solid #ede8ff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#9b7fd4" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function BotMessage({ text }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
      style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
      <img src={BILDO_AVATAR} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      <div style={{ background: "white", border: "1px solid #ede8ff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "#2d1b69", lineHeight: 1.6, boxShadow: "0 1px 6px rgba(90,63,168,0.06)" }}>
        {text}
      </div>
    </motion.div>
  );
}

function UserMessage({ text }) {
  return (
    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
      style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <div style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", borderRadius: "16px 16px 4px 16px", padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "white", lineHeight: 1.6 }}>
        {text}
      </div>
    </motion.div>
  );
}

function QuickReply({ text, onClick }) {
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{ background: "white", border: "1.5px solid #7c5cbf", color: "#5a3fa8", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
      {text}
    </motion.button>
  );
}

// siteData comes from the parent (WebsiteAnalyzer already scanned it)
export default function DemoChat({ siteData, isScanning, onOpenCTA }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // When siteData arrives (after scan), start the conversation
  useEffect(() => {
    if (siteData && !initialized) {
      setInitialized(true);
      setMsgs([]);
      setStep(0);
      runOpening(siteData);
    }
    // Reset if siteData cleared
    if (!siteData) {
      setInitialized(false);
      setMsgs([]);
      setStep(0);
    }
  }, [siteData]);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const addBot = async (text, waitMs = 900) => {
    setTyping(true);
    await delay(waitMs);
    setTyping(false);
    setMsgs(prev => [...prev, { type: "bot", text }]);
  };

  const addUser = (text) => setMsgs(prev => [...prev, { type: "user", text }]);

  const runOpening = async (data) => {
    await addBot(data.opening_message || `היי! 👋 ברוכים הבאים ל${data.business_type || "העסק"}! כיצד אפשר לעזור?`, 900);
    setStep(1);
  };

  const handleQuickReply = async (replyText, nextStep) => {
    addUser(replyText);
    setStep(0);
    if (nextStep === "interested") {
      await addBot(siteData?.follow_up_message || "מצוין! נשמח לתאם שיחה קצרה עם נציג שלנו.", 1100);
      await addBot("מה מספר הטלפון שלך כדי שנחזור אליך? 📞", 1200);
      setStep(2);
    } else if (nextStep === "price") {
      await addBot("המחיר מותאם לגודל העסק — בדרך כלל כמה מאות שקלים בחודש עם ROI תוך 30 יום.", 1100);
      await addBot("רוצה הדגמה מותאמת חינם? 🎁", 1200);
      setStep(2);
    } else if (nextStep === "book") {
      await addBot("מעולה! 🚀 נעביר אותך לקביעת הדגמה עם הצוות:", 800);
      setStep(3);
      setTimeout(() => onOpenCTA?.(), 800);
    } else if (nextStep === "phone") {
      await addBot(siteData?.closing_message || "תודה! נציג שלנו יחזור אליך בהקדם. 💡", 1000);
      setStep(3);
    }
  };

  const isIdle = !siteData && !isScanning;
  const statusText = isScanning ? "סורק את האתר שלך..." : siteData ? `${siteData.business_type} · מחובר` : "ממתין לכתובת אתר...";

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #ede8ff", overflow: "hidden", boxShadow: "0 8px 32px rgba(90,63,168,0.1)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src={BILDO_AVATAR} alt="בילדו" style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", objectFit: "cover", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>בילדו · WhatsApp Bot</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: isScanning ? "#ffd166" : siteData ? "#4dff91" : "#aaa" }} />
            {statusText}
          </div>
        </div>
        <div style={{ marginRight: "auto", fontSize: 10, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
          <MessageCircle style={{ width: 11, height: 11 }} /> הדגמה חיה
        </div>
      </div>

      {/* Chat area */}
      <div style={{ minHeight: 180, maxHeight: 300, overflowY: "auto", padding: "14px 14px", background: "#f8f6ff", display: "flex", flexDirection: "column" }}>

        {isIdle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "30px 10px", color: "#9b7fd4" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#5a3fa8", marginBottom: 4 }}>הכנס כתובת אתר למעלה</p>
            <p style={{ fontSize: 12, color: "#9b7fd4" }}>הבוט יתאים את עצמו לעסק שלך אוטומטית</p>
          </motion.div>
        )}

        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "28px 10px", color: "#8b7ab8" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>🔍</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#5a3fa8" }}>בונה בוט מותאם לעסק שלך...</p>
            <p style={{ fontSize: 11, marginTop: 4, color: "#9b7fd4" }}>זה לוקח כמה שניות</p>
          </motion.div>
        )}

        {msgs.map((m, i) =>
          m.type === "bot" ? <BotMessage key={i} text={m.text} /> : <UserMessage key={i} text={m.text} />
        )}

        {typing && <TypingBubble />}

        {!typing && step === 1 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            <QuickReply text="אשמח לשמוע עוד 🙋" onClick={() => handleQuickReply("אשמח לשמוע עוד 🙋", "interested")} />
            <QuickReply text="כמה זה עולה? 💸" onClick={() => handleQuickReply("כמה זה עולה? 💸", "price")} />
          </motion.div>
        )}
        {!typing && step === 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            <QuickReply text="כן, קבע הדגמה! 🚀" onClick={() => handleQuickReply("כן, קבע הדגמה! 🚀", "book")} />
            <QuickReply text="השאר פרטים" onClick={() => handleQuickReply("השאר פרטים להתקשרות", "phone")} />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — only shown when conversation is active */}
      {siteData && step !== 3 && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #ede8ff", display: "flex", gap: 8, background: "white" }}>
          <input type="text" placeholder="כתוב הודעה..." value={userInput}
            onChange={e => setUserInput(e.target.value)}
            style={{ flex: 1, border: "1.5px solid #ede8ff", borderRadius: 20, padding: "8px 14px", fontSize: 12, color: "#2d1b69", background: "#f8f6ff", outline: "none", fontFamily: "'Heebo', sans-serif" }} />
          <button style={{ background: "#5a3fa8", color: "white", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}