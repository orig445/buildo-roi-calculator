import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
      <div style={{ background: "white", border: "1px solid #ede8ff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "#2d1b69", lineHeight: 1.6, boxShadow: "0 1px 6px rgba(90,63,168,0.06)", whiteSpace: "pre-line" }}>
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

function QuickReply({ text, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{
        background: disabled ? "#f0ecff" : "white",
        border: "1.5px solid #7c5cbf",
        color: disabled ? "#b0a0d4" : "#5a3fa8",
        borderRadius: 20,
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "'Heebo', sans-serif",
        opacity: disabled ? 0.6 : 1,
      }}>
      {text}
    </motion.button>
  );
}

function CTACard({ onOpenCTA }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg, #f3f0ff, #ede8ff)",
        border: "1.5px solid #c9bcf5",
        borderRadius: 14,
        padding: "14px 16px",
        marginTop: 8,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>🚀</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#2d1b69", marginBottom: 4 }}>
        רוצה לראות הדגמה מלאה?
      </div>
      <div style={{ fontSize: 12, color: "#7c5cbf", marginBottom: 12, lineHeight: 1.6 }}>
        נשמח להציג לך בשיחה קצרה של 15 דקות בדיוק איך זה עובד לעסק שלך
      </div>
      <button
        onClick={onOpenCTA}
        style={{
          background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)",
          color: "white",
          border: "none",
          borderRadius: 10,
          padding: "10px 22px",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "'Heebo', sans-serif",
          boxShadow: "0 4px 14px rgba(90,63,168,0.3)",
          width: "100%",
        }}
      >
        קבע שיחת הדגמה חינם 📅
      </button>
    </motion.div>
  );
}

