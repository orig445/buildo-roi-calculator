import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function useAnimatedCounter(target, duration = 600) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    let start = null;
    let prev = null;
    let rafId;
    const step = (ts) => {
      if (!start) { start = ts; prev = display; }
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + (target - prev) * eased));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return display;
}

export default function AnimatedStat({ value, prefix = "₪", suffix = "", size = 26, color = "var(--ink)" }) {
  const displayed = useAnimatedCounter(Math.round(value));
  return (
    <motion.span
      key={Math.round(value / 500)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size,
        fontWeight: 900,
        color,
        display: "block",
        lineHeight: 1.2,
      }}
    >
      {prefix}{displayed.toLocaleString("he-IL")}{suffix}
    </motion.span>
  );
}