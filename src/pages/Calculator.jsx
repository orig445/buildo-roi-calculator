import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContactForm from "@/components/calculator/ContactForm";
import TrustBar from "@/components/calculator/TrustBar";
import WebsiteAnalyzer from "@/components/calculator/WebsiteAnalyzer";
import { trackEvent } from "@/lib/analytics";

function SliderRow({ label, value, min, max, step, onChange, formatDisplay }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        <span className="text-base font-bold text-gray-900">{formatDisplay(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none cursor-pointer rounded-full"
        style={{
          background: `linear-gradient(to left, #22c55e ${pct}%, #e5e7eb ${pct}%)`,
          WebkitAppearance: 'none',
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="text-center py-3">
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`text-2xl font-bold tabular-nums ${color}`}
      >
        {value}
      </motion.div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

const fmt = (n) => `₪${Math.round(n).toLocaleString('he-IL')}`;

export default function Calculator() {
  const [messages, setMessages]   = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [showForm, setShowForm]   = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    trackEvent("page_view", "home", "landing");
  }, []);

  const handleSliderChange = (setter) => (value) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("calculator_start", "home", "sliders");
    }
    setter(value);
  };

  const handleCTA = () => {
    trackEvent("calculator_complete", "home", "cta", {
      messages, customers, dealValue,
      monthlyLoss: r.monthLoss, potentialGain: r.monthGain,
    });
    setShowForm(true);
  };

  const r = useMemo(() => {
    const lostRate  = 0.18;
    const liftRate  = 0.25;
    const lostCust  = Math.round(customers * lostRate);
    const monthLoss = lostCust * dealValue;
    const monthGain = Math.round(customers * liftRate) * dealValue;
    return {
      monthLoss, annualLoss: monthLoss * 12,
      monthGain, annualGain: monthGain * 12,
      lostCust,
      msgCost: Math.round(messages * 0.08),
    };
  }, [messages, customers, dealValue]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">

      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
            alt="Bildo"
            className="h-9"
          />
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">WhatsApp Business API</span>
            <button
              onClick={handleCTA}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors"
            >
              קבל הדגמה <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-10 text-center">
          <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-green-200">
            מחשבון ROI חינמי
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
            כמה כסף אתה מפסיד כל חודש בלי WhatsApp?
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            הכנס את פרטי העסק וגלה כמה כסף אתה מפסיד כל חודש
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* Website Analyzer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-semibold text-gray-700">מלא אוטומטית לפי האתר שלך</p>
          </div>
          <WebsiteAnalyzer
            onAnalyzed={({ messages, customers, dealValue }) => {
              setMessages(messages);
              setCustomers(customers);
              setDealValue(dealValue);
            }}
          />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* Sliders — 3 cols */}
          <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">הגדר את פרמטרי העסק</h2>
            <div className="space-y-6">
              <SliderRow
                label="הודעות וואטסאפ בחודש"
                value={messages} min={100} max={100000} step={100}
                onChange={handleSliderChange(setMessages)}
                formatDisplay={(v) => v.toLocaleString('he-IL')}
              />
              <SliderRow
                label="לקוחות / עסקאות בחודש"
                value={customers} min={10} max={5000} step={10}
                onChange={handleSliderChange(setCustomers)}
                formatDisplay={(v) => v.toLocaleString('he-IL')}
              />
              <SliderRow
                label="ערך ממוצע לעסקה"
                value={dealValue} min={100} max={50000} step={100}
                onChange={handleSliderChange(setDealValue)}
                formatDisplay={(v) => `₪${v.toLocaleString('he-IL')}`}
              />
            </div>

            {/* Mini stats */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>לקוחות אבודים:</span>
                <span className="font-semibold text-gray-700">{r.lostCust} / חודש</span>
              </div>
              <div className="flex justify-between">
                <span>עלות API:</span>
                <span className="font-semibold text-gray-700">₪{r.msgCost} / חודש</span>
              </div>
            </div>
          </div>

          {/* Results — 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Loss Card */}
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5 flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <span className="text-sm font-bold text-gray-700">מה אתה מפסיד היום</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help mr-auto" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-right">
                      <p className="text-xs leading-relaxed">
                        מחושב לפי 18% מהלקוחות שלך שלא מקבלים מענה מהיר ועוזבים — נתון מבוסס על מחקרי שוק. ההפסד = לקוחות אבודים × ערך עסקה ממוצע.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100">
                <StatCard label="חודשי" value={fmt(r.monthLoss)} color="text-red-500" />
                <StatCard label="שנתי" value={fmt(r.annualLoss)} color="text-red-400" />
              </div>
            </div>

            {/* Gain Card */}
            <div className="bg-white rounded-xl border border-green-100 shadow-sm p-5 flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-sm font-bold text-gray-700">הפוטנציאל עם בילדו</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help mr-auto" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-right">
                      <p className="text-xs leading-relaxed">
                        מחושב לפי שיפור של 25% בסגירת עסקאות בעזרת מענה אוטומטי מיידי, תזכורות חכמות וקמפיינים ממוקדים.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100">
                <StatCard label="רווח חודשי" value={`+${fmt(r.monthGain)}`} color="text-green-600" />
                <StatCard label="רווח שנתי" value={`+${fmt(r.annualGain)}`} color="text-green-500" />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCTA}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              קבל הדגמה חינם <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-center text-xs text-gray-400">ללא התחייבות · תגובה תוך 24 שעות</p>
          </div>

        </div>

        <TrustBar />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-6">
        <div className="max-w-5xl mx-auto px-5 py-4 text-center text-xs text-gray-400">
          © 2026 בילדו · שותף רשמי Meta · WhatsApp Business API
        </div>
      </footer>

      <ContactForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, monthlyLoss: r.monthLoss, potentialGain: r.monthGain }}
        source="home"
      />
    </div>
  );
}