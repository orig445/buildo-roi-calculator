import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContactForm from "@/components/calculator/ContactForm";
import TrustBar from "@/components/calculator/TrustBar";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";

function SliderRow({ label, value, min, max, step, onChange, formatDisplay }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-[#888] font-mono uppercase tracking-widest">{label}</span>
        <span className="text-sm font-mono font-bold text-[#ccc]">{formatDisplay(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to left, #aaa ${pct}%, #333 ${pct}%)`,
          WebkitAppearance: 'none',
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 0;
          background: #ccc;
          cursor: pointer;
          border: 1px solid #666;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, color = "text-[#ccc]", size = "text-2xl" }) {
  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`${size} font-mono font-bold ${color} tabular-nums`}
      >
        {value}
      </motion.div>
      <div className="text-xs text-[#666] font-mono mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

const fmt = (n) => `₪${Math.round(n).toLocaleString('he-IL')}`;

export default function Calculator() {
  const [messages, setMessages]     = useState(5000);
  const [customers, setCustomers]   = useState(200);
  const [dealValue, setDealValue]   = useState(1500);
  const [showForm, setShowForm]     = useState(false);

  const r = useMemo(() => {
    const lostRate   = 0.18;
    const liftRate   = 0.25;
    const lostCust   = Math.round(customers * lostRate);
    const monthLoss  = lostCust * dealValue;
    const monthGain  = Math.round(customers * liftRate) * dealValue;
    return {
      monthLoss, annualLoss: monthLoss * 12,
      monthGain, annualGain: monthGain * 12,
      lostCust,
      msgCost: Math.round(messages * 0.08),
    };
  }, [messages, customers, dealValue]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4" style={{fontFamily: 'monospace'}}>
      <div className="w-full max-w-3xl bg-[#111] border border-[#333] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
              alt="Bildo"
              className="w-8 h-8"
            />
            <span className="font-mono font-bold text-[#ccc] text-base tracking-widest uppercase">BILDO</span>
          </div>
          <p className="text-xs text-[#555] font-mono uppercase tracking-widest">WhatsApp Business API // ROI CALC v2.1</p>
        </div>

        <div className="px-6 py-6">
          {/* Title */}
          <div className="text-center mb-6 border border-[#2a2a2a] bg-[#0d0d0d] py-4 px-4">
            <h1 className="text-xl font-mono font-bold text-[#ccc] mb-1 uppercase tracking-widest">
              כמה כסף אתה מפסיד כל חודש?
            </h1>
            <p className="text-xs text-[#555] font-mono uppercase tracking-widest">הכנס את האתר שלך ונמלא הכל אוטומטית</p>
          </div>

          <WebsiteAnalyzer
            onAnalyzed={({ messages, customers, dealValue }) => {
              setMessages(messages);
              setCustomers(customers);
              setDealValue(dealValue);
            }}
          />

          {/* Grid: Sliders + Results */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Sliders */}
            <div className="space-y-6 border border-[#2a2a2a] p-4 bg-[#0d0d0d]">
              <p className="text-xs text-[#555] font-mono uppercase tracking-widest border-b border-[#2a2a2a] pb-2">// הגדר פרמטרים</p>
              <SliderRow
                label="הודעות וואטסאפ בחודש"
                value={messages} min={100} max={100000} step={100}
                onChange={setMessages}
                formatDisplay={(v) => v.toLocaleString('he-IL')}
              />
              <SliderRow
                label="לקוחות / עסקאות בחודש"
                value={customers} min={10} max={5000} step={10}
                onChange={setCustomers}
                formatDisplay={(v) => v.toLocaleString('he-IL')}
              />
              <SliderRow
                label="ערך ממוצע לעסקה"
                value={dealValue} min={100} max={50000} step={100}
                onChange={setDealValue}
                formatDisplay={(v) => `₪${v.toLocaleString('he-IL')}`}
              />

              {/* Mini note */}
              <div className="border border-[#2a2a2a] p-3 text-xs font-mono space-y-1.5 bg-[#111]">
                <div className="flex justify-between">
                  <span className="text-[#555]">לקוחות שיוצאים ללא מענה:</span>
                  <span className="text-[#888]">{r.lostCust} / חודש</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">עלות API משוערת:</span>
                  <span className="text-[#888]">₪{r.msgCost} / חודש</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {/* Loss */}
              <div className="border border-[#3a2020] bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-1.5 mb-4 border-b border-[#2a2020] pb-2">
                  <p className="text-xs font-mono text-[#aa4444] uppercase tracking-widest">// מה אתה מפסיד היום</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-[#664444] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-right bg-[#222] border-[#444] text-[#ccc]">
                        <p className="text-xs leading-relaxed font-mono">
                          מחושב לפי 18% מהלקוחות שלך שלא מקבלים מענה מהיר ועוזבים — נתון מבוסס על מחקרי שוק בתחום שירות הלקוחות בוואטסאפ. ההפסד = לקוחות אבודים × ערך עסקה ממוצע.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="חודשי" value={fmt(r.monthLoss)} color="text-[#cc4444]" />
                  <Stat label="שנתי" value={fmt(r.annualLoss)} color="text-[#aa3333]" />
                </div>
              </div>

              {/* Gain */}
              <div className="border border-[#2a2a3a] bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-1.5 mb-4 border-b border-[#222233] pb-2">
                  <p className="text-xs font-mono text-[#7777cc] uppercase tracking-widest">// עם בילדו</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-[#445566] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-right bg-[#222] border-[#444] text-[#ccc]">
                        <p className="text-xs leading-relaxed font-mono">
                          מחושב לפי שיפור של 25% בסגירת עסקאות בעזרת מענה אוטומטי מיידי, תזכורות חכמות וקמפיינים ממוקדים. הרווח = לקוחות נוספים × ערך עסקה ממוצע.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="רווח חודשי" value={`+${fmt(r.monthGain)}`} color="text-[#8888dd]" />
                  <Stat label="רווח שנתי" value={`+${fmt(r.annualGain)}`} color="text-[#6666bb]" />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 text-sm font-mono font-bold text-[#111] bg-[#aaa] hover:bg-[#ccc] transition-colors uppercase tracking-widest border border-[#888]"
              >
                קבל הדגמה חינם →
              </button>
              <p className="text-center text-xs text-[#444] font-mono uppercase tracking-widest">ללא התחייבות · תגובה תוך 24 שעות</p>
            </div>
          </div>
        </div>
      </div>

      <TrustBar />

      {/* Footer */}
      <p className="text-xs text-[#444] font-mono mt-4 uppercase tracking-widest">© 2026 BILDO · META OFFICIAL PARTNER · WhatsApp Business API</p>

      <ContactForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthLoss, potentialGain: r.monthGain }}
      />
    </div>
  );
}