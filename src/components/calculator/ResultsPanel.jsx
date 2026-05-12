import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, Zap } from "lucide-react";

function formatCurrency(n) {
  if (n >= 1000000) return `₪${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₪${(n / 1000).toFixed(0)}K`;
  return `₪${n.toLocaleString('he-IL')}`;
}

function AnimatedNumber({ value, prefix = "₪", suffix = "" }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="tabular-nums"
    >
      {prefix}{value.toLocaleString('he-IL')}{suffix}
    </motion.span>
  );
}

export default function ResultsPanel({ results, onCTAClick }) {
  const { monthlyLoss, annualLoss, potentialGain, annualGain, conversionBoost, messageCost } = results;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* LOSS Card */}
      <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">מה אתה מפסיד היום</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">הפסד חודשי</p>
            <p className="text-2xl font-black text-red-400">
              <AnimatedNumber value={monthlyLoss} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">הפסד שנתי</p>
            <p className="text-2xl font-black text-red-300">
              <AnimatedNumber value={annualLoss} />
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          * מבוסס על {conversionBoost}% לקוחות שלא מקבלים מענה אוטומטי ויוצאים
        </p>
      </div>

      {/* GAIN Card */}
      <div className="rounded-2xl p-6 border border-purple-500/30 bg-purple-500/8 card-glow">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300 uppercase tracking-wider">מה אפשר להרוויח עם בילדו</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">רווח חודשי</p>
            <p className="text-2xl font-black text-purple-300">
              +<AnimatedNumber value={potentialGain} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">רווח שנתי</p>
            <p className="text-2xl font-black text-purple-200">
              +<AnimatedNumber value={annualGain} />
            </p>
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      <div className="rounded-2xl p-5 border gold-border bg-yellow-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 gold-text" />
          <span className="text-sm font-semibold gold-text uppercase tracking-wider">סיכום ה-ROI שלך</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">עלות הודעה ממוצעת</p>
            <p className="text-lg font-bold text-foreground">₪{messageCost.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black gradient-text">
              {Math.round((annualGain / (messageCost * 12 * 1000)) * 100 / 10)}x
            </div>
            <p className="text-xs text-muted-foreground">ROI שנתי</p>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">החזר השקעה</p>
            <p className="text-lg font-bold gold-text">בתוך חודש</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCTAClick}
        className="w-full py-5 rounded-2xl text-lg font-bold text-white pulse-glow transition-all"
        style={{ background: 'linear-gradient(135deg, hsl(271 60% 45%) 0%, hsl(271 60% 60%) 100%)' }}
      >
        🚀 רוצה לראות את זה בפועל? קבל הדגמה חינם
      </motion.button>
    </motion.div>
  );
}