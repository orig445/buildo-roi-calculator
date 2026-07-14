import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Users, TrendingUp, Calculator, Loader2 } from "lucide-react";

const COLORS = ["#7c3aed", "#059669", "#dc6b19", "#0284c7", "#dc2626"];

function StatCard({ icon, label, value, sub, color = "#7c3aed" }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ background: color + "15", borderRadius: 10, padding: 10, color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#444" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.AnalyticsEvent.list("-created_date", 500),
    ]).then(([l, e]) => {
      setLeads(l);
      setEvents(e);
    }).finally(() => setLoading(false));
  }, []);

  // Derived stats
  const totalLeads = leads.length;
  const avgLoss = leads.length ? Math.round(leads.reduce((s, l) => s + (l.calculated_loss || 0), 0) / leads.length) : 0;
  const avgGain = leads.length ? Math.round(leads.reduce((s, l) => s + (l.calculated_gain || 0), 0) / leads.length) : 0;

  // Source distribution
  const sourceMap = leads.reduce((acc, l) => { acc[l.source || "home"] = (acc[l.source || "home"] || 0) + 1; return acc; }, {});
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Leads per day (last 14 days)
  const dayMap = {};
  leads.forEach(l => {
    const d = new Date(l.created_date).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dailyData = Object.entries(dayMap).slice(-14).map(([day, count]) => ({ day, count }));

  // Event counts by page
  const pageMap = events.reduce((acc, e) => { acc[e.page || "home"] = (acc[e.page || "home"] || 0) + 1; return acc; }, {});
  const pageData = Object.entries(pageMap).map(([page, count]) => ({ page, count }));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Heebo', sans-serif" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#7c3aed" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Heebo', sans-serif", color: "#000" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>Buildo</span>
        </Link>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>מרכז ניתוח דוחות</span>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 80px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>מרכז ניתוח דוחות</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 28 }}>נתונים בזמן אמת על לידים, ביצועים ומחשבונים</p>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          <StatCard icon={<Users size={20} />} label="סה״כ לידים" value={totalLeads} sub="מכל המקורות" color="#7c3aed" />
          <StatCard icon={<TrendingUp size={20} />} label="הפסד חודשי ממוצע" value={avgLoss ? `₪${avgLoss.toLocaleString()}` : "—"} sub="לפי נתוני המחשבון" color="#dc2626" />
          <StatCard icon={<TrendingUp size={20} />} label="רווח פוטנציאלי ממוצע" value={avgGain ? `₪${avgGain.toLocaleString()}` : "—"} sub="עם WhatsApp API" color="#059669" />
          <StatCard icon={<Calculator size={20} />} label="אירועי אנליטיקס" value={events.length} sub="מעקב פעולות משתמשים" color="#0284c7" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Daily leads */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>לידים לפי יום (14 ימים אחרונים)</h3>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="לידים" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{ color: "#999", fontSize: 13, textAlign: "center", paddingTop: 60 }}>אין נתונים עדיין</p>}
          </div>

          {/* Source pie */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>התפלגות לפי מקור</h3>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: "#999", fontSize: 13, textAlign: "center", paddingTop: 60 }}>אין נתונים עדיין</p>}
          </div>
        </div>

        {/* Events by page */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 18px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>ביצועי מחשבונים לפי דף</h3>
          {pageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pageData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} name="אירועים" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "#999", fontSize: 13, textAlign: "center", paddingTop: 40 }}>אין נתונים עדיין</p>}
        </div>
      </div>
    </div>
  );
}