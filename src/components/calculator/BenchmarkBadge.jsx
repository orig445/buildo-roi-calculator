const BENCHMARKS = {
  messages: [
    { max: 0.15, label: "נמוך לתעשייה", bg: "#FFF0ED", color: "var(--rust)", border: "rgba(139,58,26,0.2)" },
    { max: 0.5,  label: "ממוצע",        bg: "var(--gold-pale)", color: "var(--ink-mid)", border: "var(--gold-border)" },
    { max: 1,    label: "גבוה — מצוין!", bg: "#F0F7F3", color: "var(--forest-mid)", border: "rgba(26,51,37,0.2)" },
  ],
  customers: [
    { max: 0.15, label: "עסק קטן", bg: "#FFF0ED", color: "var(--rust)", border: "rgba(139,58,26,0.2)" },
    { max: 0.5,  label: "ממוצע",   bg: "var(--gold-pale)", color: "var(--ink-mid)", border: "var(--gold-border)" },
    { max: 1,    label: "עסק גדול!", bg: "#F0F7F3", color: "var(--forest-mid)", border: "rgba(26,51,37,0.2)" },
  ],
  dealValue: [
    { max: 0.15, label: "עסקה קטנה", bg: "#FFF0ED", color: "var(--rust)", border: "rgba(139,58,26,0.2)" },
    { max: 0.5,  label: "בינוני",    bg: "var(--gold-pale)", color: "var(--ink-mid)", border: "var(--gold-border)" },
    { max: 1,    label: "עסקה גדולה!", bg: "#F0F7F3", color: "var(--forest-mid)", border: "rgba(26,51,37,0.2)" },
  ],
};

export default function BenchmarkBadge({ value, min, max, type }) {
  const pct = (value - min) / (max - min);
  const list = BENCHMARKS[type] || BENCHMARKS.messages;
  const b = list.find((item) => pct <= item.max) || list[list.length - 1];
  return (
    <span style={{
      fontSize: 9, padding: "2px 8px", borderRadius: 2,
      fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "0.1em",
      textTransform: "uppercase", whiteSpace: "nowrap",
      background: b.bg, color: b.color,
      border: `1px solid ${b.border}`,
    }}>
      {b.label}
    </span>
  );
}