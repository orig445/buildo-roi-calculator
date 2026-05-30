export default function ScoreGauge({ score, grade }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle
          cx="70" cy="70" r="54" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="70" y="64" textAnchor="middle" fontSize="28" fontWeight="900" fill={color} fontFamily="Heebo, sans-serif">{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="13" fontWeight="700" fill="#666" fontFamily="Heebo, sans-serif">Grade {grade}</text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {score >= 75 ? "Good" : score >= 50 ? "Needs Work" : "Poor"}
      </div>
    </div>
  );
}