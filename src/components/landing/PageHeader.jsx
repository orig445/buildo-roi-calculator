import { Link } from "react-router-dom";

export default function PageHeader() {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Buildo" style={{ height: 32 }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>Buildo</span>
      </Link>
      <a
        href="https://buildoai.com/worker-onboarding"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#7c3aed", color: "#fff", textDecoration: "none",
          borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 800,
          fontFamily: "'Heebo', sans-serif",
        }}
      >
        Try Free →
      </a>
    </header>
  );
}