export default function DemoChat({ siteData, isScanning, onOpenCTA }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [showCTA, setShowCTA] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const chatRef = useRef(null);
  const msgCountRef = useRef(0);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs, typing, showCTA]);

  useEffect(() => {
    if (siteData && !initialized) {
      setInitialized(true);
      setMsgs([]);
      setQuickReplies([]);
      setShowCTA(false);
      setInputDisabled(false);
      msgCountRef.current = 0;
      runOpening(siteData);
    }
    if (!siteData) {
      setInitialized(false);
      setMsgs([]);
      setQuickReplies([]);
      setShowCTA(false);
      setInputDisabled(false);
      msgCountRef.current = 0;
    }
  }, [siteData]);

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const addBot = async (text, waitMs = 900) => {
    setTyping(true);
    setQuickReplies([]);
    await wait(waitMs);
    setTyping(false);
    setMsgs(prev => [...prev, { type: "bot", text }]);
  };

  const addUser = (text) => {
    setMsgs(prev => [...prev, { type: "user", text }]);
  };

  const runOpening = async (data) => {
    const greeting = data.opening_message || `היי! 👋 ברוכים הבאים ל${data.business_name || data.business_type}! במה אפשר לעזור?`;
    await addBot(greeting, 800);
    setQuickReplies([
      { text: data.quick_reply_1 || "אשמח לשמוע עוד 🙋", action: "qr1" },
      { text: data.quick_reply_2 || "מחירים ושירותים 💸", action: "qr2" },
    ]);
  };

  const handleSend = useCallback(async () => {
    const text = userInput.trim();
    if (!text || typing || inputDisabled) return;
    setUserInput("");
    addUser(text);
    msgCountRef.current += 1;
    await handleUserMessage(text);
  }, [userInput, typing, inputDisabled, siteData]);

  const handleQuickReply = async (reply) => {
    setQuickReplies([]);
    addUser(reply.text);
    msgCountRef.current += 1;
    await handleUserMessage(reply.text, reply.action);
  };

  const handleUserMessage = async (text, action) => {
    // After 4 exchanges → show CTA
    if (msgCountRef.current >= 4) {
      await addBot("נשמע שיש לך שאלות מעמיקות יותר 😊\nלהדגמה מלאה ומותאמת לעסק שלך — הכי טוב לדבר עם נציג שלנו.", 1000);
      setShowCTA(true);
      setInputDisabled(true);
      return;
    }

    // Use LLM to generate a smart reply based on siteData context
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה בוט WhatsApp חכם של העסק הבא:
שם: ${siteData?.business_name || siteData?.business_type}
סוג עסק: ${siteData?.business_type}
מידע על העסק: ${siteData?.info_message || ""}

ענה על ההודעה הבאה של לקוח בצורה טבעית, ידידותית ומקצועית בעברית.
ההודעה: "${text}"

כללים:
- ענה רק לגבי העסק הספציפי הזה ושירותיו
- אל תמציא מחירים שלא ידועים לך
- אם שואלים על הדגמה/מחיר/פגישה — אמור שנציג יחזור אליהם עם הפרטים
- 1-2 משפטים בלבד
- כלול אימוג'י רלוונטי אחד בסוף
`,
      });

      const botReply = typeof res === "string" ? res : res?.text || res?.content || "תודה! נציג שלנו יחזור אליך בהקדם 😊";

      await addBot(botReply, 900 + Math.random() * 400);

      // After 2nd user message, offer CTA options
      if (msgCountRef.current === 2) {
        setQuickReplies([
          { text: "קבע הדגמה חינם 🚀", action: "demo" },
          { text: "עוד שאלה", action: "more" },
        ]);
      } else if (msgCountRef.current >= 3) {
        setQuickReplies([
          { text: "קבע הדגמה חינם 🚀", action: "demo" },
        ]);
      }

      // If it's the demo action
      if (action === "demo") {
        await addBot("מעולה! 🎉 אשמח לחבר אותך עם נציג שלנו להדגמה מותאמת אישית.", 800);
        setShowCTA(true);
        setInputDisabled(true);
        return;
      }

    } catch {
      // Fallback if LLM fails
      const fallbacks = [
        "תודה על השאלה! נציג שלנו יוכל לתת לך מידע מדויק יותר 😊",
        `שאלה מעולה! ב${siteData?.business_name || "העסק"} נשמח לענות על כל שאלה בשיחה אישית 📞`,
        "בטח! אשמח לתאם שיחה עם נציג שיסביר לך הכל בפרטים 🙌",
      ];
      await addBot(fallbacks[msgCountRef.current % fallbacks.length], 1000);
      if (msgCountRef.current >= 2) {
        setQuickReplies([{ text: "קבע הדגמה חינם 🚀", action: "demo" }]);
      }
    }
  };

  const isIdle = !siteData && !isScanning;

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #ede8ff", overflow: "hidden", boxShadow: "0 8px 32px rgba(90,63,168,0.1)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4a3292, #7c5cbf)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(74,50,146,0.25)" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={BILDO_AVATAR} alt="בילדו" style={{ width: 42, height: 42, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: isScanning ? "#ffd166" : siteData ? "#4dff91" : "#bbb", border: "2px solid white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>
            {siteData?.business_name || siteData?.business_type || "WhatsApp Bot"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>
            {isScanning ? "סורק את האתר שלך..." : siteData ? "מחובר · מותאם אישית" : "ממתין לכתובת אתר..."}
          </div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 10px" }}>
          <MessageCircle style={{ width: 10, height: 10 }} /> הדגמה חיה
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{ minHeight: 200, maxHeight: 340, overflowY: "auto", padding: "14px", background: "#f8f6ff", display: "flex", flexDirection: "column" }}>

        {isIdle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "34px 16px", margin: "auto 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #ede8ff, #ddd5f5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26 }}>💬</div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#3d2e6b", marginBottom: 5 }}>הכנס כתובת אתר למעלה</p>
            <p style={{ fontSize: 12, color: "#9b7fd4", lineHeight: 1.6 }}>הבוט יסרוק את העסק שלך ויתאים<br />את עצמו אוטומטית</p>
          </motion.div>
        )}

        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "34px 16px", margin: "auto 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #ede8ff, #ddd5f5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ fontSize: 26 }}>🔍</motion.div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#3d2e6b", marginBottom: 5 }}>בונה בוט מותאם לעסק שלך...</p>
            <p style={{ fontSize: 12, color: "#9b7fd4" }}>זה לוקח כמה שניות</p>
          </motion.div>
        )}

        {msgs.map((m, i) =>
          m.type === "bot" ? <BotMessage key={i} text={m.text} /> : <UserMessage key={i} text={m.text} />
        )}

        {typing && <TypingBubble />}

        {!typing && quickReplies.length > 0 && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {quickReplies.map((qr) => (
                <QuickReply
                  key={qr.text}
                  text={qr.text}
                  onClick={() => handleQuickReply(qr)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {showCTA && <CTACard onOpenCTA={onOpenCTA} />}

        <div />
      </div>

      {/* Input bar */}
      {siteData && !inputDisabled && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid #ede8ff", display: "flex", gap: 8, background: "white", alignItems: "center" }}>
          <input
            type="text"
            placeholder="כתוב הודעה..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            style={{ flex: 1, border: "1.5px solid #ede8ff", borderRadius: 24, padding: "9px 16px", fontSize: 13, color: "#2d1b69", background: "#f8f6ff", outline: "none", fontFamily: "'Heebo', sans-serif" }}
            onFocus={e => e.target.style.borderColor = "#7c5cbf"}
            onBlur={e => e.target.style.borderColor = "#ede8ff"}
          />
          <button
            onClick={handleSend}
            style={{ background: "linear-gradient(135deg, #5a3fa8, #7c5cbf)", color: "white", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(90,63,168,0.35)" }}>
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}