import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const FUNNEL_STEPS = [
  { key: "page_view",       label: "כניסה לדף",           icon: "👁️", event: "page_view" },
  { key: "scan_started",    label: "התחיל סריקת אתר",     icon: "🔍", event: "scan_started" },
  { key: "website_scanned", label: "סריקה הושלמה",        icon: "✅", event: "website_scanned" },
  { key: "cta_click",       label: "לחץ על כפתור CTA",   icon: "👆", event: "cta_click" },
  { key: "form_open",       label: "פתח טופס",            icon: "📋", event: "form_open" },
  { key: "form_submit",     label: "שלח טופס",            icon: "📤", event: "form_submit" },
  { key: "form_success",    label: "ליד הושלם ✓",         icon: "🎯", event: "form_success" },
];

const PAGE_LABELS = { v2: "דף /v2", home: "דף הבית", all: "הכל" };

function StatCard({ icon, label, value, sub, color = "#5a3fa8" }) {
  return (
    <div className="card-v" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "'Heebo',sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 3, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "var(--ink-light)", opacity: 0.7 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ events }) {
  const [filterPage, setFilterPage] = useState("all");

  const byPage = {
    all: events,
    v2: events.filter(e => e.page === "v2"),
    home: events.filter(e => e.page === "home"),
  };

  const filtered = byPage[filterPage] || events;

  // Unique sessions
  const uniqueSessions = useMemo(() => new Set(filtered.map(e => e.session_id).filter(Boolean)).size, [filtered]);

  // Count by event type
  const countByEvent = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.event] = (map[e.event] || 0) + 1; });
    return map;
  }, [filtered]);

  // Funnel data
  const funnelData = useMemo(() => {
    return FUNNEL_STEPS.map(step => ({
      ...step,
      count: countByEvent[step.event] || 0,
    }));
  }, [countByEvent]);

  const topStep = funnelData[0].count || 1;

  // Conversion rate: form_success / page_view
  const convRate = funnelData[0].count > 0
    ? ((funnelData[6].count / funnelData[0].count) * 100).toFixed(1)
    : "0";

  // Drop-off per step
  const withDropoff = funnelData.map((s, i) => ({
    ...s,
    prev: i > 0 ? funnelData[i - 1].count : s.count,
    dropoff: i > 0 ? Math.max(0, funnelData[i - 1].count - s.count) : 0,
    dropoffPct: i > 0 && funnelData[i - 1].count > 0
      ? (((funnelData[i - 1].count - s.count) / funnelData[i - 1].count) * 100).toFixed(0)
      : null,
  }));

  // CTA breakdown
  const ctaClicks = useMemo(() => {
    const map = {};
    filtered
      .filter(e => e.event === "cta_click" && e.meta)
      .forEach(e => {
        try {
          const m = JSON.parse(e.meta);
          const key = m.button || "unknown";
          map[key] = (map[key] || 0) + 1;
        } catch {}
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Events over last 7 days
  const last7Days = useMemo(() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })] = 0;
    }
    filtered.forEach(e => {
      const d = new Date(e.created_date);
      const key = d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
      if (key in days) days[key]++;
    });
    return Object.entries(days);
  }, [filtered]);

  const maxDay = Math.max(...last7Days.map(([, v]) => v), 1);

  return (
    <div>
      {/* Page filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "v2", "home"].map(p => (
          <button key={p} onClick={() => setFilterPage(p)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: "1.5px solid var(--gold-border)", fontFamily: "'Heebo',sans-serif",
              background: filterPage === p ? "var(--forest)" : "white",
              color: filterPage === p ? "var(--gold-light)" : "var(--ink-light)",
            }}>
            {PAGE_LABELS[p]}
          </button>
        ))}
        <span style={{ marginRight: "auto", fontSize: 12, color: "var(--ink-light)", alignSelf: "center" }}>
          סה"כ {filtered.length} אירועים · {uniqueSessions} סשנים
        </span>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }} className="stats-grid">
        <StatCard icon="👥" label="כניסות לדף" value={countByEvent["page_view"] || 0} />
        <StatCard icon="🔍" label="סרקו אתר" value={countByEvent["website_scanned"] || 0} sub={`${countByEvent["page_view"] ? ((countByEvent["website_scanned"] || 0) / countByEvent["page_view"] * 100).toFixed(0) : 0}% מהכניסות`} color="#2a7d55" />
        <StatCard icon="📋" label="פתחו טופס" value={countByEvent["form_open"] || 0} color="#c47a00" />
        <StatCard icon="🎯" label="המרה כוללת" value={`${convRate}%`} sub={`${countByEvent["form_success"] || 0} לידים`} color={parseFloat(convRate) > 5 ? "#2a7d55" : "#cc3333"} />
      </div>

      {/* Funnel */}
      <div className="card-v" style={{ padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 18 }}>📊 פאנל המרה</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {withDropoff.map((step, i) => {
            const pct = topStep > 0 ? (step.count / topStep) * 100 : 0;
            return (
              <div key={step.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{step.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", flex: 1, minWidth: 160 }}>{step.label}</span>
                  <div style={{ flex: 2, position: "relative" }}>
                    <div style={{ height: 20, borderRadius: 4, background: "var(--cream-dark)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        style={{
                          height: "100%", borderRadius: 4,
                          background: i === withDropoff.length - 1
                            ? "linear-gradient(to left, #2a7d55, #4daa7a)"
                            : "linear-gradient(to left, var(--forest-mid), #7c5cbf)",
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", width: 40, textAlign: "left" }}>{step.count}</span>
                  {step.dropoffPct !== null && step.dropoff > 0 && (
                    <span style={{ fontSize: 10, color: "#cc3333", fontWeight: 700, width: 60, textAlign: "left" }}>
                      ↓ {step.dropoffPct}% נטשו
                    </span>
                  )}
                  {step.dropoffPct !== null && step.dropoff === 0 && (
                    <span style={{ width: 60 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row: CTA breakdown + Daily activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* CTA clicks breakdown */}
        <div className="card-v" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>👆 לחיצות על כפתורים</div>
          {ctaClicks.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-light)", textAlign: "center", padding: "20px 0" }}>אין נתונים עדיין</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ctaClicks.map(([btn, count]) => {
                const total = ctaClicks.reduce((s, [, c]) => s + c, 0);
                const pct = total > 0 ? (count / total * 100).toFixed(0) : 0;
                return (
                  <div key={btn}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "var(--ink)", fontWeight: 600 }}>{btn}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--forest-mid)" }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--cream-dark)" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: "var(--forest-mid)", width: `${pct}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily activity */}
        <div className="card-v" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>📅 פעילות 7 ימים אחרונים</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {last7Days.map(([day, count]) => (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: "var(--forest-mid)", fontWeight: 700 }}>{count || ""}</div>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${(count / maxDay) * 60}px`, minHeight: count > 0 ? 4 : 0,
                  background: "linear-gradient(to top, var(--forest-mid), #7c5cbf)",
                  transition: "height 0.4s",
                }} />
                <div style={{ fontSize: 8, color: "var(--ink-light)", whiteSpace: "nowrap" }}>{day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}