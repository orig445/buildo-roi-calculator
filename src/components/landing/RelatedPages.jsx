import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function RelatedPages({ links }) {
  if (!links?.length) return null;
  return (
    <section style={{ padding: "40px 20px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#555", margin: "0 0 16px" }}>You might also like</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.href}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#faf9ff", border: "1px solid #ede9fe",
                borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
                color: "#7c3aed", textDecoration: "none",
              }}
            >
              {l.label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}