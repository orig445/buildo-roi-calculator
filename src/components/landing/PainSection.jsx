export default function PainSection({ audience, pain, useCases }) {
  return (
    <section style={{ background: "#faf9ff", padding: "60px 20px", borderBottom: "1px solid #ede9fe" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111", margin: "0 0 16px", textAlign: "center" }}>
          Marketing should not take your whole week
        </h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, textAlign: "center", maxWidth: 580, margin: "0 auto 36px" }}>
          {pain || `Most ${audience || "businesses"} know they need consistent marketing, but writing posts, building ads, and following up takes too much time. Buildo turns one business goal into a ready-to-approve campaign.`}
        </p>
        {useCases?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {useCases.map((u, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ede9fe", borderRadius: 10, padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#3b1f8c", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#7c3aed" }}>✓</span> {u}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}