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
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-base font-bold text-gray-900">{formatDisplay(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to left, #7c3aed ${pct}%, #e5e7eb ${pct}%)`,
          WebkitAppearance: 'none',
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900", size = "text-2xl" }) {
  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`${size} font-black ${color} tabular-nums`}
      >
        {value}
      </motion.div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
              alt="Bildo"
              className="w-9 h-9 rounded-xl"
            />
            <span className="font-bold text-gray-900 text-lg">בילדו</span>
          </div>
          <p className="text-sm text-gray-400">WhatsApp Business API</p>
        </div>

        <div className="px-8 py-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-gray-900 mb-1">
              כמה כסף אתה מפסיד כל חודש?
            </h1>
            <p className="text-sm text-gray-500">הכנס את האתר שלך ונמלא הכל אוטומטית</p>
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
            <div className="space-y-7">
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
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>לקוחות שיוצאים ללא מענה:</span>
                  <span className="font-semibold text-gray-700">{r.lostCust} / חודש</span>
                </div>
                <div className="flex justify-between">
                  <span>עלות API משוערת:</span>
                  <span className="font-semibold text-gray-700">₪{r.msgCost} / חודש</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Loss */}
              <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">מה אתה מפסיד היום</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-red-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-right">
                        <p className="text-xs leading-relaxed">
                          מחושב לפי 18% מהלקוחות שלך שלא מקבלים מענה מהיר ועוזבים — נתון מבוסס על מחקרי שוק בתחום שירות הלקוחות בוואטסאפ. ההפסד = לקוחות אבודים × ערך עסקה ממוצע.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="חודשי" value={fmt(r.monthLoss)} color="text-red-500" />
                  <Stat label="שנתי" value={fmt(r.annualLoss)} color="text-red-400" />
                </div>
              </div>

              {/* Gain */}
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider">עם בילדו</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-violet-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-right">
                        <p className="text-xs leading-relaxed">
                          מחושב לפי שיפור של 25% בסגירת עסקאות בעזרת מענה אוטומטי מיידי, תזכורות חכמות וקמפיינים ממוקדים. הרווח = לקוחות נוספים × ערך עסקה ממוצע.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="רווח חודשי" value={`+${fmt(r.monthGain)}`} color="text-violet-600" />
                  <Stat label="רווח שנתי" value={`+${fmt(r.annualGain)}`} color="text-violet-500" />
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowForm(true)}
                className="w-full py-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
              >
                קבל הדגמה חינם ←
              </motion.button>
              <p className="text-center text-xs text-gray-400">ללא התחייבות · תגובה תוך 24 שעות</p>
            </div>
          </div>
        </div>
      </div>

      <TrustBar />

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4">© 2026 בילדו · ספק רשמי Meta WhatsApp Business API</p>

      <ContactForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthLoss, potentialGain: r.monthGain }}
      />
    </div>
  );
}