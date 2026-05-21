import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Phone, Mail, Building2, MessageSquare, TrendingDown, TrendingUp, Calendar, Search, RefreshCw, BarChart2, Lock, Globe, Facebook } from "lucide-react";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import LeadActions from "@/components/admin/LeadActions";

const ALLOWED_EMAILS = ["orig445@gmail.com", "nevo@buildoai.com"];

const fmt = (n) => n ? `₪${Math.round(n).toLocaleString("he-IL")}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Admin() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("leads");
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user && ALLOWED_EMAILS.includes(user.email)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      setAuthChecked(true);
    }).catch(() => {
      setAllowed(false);
      setAuthChecked(true);
    });
  }, []);

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 200),
  });

  const { data: analyticsEvents = [], refetch: refetchAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => base44.entities.AnalyticsEvent.list("-created_date", 2000),
  });

  const { data: scannedSites = [], refetch: refetchSites } = useQuery({
    queryKey: ["scannedSites"],
    queryFn: () => base44.entities.ScannedSite.list("-created_date", 500),
  });

  const { data: fbLeads = [], refetch: refetchFbLeads } = useQuery({
    queryKey: ["fbLeads"],
    queryFn: () => base44.entities.FacebookLead.list("-created_date", 500),
  });

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return !q || [l.name, l.phone, l.email, l.company].some((f) => f?.toLowerCase().includes(q));
  });

  const totalLoss = leads.reduce((s, l) => s + (l.calculated_loss || 0), 0);
  const totalGain = leads.reduce((s, l) => s + (l.calculated_gain || 0), 0);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--gold-border)", borderTop: "3px solid var(--gold)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", fontFamily: "'Heebo', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <Lock style={{ width: 48, height: 48, color: "var(--gold)", margin: "0 auto 16px", display: "block" }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>אין גישה</h2>
          <p style={{ fontSize: 14, color: "var(--ink-light)", marginBottom: 24 }}>עמוד זה מוגבל למשתמשים מורשים בלבד.</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)} style={{ background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Heebo', sans-serif", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: "var(--forest)", borderBottom: "1px solid var(--gold)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 40, filter: "brightness(1.3) invert(1)" }} />
          <div>
            <div className="font-label" style={{ fontSize: 8, color: "var(--gold-light)", letterSpacing: "0.18em" }}>ADMIN PANEL</div>
            <div className="font-display" style={{ fontSize: 18, color: "var(--gold-light)", fontWeight: 700 }}>ניהול לידים</div>
          </div>
        </div>
        <button onClick={() => { refetch(); refetchAnalytics(); refetchSites(); refetchFbLeads(); }} style={{ background: "none", border: "1px solid var(--gold-border)", borderRadius: 3, color: "var(--gold-light)", padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <RefreshCw style={{ width: 13, height: 13 }} /> רענן
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "2px solid var(--gold-border)", paddingBottom: 0 }}>
          {[
            { key: "leads", label: "לידים", icon: <MessageSquare style={{ width: 13, height: 13 }} /> },
            { key: "analytics", label: "אנליטיקות", icon: <BarChart2 style={{ width: 13, height: 13 }} /> },
            { key: "sites", label: `אתרים שנסרקו (${scannedSites.length})`, icon: <Globe style={{ width: 13, height: 13 }} /> },
            { key: "fb", label: `פייסבוק לידים (${fbLeads.length})`, icon: <Facebook style={{ width: 13, height: 13 }} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 20px", fontSize: 13, fontWeight: 700,
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Heebo',sans-serif",
                color: tab === t.key ? "var(--forest)" : "var(--ink-light)",
                borderBottom: tab === t.key ? "2.5px solid var(--gold)" : "2.5px solid transparent",
                marginBottom: -2,
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" && (
          <AnalyticsDashboard events={analyticsEvents} />
        )}

        {tab === "sites" && (
          <div>
            {scannedSites.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-light)" }}>אין אתרים שנסרקו עדיין</div>
            ) : (
              <div className="card-v" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                      {["אתר", "שם עסק", "סוג עסק", "לקוחות/חודש", "ערך עסקה", "הודעות/חודש", "תאריך"].map((h) => (
                        <th key={h} className="font-label" style={{ fontSize: 8, letterSpacing: "0.12em", color: "var(--ink-light)", padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scannedSites.map((site, i) => (
                      <motion.tr
                        key={site.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        style={{ borderBottom: "1px solid rgba(196,150,42,0.08)", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "11px 16px" }}>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--forest-mid)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
                            <Globe style={{ width: 11, height: 11, flexShrink: 0 }} />
                            <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{site.url.replace(/^https?:\/\//, "")}</span>
                          </a>
                        </td>
                        <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{site.business_name || "—"}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--ink-mid)" }}>{site.business_type || "—"}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--ink-mid)", textAlign: "center" }}>{site.monthly_customers?.toLocaleString("he-IL") || "—"}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--forest-mid)", fontWeight: 700 }}>{site.avg_deal_value ? `₪${site.avg_deal_value.toLocaleString("he-IL")}` : "—"}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--ink-mid)", textAlign: "center" }}>{site.monthly_messages?.toLocaleString("he-IL") || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-light)" }}>
                            <Calendar style={{ width: 11, height: 11 }} />{fmtDate(site.created_date)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "fb" && (
          <div>
            {fbLeads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-light)" }}>
                אין לידים מפייסבוק עדיין — הסנכרון רץ כל 15 דקות
              </div>
            ) : (
              <div className="card-v" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                      {["שם", "טלפון", "טופס", "קמפיין", "מודעה", "סטטוס", "תאריך"].map((h) => (
                        <th key={h} className="font-label" style={{ fontSize: 8, letterSpacing: "0.12em", color: "var(--ink-light)", padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fbLeads.map((lead, i) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        style={{ borderBottom: "1px solid rgba(196,150,42,0.08)", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "13px 16px", fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{lead.full_name || "—"}</td>
                        <td style={{ padding: "13px 16px" }}>
                          {lead.phone_number ? (
                            <a href={`tel:${lead.phone_number}`} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--forest-mid)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                              <Phone style={{ width: 12, height: 12 }} />{lead.phone_number}
                            </a>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ink-mid)" }}>{lead.form_name || "—"}</td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ink-mid)" }}>{lead.campaign_name || "—"}</td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ink-mid)" }}>{lead.ad_name || "—"}</td>
                        <td style={{ padding: "13px 16px" }}>
                          {lead.lead_status ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(90,63,168,0.1)", color: "#5a3fa8", border: "1px solid rgba(90,63,168,0.25)" }}>
                              {lead.lead_status}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-light)" }}>
                            <Calendar style={{ width: 11, height: 11 }} />
                            {lead.created_time ? new Date(lead.created_time).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : fmtDate(lead.created_date)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "leads" && <>
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
                  {["שם", "טלפון", "אימייל", "חברה", "מקור", "הפסד חודשי", "פוטנציאל", "הודעות/חודש", "הצטרף", "שליחה"].map((h) => (
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
                    <td style={{ padding: "13px 16px" }}>
                      {lead.source ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                          background: lead.source === "v2" ? "rgba(90,63,168,0.1)" : "rgba(26,51,37,0.1)",
                          color: lead.source === "v2" ? "#5a3fa8" : "#1a3325",
                          border: `1px solid ${lead.source === "v2" ? "rgba(90,63,168,0.25)" : "rgba(26,51,37,0.2)"}`,
                        }}>
                          {lead.source === "v2" ? "🟣 /v2" : "🟢 דף הבית"}
                        </span>
                      ) : <span style={{ color: "var(--ink-light)", fontSize: 11 }}>—</span>}
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
                    <td style={{ padding: "10px 16px" }}>
                      <LeadActions lead={lead} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>}
      </div>
    </div>
  );
}