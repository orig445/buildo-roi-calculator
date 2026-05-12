import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Phone, Mail, Building2, MessageSquare, TrendingDown, TrendingUp, Calendar, Search, RefreshCw } from "lucide-react";

const fmt = (n) => n ? `₪${Math.round(n).toLocaleString("he-IL")}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Admin() {
  const [search, setSearch] = useState("");

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 200),
  });

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return !q || [l.name, l.phone, l.email, l.company].some((f) => f?.toLowerCase().includes(q));
  });

  const totalLoss = leads.reduce((s, l) => s + (l.calculated_loss || 0), 0);
  const totalGain = leads.reduce((s, l) => s + (l.calculated_gain || 0), 0);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Heebo', sans-serif", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: "var(--forest)", borderBottom: "1px solid var(--gold)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png" alt="Bildo" style={{ height: 36, filter: "brightness(1.3)" }} />
          <div>
            <div className="font-label" style={{ fontSize: 8, color: "var(--gold-light)", letterSpacing: "0.18em" }}>ADMIN PANEL</div>
            <div className="font-display" style={{ fontSize: 18, color: "var(--gold-light)", fontWeight: 700 }}>ניהול לידים</div>
          </div>
        </div>
        <button onClick={() => refetch()} style={{ background: "none", border: "1px solid var(--gold-border)", borderRadius: 3, color: "var(--gold-light)", padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <RefreshCw style={{ width: 13, height: 13 }} /> רענן
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }} className="stats-grid">
          {[
            { label: "סה\"כ לידים", value: leads.length, icon: <MessageSquare style={{ width: 20, height: 20, color: "var(--gold)" }} />, color: "var(--ink)" },
            { label: "סה\"כ הפסד מצטבר", value: fmt(totalLoss), icon: <TrendingDown style={{ width: 20, height: 20, color: "var(--rust)" }} />, color: "var(--rust)" },
            { label: "פוטנציאל רווח מצטבר", value: fmt(totalGain), icon: <TrendingUp style={{ width: 20, height: 20, color: "var(--forest-mid)" }} />, color: "var(--forest-mid)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-v" style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: "var(--cream-mid)", borderRadius: 3, padding: 10, border: "1px solid var(--gold-border)" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Heebo',sans-serif" }}>{s.value}</div>
                <div className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--ink-light)" }} />
          <input
            type="text"
            placeholder="חיפוש לפי שם, טלפון, אימייל, חברה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-v"
            style={{ paddingRight: 36 }}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-light)" }}>טוען...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-light)" }}>לא נמצאו לידים</div>
        ) : (
          <div className="card-v" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                  {["שם", "טלפון", "אימייל", "חברה", "הפסד חודשי", "פוטנציאל", "הודעות/חודש", "הצטרף"].map((h) => (
                    <th key={h} className="font-label" style={{ fontSize: 8, letterSpacing: "0.12em", color: "var(--ink-light)", padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: "1px solid rgba(196,150,42,0.08)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>
                      {lead.name}
                      {lead.notes && <div style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 2 }}>{lead.notes}</div>}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <a href={`tel:${lead.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--forest-mid)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                        <Phone style={{ width: 12, height: 12 }} />{lead.phone}
                      </a>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--gold)", fontSize: 12, textDecoration: "none" }}>
                          <Mail style={{ width: 12, height: 12 }} />{lead.email}
                        </a>
                      ) : <span style={{ color: "var(--ink-light)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {lead.company ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-mid)" }}>
                          <Building2 style={{ width: 12, height: 12, color: "var(--ink-light)" }} />{lead.company}
                        </span>
                      ) : <span style={{ color: "var(--ink-light)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "13px 16px", color: "var(--rust)", fontWeight: 700, fontSize: 13 }}>
                      {lead.calculated_loss ? fmt(lead.calculated_loss) : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", color: "var(--forest-mid)", fontWeight: 700, fontSize: 13 }}>
                      {lead.calculated_gain ? `+${fmt(lead.calculated_gain)}` : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", color: "var(--ink-mid)", fontSize: 12 }}>
                      {lead.monthly_messages?.toLocaleString("he-IL") || "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-light)" }}>
                        <Calendar style={{ width: 11, height: 11 }} />{fmtDate(lead.created_date)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}