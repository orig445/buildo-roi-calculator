import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, Send, MessageCircle } from "lucide-react";

const BILDO_AVATAR = "https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png";

function TypingBubble() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <img src={BILDO_AVATAR} alt="בילדו" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ background: "white", border: "1px solid #ede8ff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9b7fd4" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function BotMessage({ text, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}
    >
      <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <img src={BILDO_AVATAR} alt="בילדו" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ background: "white", border: "1px solid #ede8ff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "#2d1b69", lineHeight: 1.6, boxShadow: "0 1px 6px rgba(90,63,168,0.06)" }}>
        {text}
      </div>
    </motion.div>
  );
}

function UserMessage({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}
    >
      <div style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", borderRadius: "16px 16px 4px 16px", padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "white", lineHeight: 1.6 }}>
        {text}
      </div>
    </motion.div>
  );
}

// Quick reply button
function QuickReply({ text, onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "white", border: "1.5px solid #7c5cbf", color: "#5a3fa8",
        borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 700,
        cursor: "pointer", fontFamily: "'Heebo', sans-serif", transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {text}
    </motion.button>
  );
}

export default function DemoChat({ onOpenCTA }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | scanning | chat | done
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addBot = (text, delay = 0) => new Promise(resolve => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: "bot", text }]);
      setTimeout(resolve, 150);
    }, delay);
  });

  const addUser = (text) => {
    setMessages(prev => [...prev, { type: "user", text }]);
  };

  const handleScan = async () => {
    if (!url.trim()) return;
    setPhase("scanning");

    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) normalized = "https://" + normalized;

    try {
      const res = await base44.functions.invoke("analyzeWebsite", { url: normalized });
      const data = res.data;
      setSiteData(data);
      await startConversation(data);
    } catch {
      setPhase("idle");
      setMessages([{ type: "bot", text: "לא הצלחתי לסרוק את האתר. נסה שנית עם כתובת מלאה כמו: mybusiness.co.il" }]);
      setPhase("chat");
    }
  };

  const startConversation = async (data) => {
    setPhase("chat");
    setStep(0);

    await addBot(`היי! 👋 זיהיתי שמדובר ב${data.business_type || "עסק שלך"}.`, 900);
    await addBot(data.opening_message || `כיצד אנחנו יכולים לעזור לך היום?`, 1200);

    setStep(1);
  };

  const handleQuickReply = async (replyText, nextStep) => {
    addUser(replyText);
    setStep(0);

    if (nextStep === "interested") {
      await addBot(siteData?.follow_up_message || "מצוין! אני אשמח לתאם שיחה קצרה עם נציג שלנו.", 1100);
      await addBot("מה מספר הטלפון שלך כדי שנחזור אליך? 📞", 1400);
      setStep(2);
    } else if (nextStep === "price") {
      await addBot("כמובן! המחיר מותאם לגודל העסק שלך — בדרך כלל מדברים על כמה מאות שקלים בחודש עם החזר השקעה תוך 30 יום.", 1200);
      await addBot("רוצה שנעשה לך הדגמה מותאמת חינם? 🎁", 1400);
      setStep(2);
    } else if (nextStep === "book") {
      await addBot("מעולה! 🚀 נעביר אותך לקביעת הדגמה עם הצוות שלנו:", 900);
      setStep(3);
      setTimeout(() => onOpenCTA?.(), 1000);
    } else if (nextStep === "phone") {
      await addBot(`תודה! נציג שלנו יחזור אליך בהקדם. ${siteData?.closing_message || "בינתיים תוכל לראות את המחשבון כדי להעריך את הפוטנציאל שלך 💡"}`, 1100);
      setStep(3);
    }
  };

  const normalizeUrl = (raw) => {
    let u = raw.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    return u;
  };

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #ede8ff", overflow: "hidden", boxShadow: "0 8px 32px rgba(90,63,168,0.1)" }}>
      {/* WhatsApp-style header */}
      <div style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
          <img src={BILDO_AVATAR} alt="בילדו" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>בילדו · WhatsApp Bot</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4dff91" }} />
            {phase === "scanning" ? "סורק את האתר שלך..." : "מוכן לשיחה"}
          </div>
        </div>
        <div style={{ marginRight: "auto", fontSize: 10, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
          <MessageCircle style={{ width: 11, height: 11 }} /> הדגמה חיה
        </div>
      </div>

      {/* URL input if idle */}
      {phase === "idle" && (
        <div style={{ padding: "20px 18px", borderBottom: "1px solid #f0ecff" }}>
          <p style={{ fontSize: 13, color: "#8b7ab8", marginBottom: 10, fontWeight: 600 }}>🤖 הכנס את כתובת האתר שלך — הבוט ייתאם את עצמו לעסק שלך אוטומטית</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Globe style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9b7fd4" }} />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                placeholder="mybusiness.co.il"
                style={{ width: "100%", paddingRight: 34, paddingLeft: 12, paddingTop: 9, paddingBottom: 9, border: "1.5px solid #ede8ff", borderRadius: 10, fontSize: 13, color: "#2d1b69", background: "#f8f6ff", outline: "none", fontFamily: "'Heebo', sans-serif", boxSizing: "border-box" }}
              />
            </div>
            <button onClick={handleScan} disabled={!url.trim()}
              style={{ background: url.trim() ? "#5a3fa8" : "#c4b5e8", color: "white", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: url.trim() ? "pointer" : "not-allowed", fontFamily: "'Heebo', sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
              סרוק
            </button>
          </div>
        </div>
      )}

      {/* Chat messages area */}
      <div style={{ minHeight: 200, maxHeight: 320, overflowY: "auto", padding: "16px 14px", background: "#f8f6ff", display: "flex", flexDirection: "column" }}>
        {phase === "scanning" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "30px 0", color: "#8b7ab8" }}>
            <Loader2 style={{ width: 28, height: 28, margin: "0 auto 10px", animation: "spin 1s linear infinite", color: "#7c5cbf", display: "block" }} />
            <p style={{ fontSize: 13, fontWeight: 600 }}>סורק את האתר שלך ובונה בוט מותאם...</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>זה לוקח כמה שניות</p>
          </motion.div>
        )}

        {messages.map((m, i) =>
          m.type === "bot"
            ? <BotMessage key={i} text={m.text} />
            : <UserMessage key={i} text={m.text} />
        )}

        {typing && <TypingBubble />}

        {/* Quick replies */}
        {!typing && step === 1 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            <QuickReply text="אשמח לשמוע עוד 🙋" onClick={() => handleQuickReply("אשמח לשמוע עוד 🙋", "interested")} />
            <QuickReply text="כמה זה עולה? 💸" onClick={() => handleQuickReply("כמה זה עולה? 💸", "price")} />
          </motion.div>
        )}
        {!typing && step === 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            <QuickReply text="כן, קבע הדגמה! 🚀" onClick={() => handleQuickReply("כן, קבע הדגמה! 🚀", "book")} />
            <QuickReply text="השאר פרטים להתקשרות" onClick={() => handleQuickReply("השאר פרטים להתקשרות", "phone")} />
          </motion.div>
        )}
        {!typing && step === 3 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 6 }}>
            <button onClick={() => { setPhase("idle"); setMessages([]); setUrl(""); setStep(0); setSiteData(null); }}
              style={{ fontSize: 11, color: "#9b7fd4", background: "none", border: "none", cursor: "pointer", fontFamily: "'Heebo', sans-serif", padding: 0, textDecoration: "underline" }}>
              הפעל שוב עם אתר אחר
            </button>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {phase === "chat" && step !== 3 && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #ede8ff", display: "flex", gap: 8, background: "white" }}>
          <input
            type="text"
            placeholder="כתוב הודעה..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            style={{ flex: 1, border: "1.5px solid #ede8ff", borderRadius: 20, padding: "8px 14px", fontSize: 12, color: "#2d1b69", background: "#f8f6ff", outline: "none", fontFamily: "'Heebo', sans-serif" }}
          />
          <button style={{ background: "#5a3fa8", color: "white", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}