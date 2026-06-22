import { useState, useEffect, useCallback, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, Globe, FileText, Settings, RefreshCw, Lock,
  BarChart2, Eye, MousePointer, ArrowUpRight, ArrowDownRight,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Edit3, Save, X, Plus, Trash2, Tag, Calendar, Activity, Zap,
  BookOpen, Link2, Star, Target, Info
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const ALLOWED_EMAILS = ["orig445@gmail.com", "nevo@buildoai.com"];

// ─── helpers ───────────────────────────────────────────────────────────────
const fmt = (n, dec = 0) =>
  n == null ? "—" : Number(n).toLocaleString("he-IL", { maximumFractionDigits: dec });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";
const pct = (n) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`);
const diffColor = (v) => (v > 0 ? "#2D5C3F" : v < 0 ? "#8B3A1A" : "var(--ink-light)");
const diffIcon = (v) =>
  v > 0 ? <ArrowUpRight style={{ width: 11, height: 11 }} /> : v < 0 ? <ArrowDownRight style={{ width: 11, height: 11 }} /> : null;

function Badge({ children, color = "var(--gold)", bg = "rgba(196,150,42,0.12)" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: bg, color, border: `1px solid ${color}33` }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color = "var(--gold)", trend }) {
  return (
    <div className="card-v" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ background: "var(--cream-mid)", borderRadius: 6, padding: 10, border: "1px solid var(--gold-border)", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Heebo',sans-serif", lineHeight: 1.1 }}>{value}</div>
        <div className="font-label" style={{ fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", marginTop: 3 }}>{label}</div>
        {trend != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4, fontSize: 11, fontWeight: 700, color: diffColor(trend) }}>
            {diffIcon(trend)} {trend > 0 ? "+" : ""}{trend > 0 || trend < 0 ? `${Math.abs(trend).toFixed(1)}%` : "ללא שינוי"}
          </div>
        )}
        {sub && <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--gold)" }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{title}</span>
      </div>
      {action}
    </div>
  );
}

// ─── Settings Storage ───────────────────────────────────────────────────────
const SETTINGS_KEY = "buildo_seo_admin_settings";
const defaultSettings = {
  framerToken: "",
  gscSiteUrl: "",
  gscToken: "",
  buildoBlogUrl: "",
  buildoBlogToken: "",
  trendsProxy: "",
  targetKeywords: "בילדו, AI שיווק, שיווק דיגיטלי, כלים שיווקיים",
};
const loadSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const merged = { ...defaultSettings, ...stored };
    // Ensure string fields are always strings
    for (const k of Object.keys(defaultSettings)) {
      if (typeof defaultSettings[k] === "string" && typeof merged[k] !== "string") {
        merged[k] = defaultSettings[k];
      }
    }
    return merged;
  } catch { return defaultSettings; }
};
const saveSettings = (s) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

// ─── API Clients ────────────────────────────────────────────────────────────
// All Framer calls go through a backend proxy to avoid CORS restrictions
async function framerCall(payload) {
  let res;
  try {
    res = await base44.functions.invoke("framerProxy", payload);
  } catch (e) {
    // base44 SDK throws on non-2xx — extract message from response if possible
    throw new Error(e?.response?.data?.error || e?.message || "שגיאת שרת");
  }
  if (res?.error) throw new Error(res.error);
  return res;
}

async function fetchFramerCollections(token) {
  if (!token) throw new Error("חסר טוקן Framer");
  return framerCall({ token, action: "collections" });
}

async function fetchFramerCMS(token, collectionId) {
  if (!token || !collectionId) throw new Error("חסר טוקן או Collection ID");
  return framerCall({ token, collectionId, action: "items" });
}

async function updateFramerItem(token, collectionId, itemId, fieldData) {
  return framerCall({ token, collectionId, itemId, fieldData, action: "update" });
}

async function fetchGSC(siteUrl, token, days = 28) {
  if (!siteUrl || !token) throw new Error("חסר Site URL או טוקן GSC");
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 86400000);
  const fmt8 = (d) => d.toISOString().slice(0, 10);
  const body = { startDate: fmt8(startDate), endDate: fmt8(endDate), dimensions: ["query"], rowLimit: 50 };
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`GSC: ${res.status}`);
  return res.json();
}

async function fetchGSCPages(siteUrl, token, days = 28) {
  if (!siteUrl || !token) throw new Error("חסר Site URL או טוקן GSC");
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 86400000);
  const fmt8 = (d) => d.toISOString().slice(0, 10);
  const body = { startDate: fmt8(startDate), endDate: fmt8(endDate), dimensions: ["page"], rowLimit: 50 };
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`GSC Pages: ${res.status}`);
  return res.json();
}

async function fetchGSCSummary(siteUrl, token, days = 28) {
  if (!siteUrl || !token) throw new Error("חסר Site URL או טוקן GSC");
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 86400000);
  const prev = new Date(Date.now() - days * 2 * 86400000);
  const fmt8 = (d) => d.toISOString().slice(0, 10);

  const [curr, prevR] = await Promise.all([
    fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: fmt8(startDate), endDate: fmt8(endDate), dimensions: [] }),
    }).then((r) => r.json()),
    fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: fmt8(prev), endDate: fmt8(startDate), dimensions: [] }),
    }).then((r) => r.json()),
  ]);
  return { current: curr.rows?.[0] || {}, previous: prevR.rows?.[0] || {} };
}

async function buildoApi(_baseUrl, _apiKey, path, method = "GET", body = null) {
  // credentials are stored securely in base44 secrets — only path/method needed
  let res;
  try {
    res = await base44.functions.invoke("blogProxy", { path, method, payload: body });
  } catch (e) {
    throw new Error(e?.response?.data?.error || e?.message || "שגיאת שרת");
  }
  if (res?.error) throw new Error(res.error);
  return res;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ConnectionStatus({ label, ok, error, loading }) {
  if (loading) return <span style={{ fontSize: 11, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 4 }}><RefreshCw style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />{label}</span>;
  if (ok) return <span style={{ fontSize: 11, color: "#2D5C3F", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle style={{ width: 11, height: 11 }} />{label} — מחובר</span>;
  return <span style={{ fontSize: 11, color: "var(--rust)", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 11, height: 11 }} />{label}{error ? ` — ${error}` : " — לא מחובר"}</span>;
}

// ─── Settings Panel ─────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, onClose, onTest, testResults }) {
  const [local, setLocal] = useState(settings);
  const set = (k, v) => setLocal((p) => ({ ...p, [k]: v }));
  const handleSave = () => { onChange(local); saveSettings(local); onClose(); };

  const Field = ({ label, k, placeholder, type = "text", hint }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={local[k] || ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="input-v"
        style={{ width: "100%", fontSize: 12 }}
      />
      {hint && <div style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 3 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--cream)", border: "1px solid var(--gold-border)", borderRadius: 10, padding: 28, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)" }}>הגדרות API</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-light)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        <div style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 12 }}>FRAMER CMS</div>
          <Field label="Framer API Token" k="framerToken" type="password" placeholder="fmr_xxxxxxxxxxxxxxxx" hint="ניתן ליצור ב-Framer Dashboard → Project Settings → CMS → API" />
          {testResults?.framer && <div style={{ fontSize: 11, color: testResults.framer.ok ? "#2D5C3F" : "var(--rust)", marginTop: -8, marginBottom: 10 }}>{testResults.framer.msg}</div>}
          <button onClick={() => onTest("framer", local)} style={{ fontSize: 11, padding: "5px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>בדוק חיבור ושלוף קולקשנים</button>
        </div>

        <div style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 12 }}>GOOGLE SEARCH CONSOLE</div>
          <Field label="Site URL" k="gscSiteUrl" placeholder="https://buildoai.com" hint="ה-URL המדויק כפי שמופיע ב-Search Console" />
          <Field label="Access Token (OAuth2)" k="gscToken" type="password" placeholder="ya29.xxxxxxxx" hint="ניתן לקבל דרך Google OAuth Playground → webmasters.readonly" />
          {testResults?.gsc && <div style={{ fontSize: 11, color: testResults.gsc.ok ? "#2D5C3F" : "var(--rust)", marginTop: -8, marginBottom: 10 }}>{testResults.gsc.msg}</div>}
          <button onClick={() => onTest("gsc", local)} style={{ fontSize: 11, padding: "5px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>בדוק חיבור</button>
        </div>

        <div style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 12 }}>BUILDO BLOG API</div>
          <div style={{ padding: "10px 14px", background: "rgba(45,92,63,0.08)", borderRadius: 6, border: "1px solid rgba(45,92,63,0.2)", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#2D5C3F", fontWeight: 700, marginBottom: 3 }}>✓ Credentials שמורים ב-base44 Secrets</div>
            <div style={{ fontSize: 10, color: "var(--ink-light)" }}>
              <code>BlogAPIBaseURL</code> ו-<code>buildoblogapikey</code> — מנוהלים בצד שרת בלבד
            </div>
          </div>
          {testResults?.blog && <div style={{ fontSize: 11, color: testResults.blog.ok ? "#2D5C3F" : "var(--rust)", marginBottom: 10 }}>{testResults.blog.msg}</div>}
          <button onClick={() => onTest("blog", local)} style={{ fontSize: 11, padding: "5px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>בדוק חיבור</button>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 12 }}>GOOGLE TRENDS</div>
          <Field label="מילות מפתח למעקב" k="targetKeywords" placeholder="בילדו, AI שיווק, כלים שיווקיים" hint='רשימה מופרדת בפסיקים — יוצגו גרפים ישירות מ-Google Trends' />
          <Field label="Trends Proxy URL (אופציונלי)" k="trendsProxy" placeholder="https://your-proxy.com/trends" hint="אם יש שרת proxy לעקיפת CORS של Google Trends API" />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: "'Heebo',sans-serif", color: "var(--ink-mid)" }}>ביטול</button>
          <button onClick={handleSave} style={{ padding: "8px 20px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 5, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Heebo',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            <Save style={{ width: 13, height: 13 }} /> שמור הגדרות
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Framer CMS Tab ─────────────────────────────────────────────────────────
function FramerCMSTab({ settings }) {
  const [collections, setCollections] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(settings.framerCollectionId || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [search, setSearch] = useState("");

  // Step 1: fetch all collections when token is ready
  const loadCollections = useCallback(async () => {
    if (!settings.framerToken) return;
    setCollectionsLoading(true); setError(null);
    try {
      const res = await fetchFramerCollections(settings.framerToken);
      const cols = res.collections || res.items || res || [];
      setCollections(cols);
      // auto-select first if none selected
      if (!selectedCollectionId && cols.length > 0) {
        setSelectedCollectionId(cols[0].id);
      }
    } catch (e) { setError(e.message); }
    finally { setCollectionsLoading(false); }
  }, [settings.framerToken]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  // Step 2: fetch items when a collection is selected
  const load = useCallback(async () => {
    if (!settings.framerToken || !selectedCollectionId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetchFramerCMS(settings.framerToken, selectedCollectionId);
      setData(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [settings.framerToken, selectedCollectionId]);

  useEffect(() => { if (selectedCollectionId) load(); }, [load]);

  const startEdit = (item) => {
    setEditing(item.id);
    setEditFields({
      slug: item.fieldData?.slug || "",
      name: item.fieldData?.name || item.fieldData?.title || "",
      "seo-title": item.fieldData?.["seo-title"] || item.fieldData?.seoTitle || "",
      "seo-description": item.fieldData?.["seo-description"] || item.fieldData?.seoDescription || "",
      "canonical-url": item.fieldData?.["canonical-url"] || "",
    });
  };

  const handleSave = async (itemId) => {
    setSaving(true); setSaveMsg(null);
    try {
      await updateFramerItem(settings.framerToken, selectedCollectionId, itemId, editFields);
      setSaveMsg({ ok: true, text: "נשמר בהצלחה!" });
      setEditing(null);
      await load();
    } catch (e) { setSaveMsg({ ok: false, text: e.message }); }
    finally { setSaving(false); }
  };

  const items = (data?.items || []).filter((item) => {
    const q = search.toLowerCase();
    const name = (item.fieldData?.name || item.fieldData?.title || "").toLowerCase();
    const slug = (item.fieldData?.slug || "").toLowerCase();
    return !q || name.includes(q) || slug.includes(q);
  });

  if (!settings.framerToken) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Settings style={{ width: 36, height: 36, color: "var(--gold)", margin: "0 auto 12px", display: "block" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>יש להגדיר Framer API Token</div>
        <div style={{ fontSize: 13, color: "var(--ink-light)" }}>הגדר את ה-Token בהגדרות — הקולקשנים יישלפו אוטומטית</div>
      </div>
    );
  }

  return (
    <div>
      {/* Collection picker */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", marginBottom: 5 }}>קולקשן</div>
        {collectionsLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-light)" }}>
            <RefreshCw style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> שולף קולקשנים...
          </div>
        )}
        {!collectionsLoading && collections && collections.length > 0 && (
          <select
            value={selectedCollectionId}
            onChange={(e) => { setSelectedCollectionId(e.target.value); setData(null); }}
            className="input-v"
            style={{ fontSize: 13, fontWeight: 600, maxWidth: 380 }}
          >
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name || col.slug || col.id}
              </option>
            ))}
          </select>
        )}
        {!collectionsLoading && collections && collections.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--rust)" }}>לא נמצאו קולקשנים</div>
        )}
        {!collectionsLoading && !collections && error && (
          <div>
            <div style={{ fontSize: 12, color: "var(--rust)", marginBottom: 10 }}>{error}</div>
            <div style={{ fontSize: 11, color: "var(--ink-light)", marginBottom: 6 }}>הכנס Collection ID ידנית:</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-v"
                placeholder="e.g. abc123def456"
                style={{ fontSize: 12, maxWidth: 260 }}
                onKeyDown={(e) => { if (e.key === "Enter") { setSelectedCollectionId(e.currentTarget.value); setCollections([{ id: e.currentTarget.value, name: e.currentTarget.value }]); } }}
              />
              <button
                style={{ fontSize: 11, padding: "5px 14px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 4, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}
                onClick={(e) => { const inp = e.currentTarget.previousSibling; if (inp?.value) { setSelectedCollectionId(inp.value); setCollections([{ id: inp.value, name: inp.value }]); } }}>
                טען
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--ink-light)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש פוסטים..." className="input-v" style={{ paddingRight: 30, fontSize: 12 }} />
        </div>
        <button onClick={load} disabled={!selectedCollectionId} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 12, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif", opacity: selectedCollectionId ? 1 : 0.4 }}>
          <RefreshCw style={{ width: 12, height: 12, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} /> רענן
        </button>
      </div>

      {saveMsg && <div style={{ marginBottom: 12, padding: "8px 14px", borderRadius: 5, background: saveMsg.ok ? "rgba(45,92,63,0.1)" : "rgba(139,58,26,0.1)", color: saveMsg.ok ? "#2D5C3F" : "var(--rust)", fontSize: 12, border: `1px solid ${saveMsg.ok ? "#2D5C3F44" : "var(--rust)44"}` }}>{saveMsg.text}</div>}

      {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-light)" }}>טוען מ-Framer CMS...</div>}
      {!loading && error && collections && <div style={{ padding: "12px 16px", background: "rgba(139,58,26,0.08)", border: "1px solid var(--rust)33", borderRadius: 6, color: "var(--rust)", fontSize: 12, marginBottom: 12 }}><AlertCircle style={{ width: 13, height: 13, display: "inline", marginLeft: 5 }} />{error}</div>}
      {error && <div style={{ padding: "12px 16px", background: "rgba(139,58,26,0.08)", border: "1px solid var(--rust)33", borderRadius: 6, color: "var(--rust)", fontSize: 12, marginBottom: 12 }}><AlertCircle style={{ width: 13, height: 13, display: "inline", marginLeft: 5 }} />{error}</div>}

      {!loading && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => {
            const fd = item.fieldData || {};
            const name = fd.name || fd.title || item.id;
            const slug = fd.slug || "";
            const seoTitle = fd["seo-title"] || fd.seoTitle || "";
            const seoDesc = fd["seo-description"] || fd.seoDescription || "";
            const isEditing = editing === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-v"
                style={{ padding: "16px 20px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{name}</div>
                    {slug && <div style={{ fontSize: 11, color: "var(--ink-light)", marginBottom: 6 }}>/{slug}</div>}
                    {!isEditing && (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <span style={{ fontSize: 9, color: "var(--ink-light)", fontWeight: 700, letterSpacing: "0.08em" }}>SEO TITLE: </span>
                          <span style={{ fontSize: 11, color: seoTitle ? "var(--ink-mid)" : "var(--rust-light)" }}>{seoTitle || "חסר"}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: "var(--ink-light)", fontWeight: 700, letterSpacing: "0.08em" }}>META DESC: </span>
                          <span style={{ fontSize: 11, color: seoDesc ? "var(--ink-mid)" : "var(--rust-light)" }}>{seoDesc ? `${seoDesc.substring(0, 60)}${seoDesc.length > 60 ? "..." : ""}` : "חסר"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!isEditing ? (
                      <button onClick={() => startEdit(item)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", fontSize: 11, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>
                        <Edit3 style={{ width: 11, height: 11 }} /> ערוך SEO
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleSave(item.id)} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Heebo',sans-serif" }}>
                          <Save style={{ width: 11, height: 11 }} /> {saving ? "שומר..." : "שמור"}
                        </button>
                        <button onClick={() => setEditing(null)} style={{ padding: "5px 10px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", color: "var(--ink-light)", fontFamily: "'Heebo',sans-serif" }}>
                          <X style={{ width: 11, height: 11 }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 14, borderTop: "1px solid var(--gold-border)", paddingTop: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>SLUG</label>
                        <input value={editFields.slug} onChange={(e) => setEditFields(p => ({ ...p, slug: e.target.value }))} className="input-v" style={{ fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>CANONICAL URL</label>
                        <input value={editFields["canonical-url"]} onChange={(e) => setEditFields(p => ({ ...p, "canonical-url": e.target.value }))} className="input-v" style={{ fontSize: 12 }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>SEO TITLE <span style={{ color: editFields["seo-title"]?.length > 60 ? "var(--rust)" : "var(--forest-mid)" }}>({editFields["seo-title"]?.length || 0}/60)</span></label>
                      <input value={editFields["seo-title"]} onChange={(e) => setEditFields(p => ({ ...p, "seo-title": e.target.value }))} className="input-v" style={{ fontSize: 12, borderColor: editFields["seo-title"]?.length > 60 ? "var(--rust)" : undefined }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>META DESCRIPTION <span style={{ color: editFields["seo-description"]?.length > 160 ? "var(--rust)" : "var(--forest-mid)" }}>({editFields["seo-description"]?.length || 0}/160)</span></label>
                      <textarea value={editFields["seo-description"]} onChange={(e) => setEditFields(p => ({ ...p, "seo-description": e.target.value }))} rows={2} className="input-v" style={{ fontSize: 12, resize: "vertical", borderColor: editFields["seo-description"]?.length > 160 ? "var(--rust)" : undefined }} />
                    </div>
                    {/* Google Preview */}
                    <div style={{ marginTop: 12, padding: "12px 14px", background: "#fff", borderRadius: 6, border: "1px solid #e0e0e0" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 6 }}>תצוגה מקדימה בגוגל</div>
                      <div style={{ fontSize: 14, color: "#1a0dab", fontFamily: "Arial, sans-serif", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editFields["seo-title"] || name}</div>
                      <div style={{ fontSize: 12, color: "#006621", fontFamily: "Arial, sans-serif", marginBottom: 2 }}>{settings.gscSiteUrl || "https://buildoai.com"}/{editFields.slug}</div>
                      <div style={{ fontSize: 13, color: "#545454", fontFamily: "Arial, sans-serif", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{editFields["seo-description"] || "אין תיאור"}</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && items.length === 0 && data && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink-light)", fontSize: 13 }}>אין פוסטים בקולקשן זה</div>
      )}
    </div>
  );
}

// ─── Search Console Tab ──────────────────────────────────────────────────────
function SearchConsoleTab({ settings }) {
  const [keywords, setKeywords] = useState(null);
  const [pages, setPages] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(28);
  const [kwSort, setKwSort] = useState("clicks");
  const [pgSort, setPgSort] = useState("clicks");

  const load = useCallback(async () => {
    if (!settings.gscSiteUrl || !settings.gscToken) return;
    setLoading(true); setError(null);
    try {
      const [kw, pg, sum] = await Promise.all([
        fetchGSC(settings.gscSiteUrl, settings.gscToken, days),
        fetchGSCPages(settings.gscSiteUrl, settings.gscToken, days),
        fetchGSCSummary(settings.gscSiteUrl, settings.gscToken, days),
      ]);
      setKeywords(kw?.rows || []);
      setPages(pg?.rows || []);
      setSummary(sum);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [settings.gscSiteUrl, settings.gscToken, days]);

  useEffect(() => { load(); }, [load]);

  const sortedKw = [...(keywords || [])].sort((a, b) => (b[kwSort] || 0) - (a[kwSort] || 0));
  const sortedPg = [...(pages || [])].sort((a, b) => (b[pgSort] || 0) - (a[pgSort] || 0));

  const trendPct = (curr, prev) => prev > 0 ? ((curr - prev) / prev) * 100 : null;

  const curr = summary?.current || {};
  const prev = summary?.previous || {};

  if (!settings.gscSiteUrl || !settings.gscToken) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Search style={{ width: 36, height: 36, color: "var(--gold)", margin: "0 auto 12px", display: "block" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>יש להגדיר Google Search Console</div>
        <div style={{ fontSize: 13, color: "var(--ink-light)" }}>הגדר Site URL ו-Access Token בהגדרות</div>
      </div>
    );
  }

  const ThBtn = ({ col, current, onSort, label }) => (
    <th onClick={() => onSort(col)} style={{ padding: "10px 14px", textAlign: "right", cursor: "pointer", userSelect: "none" }}>
      <span className="font-label" style={{ fontSize: 8, letterSpacing: "0.12em", color: current === col ? "var(--gold)" : "var(--ink-light)", fontWeight: 700 }}>
        {label} {current === col ? "▾" : ""}
      </span>
    </th>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        {[7, 28, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${days === d ? "var(--gold)" : "var(--gold-border)"}`, background: days === d ? "var(--gold)" : "none", color: days === d ? "var(--cream)" : "var(--ink-mid)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>
            {d} יום
          </button>
        ))}
        <button onClick={load} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>
          <RefreshCw style={{ width: 12, height: 12, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} /> רענן
        </button>
      </div>

      {error && <div style={{ padding: "10px 14px", background: "rgba(139,58,26,0.08)", border: "1px solid var(--rust)33", borderRadius: 6, color: "var(--rust)", fontSize: 12, marginBottom: 14 }}>{error}</div>}

      {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-light)" }}>טוען נתוני Search Console...</div>}

      {!loading && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
          <StatCard label="קליקים" value={fmt(curr.clicks)} trend={trendPct(curr.clicks, prev.clicks)} icon={<MousePointer style={{ width: 18, height: 18, color: "var(--gold)" }} />} color="var(--ink)" />
          <StatCard label="חשיפות" value={fmt(curr.impressions)} trend={trendPct(curr.impressions, prev.impressions)} icon={<Eye style={{ width: 18, height: 18, color: "var(--gold)" }} />} color="var(--ink)" />
          <StatCard label="CTR" value={pct(curr.ctr)} trend={trendPct(curr.ctr, prev.ctr)} icon={<Target style={{ width: 18, height: 18, color: "var(--gold)" }} />} color="var(--forest-mid)" />
          <StatCard label="מיקום ממוצע" value={curr.position ? curr.position.toFixed(1) : "—"} trend={prev.position ? -(curr.position - prev.position) : null} icon={<Star style={{ width: 18, height: 18, color: "var(--gold)" }} />} color="var(--gold)" />
        </div>
      )}

      {!loading && sortedKw.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <SectionHeader icon={<Search style={{ width: 15, height: 15 }} />} title="מילות מפתח מובילות" />
          <div className="card-v" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}><span className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", letterSpacing: "0.12em" }}>ביטוי</span></th>
                  <ThBtn col="clicks" current={kwSort} onSort={setKwSort} label="קליקים" />
                  <ThBtn col="impressions" current={kwSort} onSort={setKwSort} label="חשיפות" />
                  <ThBtn col="ctr" current={kwSort} onSort={setKwSort} label="CTR" />
                  <ThBtn col="position" current={kwSort} onSort={setKwSort} label="מיקום" />
                </tr>
              </thead>
              <tbody>
                {sortedKw.slice(0, 30).map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(196,150,42,0.07)", transition: "background .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--ink)", fontSize: 12 }}>{row.keys?.[0]}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-mid)", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{fmt(row.clicks)}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-light)", fontSize: 12, textAlign: "center" }}>{fmt(row.impressions)}</td>
                    <td style={{ padding: "10px 14px", color: "var(--forest-mid)", fontSize: 12, fontWeight: 700, textAlign: "center" }}>{pct(row.ctr)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: row.position <= 3 ? "#2D5C3F" : row.position <= 10 ? "var(--gold)" : "var(--rust-light)", background: row.position <= 3 ? "rgba(45,92,63,0.1)" : row.position <= 10 ? "rgba(196,150,42,0.1)" : "rgba(196,98,58,0.1)", padding: "2px 8px", borderRadius: 20 }}>
                        #{row.position?.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && sortedPg.length > 0 && (
        <div>
          <SectionHeader icon={<FileText style={{ width: 15, height: 15 }} />} title="דפים מובילים" />
          <div className="card-v" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}><span className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", letterSpacing: "0.12em" }}>URL</span></th>
                  <ThBtn col="clicks" current={pgSort} onSort={setPgSort} label="קליקים" />
                  <ThBtn col="impressions" current={pgSort} onSort={setPgSort} label="חשיפות" />
                  <ThBtn col="ctr" current={pgSort} onSort={setPgSort} label="CTR" />
                  <ThBtn col="position" current={pgSort} onSort={setPgSort} label="מיקום" />
                </tr>
              </thead>
              <tbody>
                {sortedPg.slice(0, 25).map((row, i) => {
                  const url = row.keys?.[0] || "";
                  const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(196,150,42,0.07)", transition: "background .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
                      <td style={{ padding: "10px 14px" }}>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--forest-mid)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink style={{ width: 10, height: 10, flexShrink: 0 }} />
                          <span style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path}</span>
                        </a>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--ink-mid)", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{fmt(row.clicks)}</td>
                      <td style={{ padding: "10px 14px", color: "var(--ink-light)", fontSize: 12, textAlign: "center" }}>{fmt(row.impressions)}</td>
                      <td style={{ padding: "10px 14px", color: "var(--forest-mid)", fontSize: 12, fontWeight: 700, textAlign: "center" }}>{pct(row.ctr)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: row.position <= 3 ? "#2D5C3F" : row.position <= 10 ? "var(--gold)" : "var(--rust-light)", background: row.position <= 3 ? "rgba(45,92,63,0.1)" : row.position <= 10 ? "rgba(196,150,42,0.1)" : "rgba(196,98,58,0.1)", padding: "2px 8px", borderRadius: 20 }}>
                          #{row.position?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && keywords?.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink-light)", fontSize: 13 }}>לא נמצאו נתונים לתקופה זו</div>
      )}
    </div>
  );
}

// ─── Google Trends Tab ───────────────────────────────────────────────────────
function TrendsTab({ settings }) {
  const keywords = settings.targetKeywords
    ? settings.targetKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const [proxyData, setProxyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proxyError, setProxyError] = useState(null);

  const loadProxy = useCallback(async () => {
    if (!settings.trendsProxy || !keywords.length) return;
    setLoading(true); setProxyError(null);
    try {
      const qs = keywords.map((k) => `keyword=${encodeURIComponent(k)}`).join("&");
      const res = await fetch(`${settings.trendsProxy}?${qs}`);
      if (!res.ok) throw new Error(`${res.status}`);
      setProxyData(await res.json());
    } catch (e) { setProxyError(e.message); }
    finally { setLoading(false); }
  }, [settings.trendsProxy, settings.targetKeywords]);

  useEffect(() => { loadProxy(); }, [loadProxy]);

  const trendsLinks = keywords.map((kw) => ({
    kw,
    url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(kw)}&geo=IL`,
  }));

  return (
    <div>
      {keywords.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <TrendingUp style={{ width: 36, height: 36, color: "var(--gold)", margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>הגדר מילות מפתח למעקב</div>
          <div style={{ fontSize: 13, color: "var(--ink-light)" }}>הוסף מילות מפתח בהגדרות תחת "Google Trends"</div>
        </div>
      )}

      {keywords.length > 0 && (
        <>
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={<TrendingUp style={{ width: 15, height: 15 }} />} title="מילות מפתח למעקב" action={
              <div style={{ display: "flex", gap: 6 }}>
                {settings.trendsProxy && (
                  <button onClick={loadProxy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", fontSize: 11, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>
                    <RefreshCw style={{ width: 11, height: 11, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} /> עדכן
                  </button>
                )}
              </div>
            } />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {keywords.map((kw) => (
                <Badge key={kw}>{kw}</Badge>
              ))}
            </div>
          </div>

          {proxyError && (
            <div style={{ padding: "10px 14px", background: "rgba(139,58,26,0.08)", borderRadius: 6, color: "var(--rust)", fontSize: 12, marginBottom: 14, border: "1px solid var(--rust)33" }}>
              Proxy Error: {proxyError}
            </div>
          )}

          {/* Direct Google Trends Links */}
          <div style={{ marginBottom: 24 }}>
            <SectionHeader icon={<ExternalLink style={{ width: 15, height: 15 }} />} title="קישורים ישירים ל-Google Trends" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trendsLinks.map(({ kw, url }) => (
                <div key={kw} className="card-v" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp style={{ width: 14, height: 14, color: "var(--gold)" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{kw}</span>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--forest-mid)", textDecoration: "none", fontWeight: 700, padding: "4px 10px", border: "1px solid var(--gold-border)", borderRadius: 4 }}>
                    פתח ב-Google Trends <ExternalLink style={{ width: 10, height: 10 }} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Link */}
          <div className="card-v" style={{ padding: "16px 20px", background: "var(--cream-mid)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart2 style={{ width: 14, height: 14, color: "var(--gold)" }} /> השוואה בין כל מילות המפתח
            </div>
            <a href={`https://trends.google.com/trends/explore?q=${keywords.slice(0, 5).map((k) => encodeURIComponent(k)).join(",")}&geo=IL`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--cream)", textDecoration: "none", fontWeight: 700, padding: "6px 16px", background: "var(--forest)", borderRadius: 5, border: "1px solid var(--gold)" }}>
              פתח השוואה מלאה <ExternalLink style={{ width: 11, height: 11 }} />
            </a>
          </div>

          {proxyData && (
            <div style={{ marginTop: 20 }}>
              <SectionHeader icon={<Activity style={{ width: 15, height: 15 }} />} title="נתוני Trends מה-Proxy" />
              <pre style={{ background: "var(--cream-dark)", borderRadius: 6, padding: "14px 16px", fontSize: 11, color: "var(--ink-mid)", overflow: "auto", maxHeight: 300, border: "1px solid var(--gold-border)" }}>
                {JSON.stringify(proxyData, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(196,150,42,0.06)", borderRadius: 6, border: "1px solid var(--gold-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <Info style={{ width: 12, height: 12 }} /> למה Google Trends דורש Proxy?
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-light)", lineHeight: 1.6 }}>
              Google Trends אינו מספק API רשמי ציבורי. כדי לקבל נתונים אוטומטיים ניתן להשתמש בספרייה <code style={{ background: "var(--cream-dark)", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>google-trends-api</code> בצד השרת ולחשוף endpoint proxy. קישורים ישירים ב-Google Trends זמינים ללא הגבלה.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Post Editor Modal ────────────────────────────────────────────────────────
function PostEditorModal({ post, onClose, onSave, apiBase, apiKey, type = "blog-posts" }) {
  const isNew = !post;
  const [fields, setFields] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content_html: post?.content_html || "",
    hero_image_url: post?.hero_image_url || "",
    seo_title: post?.seo_title || "",
    seo_description: post?.seo_description || "",
    status: post?.status || "draft",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k, v) => setFields((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!fields.title.trim()) { setErr("כותרת חובה"); return; }
    setSaving(true); setErr(null);
    try {
      if (isNew) {
        await buildoApi(null, null, type, "POST", fields);
      } else {
        await buildoApi(null, null, `${type}/${post.slug}`, "PATCH", fields);
      }
      onSave();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const F = ({ label, k, placeholder, type: t = "text", hint, rows }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{label}</label>
      {rows ? (
        <textarea value={fields[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} rows={rows}
          className="input-v" style={{ fontSize: 12, resize: "vertical" }} />
      ) : (
        <input value={fields[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} type={t}
          className="input-v" style={{ fontSize: 12 }} />
      )}
      {hint && <div style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 2 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--cream)", border: "1px solid var(--gold-border)", borderRadius: 10, padding: 24, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--ink)" }}>{isNew ? "פוסט חדש" : `ערוך: ${post.title}`}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-light)" }}><X style={{ width: 17, height: 17 }} /></button>
        </div>

        <F label="כותרת *" k="title" placeholder="כותרת הפוסט" />
        <F label="תקציר (Excerpt)" k="excerpt" placeholder="תיאור קצר..." rows={2} />
        <F label="תוכן (HTML)" k="content_html" placeholder="<p>תוכן הפוסט...</p>" rows={6} />
        <F label="תמונה ראשית (URL)" k="hero_image_url" placeholder="https://..." />

        <div style={{ borderTop: "1px solid var(--gold-border)", paddingTop: 12, marginTop: 4, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 10 }}>SEO</div>
          <F label={`SEO Title (${fields.seo_title.length}/60)`} k="seo_title" placeholder="כותרת לגוגל"
            hint={fields.seo_title.length > 60 ? "ארוך מדי!" : ""} />
          <F label={`Meta Description (${fields.seo_description.length}/160)`} k="seo_description" placeholder="תיאור לגוגל..."
            rows={2} hint={fields.seo_description.length > 160 ? "ארוך מדי!" : ""} />
        </div>

        {/* Google preview */}
        {(fields.seo_title || fields.title) && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "#fff", borderRadius: 6, border: "1px solid #e0e0e0" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 5 }}>תצוגה מקדימה בגוגל</div>
            <div style={{ fontSize: 14, color: "#1a0dab", fontFamily: "Arial, sans-serif", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fields.seo_title || fields.title}</div>
            <div style={{ fontSize: 12, color: "#006621", fontFamily: "Arial, sans-serif", marginBottom: 1 }}>buildoai.com/blog/{fields.title.toLowerCase().replace(/\s+/g, "-")}</div>
            <div style={{ fontSize: 13, color: "#545454", fontFamily: "Arial, sans-serif", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{fields.seo_description || fields.excerpt || "אין תיאור"}</div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>סטטוס</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["draft", "published"].map((s) => (
              <button key={s} onClick={() => set("status", s)}
                style={{ padding: "5px 16px", borderRadius: 20, border: `1px solid ${fields.status === s ? "var(--gold)" : "var(--gold-border)"}`, background: fields.status === s ? "var(--gold)" : "none", color: fields.status === s ? "var(--cream)" : "var(--ink-mid)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>
                {s === "published" ? "פורסם" : "טיוטה"}
              </button>
            ))}
          </div>
        </div>

        {err && <div style={{ color: "var(--rust)", fontSize: 12, marginBottom: 10 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: "'Heebo',sans-serif", color: "var(--ink-mid)" }}>ביטול</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "8px 18px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 5, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Heebo',sans-serif", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
            <Save style={{ width: 13, height: 13 }} />{saving ? "שומר..." : isNew ? "צור פוסט" : "עדכן"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Buildo Blog Tab ─────────────────────────────────────────────────────────
function BuildoBlogTab({ settings }) {
  const [contentTab, setContentTab] = useState("blog-posts");
  const [posts, setPosts] = useState(null);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | post object
  const [deleting, setDeleting] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [postsRes, pagesRes] = await Promise.all([
        buildoApi(null, null, "blog-posts"),
        buildoApi(null, null, "pages").catch(() => ({ pages: [] })),
      ]);
      const toArr = (d) => Array.isArray(d) ? d : d?.posts || d?.pages || d?.data || d?.items || [];
      setPosts(toArr(postsRes));
      setPages(toArr(pagesRes));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (slug) => {
    try {
      await buildoApi(null, null, `${contentTab}/${slug}`, "DELETE");
      setDeleting(null);
      setActionMsg({ ok: true, text: "נמחק בהצלחה" });
      await load();
    } catch (e) { setActionMsg({ ok: false, text: e.message }); }
  };

  const handleSaved = async () => {
    setEditing(null);
    setActionMsg({ ok: true, text: "נשמר בהצלחה!" });
    await load();
  };


  const currentList = contentTab === "blog-posts" ? (posts || []) : (pages || []);
  const filtered = currentList.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.title || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q);
  });

  const statusColor = (s) => s === "published" ? { color: "#2D5C3F", bg: "rgba(45,92,63,0.1)" } : { color: "#8B5A00", bg: "rgba(196,130,42,0.1)" };

  return (
    <div>
      {/* Content type tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--gold-border)" }}>
        {[
          { key: "blog-posts", label: `בלוג (${posts?.length ?? "..."})`, icon: <BookOpen style={{ width: 12, height: 12 }} /> },
          { key: "pages", label: `עמודים (${pages?.length ?? "..."})`, icon: <FileText style={{ width: 12, height: 12 }} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => { setContentTab(t.key); setSearch(""); }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: contentTab === t.key ? "var(--forest)" : "var(--ink-light)", borderBottom: contentTab === t.key ? "2px solid var(--gold)" : "2px solid transparent", marginBottom: -1 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--ink-light)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`חיפוש ${contentTab === "blog-posts" ? "פוסטים" : "עמודים"}...`}
            className="input-v" style={{ paddingRight: 30, fontSize: 12 }} />
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 12, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>
          <RefreshCw style={{ width: 12, height: 12, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} />
        </button>
        {contentTab === "blog-posts" && (
          <button onClick={() => setEditing("new")}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Heebo',sans-serif" }}>
            <Plus style={{ width: 13, height: 13 }} /> פוסט חדש
          </button>
        )}
      </div>

      {actionMsg && (
        <div style={{ marginBottom: 12, padding: "8px 14px", borderRadius: 5, background: actionMsg.ok ? "rgba(45,92,63,0.1)" : "rgba(139,58,26,0.1)", color: actionMsg.ok ? "#2D5C3F" : "var(--rust)", fontSize: 12, border: `1px solid ${actionMsg.ok ? "#2D5C3F33" : "var(--rust)33"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><X style={{ width: 11, height: 11 }} /></button>
        </div>
      )}

      {error && <div style={{ padding: "10px 14px", background: "rgba(139,58,26,0.08)", borderRadius: 6, color: "var(--rust)", fontSize: 12, marginBottom: 14, border: "1px solid var(--rust)33" }}><AlertCircle style={{ width: 12, height: 12, display: "inline", marginLeft: 5 }} />{error}</div>}
      {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-light)" }}>טוען...</div>}

      {!loading && filtered.length > 0 && (
        <div className="card-v" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--gold-border)" }}>
                {["כותרת", "Slug", "סטטוס", "SEO", "תאריך", "פעולות"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span className="font-label" style={{ fontSize: 8, color: "var(--ink-light)", letterSpacing: "0.12em", fontWeight: 700 }}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => {
                const sc = statusColor(post.status);
                const hasSeo = !!(post.seo_title && post.seo_description);
                const isConfirmDel = deleting === post.slug;
                return (
                  <motion.tr key={post.slug || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid rgba(196,150,42,0.07)", transition: "background .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
                      {post.excerpt && <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 1, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.excerpt}</div>}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-light)", background: "var(--cream-dark)", padding: "2px 7px", borderRadius: 3 }}>{post.slug || "—"}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color }}>
                        {post.status === "published" ? "פורסם" : "טיוטה"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>
                      {hasSeo
                        ? <CheckCircle style={{ width: 14, height: 14, color: "#2D5C3F" }} />
                        : <AlertCircle style={{ width: 14, height: 14, color: "var(--rust-light)" }} />}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 3 }}>
                        <Calendar style={{ width: 10, height: 10 }} />{fmtDate(post.published_at || post.created_at)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {isConfirmDel ? (
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "var(--rust)" }}>למחוק?</span>
                          <button onClick={() => handleDelete(post.slug)} style={{ fontSize: 10, padding: "3px 8px", background: "var(--rust)", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>כן</button>
                          <button onClick={() => setDeleting(null)} style={{ fontSize: 10, padding: "3px 8px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 3, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "var(--ink-mid)" }}>לא</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => setEditing(post)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 4, cursor: "pointer", fontSize: 11, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" }}>
                            <Edit3 style={{ width: 10, height: 10 }} /> ערוך
                          </button>
                          <button onClick={() => setDeleting(post.slug)} style={{ display: "flex", alignItems: "center", padding: "4px 8px", background: "none", border: "1px solid var(--rust)44", borderRadius: 4, cursor: "pointer", color: "var(--rust)" }}>
                            <Trash2 style={{ width: 10, height: 10 }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink-light)", fontSize: 13 }}>
          {contentTab === "blog-posts" ? "אין פוסטים עדיין" : "אין עמודים עדיין"}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <PostEditorModal
            post={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSave={handleSaved}
            apiBase={null}
            apiKey={null}
            type={contentTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dashboard Overview ──────────────────────────────────────────────────────
function DashboardTab({ settings }) {
  const [gscSummary, setGscSummary] = useState(null);
  const [framerCount, setFramerCount] = useState(null);
  const [blogCount, setBlogCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        settings.gscSiteUrl && settings.gscToken ? fetchGSCSummary(settings.gscSiteUrl, settings.gscToken, 28) : Promise.resolve(null),
        settings.framerToken && settings.framerCollectionId ? fetchFramerCMS(settings.framerToken, settings.framerCollectionId) : Promise.resolve(null),
        buildoApi(null, null, "blog-posts"),
      ]);
      if (!alive) return;
      if (results[0].status === "fulfilled" && results[0].value) setGscSummary(results[0].value);
      if (results[1].status === "fulfilled" && results[1].value) setFramerCount(results[1].value.items?.length ?? null);
      if (results[2].status === "fulfilled" && results[2].value) {
        const d = results[2].value;
        setBlogCount(Array.isArray(d) ? d.length : (d.posts || d.data || d.items || d.results || []).length);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [settings]);

  const curr = gscSummary?.current || {};
  const prev = gscSummary?.previous || {};
  const trendPct = (c, p) => p > 0 ? ((c - p) / p) * 100 : null;

  const sources = [
    { label: "Framer CMS", ok: !!(settings.framerToken && settings.framerCollectionId), key: "framer" },
    { label: "Search Console", ok: !!(settings.gscSiteUrl && settings.gscToken), key: "gsc" },
    { label: "Buildo Blog API", ok: true, key: "blog" },
    { label: "Google Trends", ok: !!(settings.targetKeywords), key: "trends" },
  ];

  return (
    <div>
      {/* Connection status bar */}
      <div className="card-v" style={{ padding: "12px 18px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {sources.map((s) => (
          <ConnectionStatus key={s.key} label={s.label} ok={s.ok} loading={false} />
        ))}
      </div>

      {/* KPI grid */}
      {gscSummary && (
        <div style={{ marginBottom: 22 }}>
          <SectionHeader icon={<BarChart2 style={{ width: 15, height: 15 }} />} title="Search Console — 28 יום" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 8 }}>
            <StatCard label="קליקים" value={fmt(curr.clicks)} trend={trendPct(curr.clicks, prev.clicks)} icon={<MousePointer style={{ width: 16, height: 16, color: "var(--gold)" }} />} color="var(--ink)" />
            <StatCard label="חשיפות" value={fmt(curr.impressions)} trend={trendPct(curr.impressions, prev.impressions)} icon={<Eye style={{ width: 16, height: 16, color: "var(--gold)" }} />} color="var(--ink)" />
            <StatCard label="CTR" value={pct(curr.ctr)} trend={trendPct(curr.ctr, prev.ctr)} icon={<Target style={{ width: 16, height: 16, color: "var(--gold)" }} />} color="var(--forest-mid)" />
            <StatCard label="מיקום ממוצע" value={curr.position?.toFixed(1) || "—"} icon={<Star style={{ width: 16, height: 16, color: "var(--gold)" }} />} color="var(--gold)" />
          </div>
        </div>
      )}

      {/* Content counts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div className="card-v" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 6 }}>FRAMER CMS — פוסטים</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)" }}>{loading ? "..." : framerCount ?? "—"}</div>
        </div>
        <div className="card-v" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 6 }}>BUILDO BLOG — פוסטים</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)" }}>{loading ? "..." : blogCount ?? "—"}</div>
        </div>
      </div>

      {/* Keywords overview */}
      {settings.targetKeywords && (
        <div>
          <SectionHeader icon={<Tag style={{ width: 15, height: 15 }} />} title="מילות מפתח במעקב" />
          <div className="card-v" style={{ padding: "14px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {settings.targetKeywords.split(",").map((k) => k.trim()).filter(Boolean).map((kw) => (
              <Badge key={kw}>{kw}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div style={{ marginTop: 20 }}>
        <SectionHeader icon={<Link2 style={{ width: 15, height: 15 }} />} title="קישורים מהירים" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {[
            { label: "Google Search Console", url: "https://search.google.com/search-console" },
            { label: "Google Trends", url: "https://trends.google.com/trends/?geo=IL" },
            { label: "Framer Dashboard", url: "https://framer.com/dashboard" },
            { label: "Google Analytics", url: "https://analytics.google.com" },
          ].map(({ label, url }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
              className="card-v"
              style={{ padding: "12px 16px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color .15s" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
              <ExternalLink style={{ width: 12, height: 12, color: "var(--gold)" }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Error Boundary ──────────────────────────────────────────────────────────
class SEOErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Heebo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 600, padding: 32, background: "#fff", border: "2px solid #c00", borderRadius: 10 }}>
            <h2 style={{ color: "#c00", marginBottom: 12 }}>שגיאת JavaScript — שלח לנו את הפרטים</h2>
            <pre style={{ fontSize: 12, background: "#f5f5f5", padding: 16, borderRadius: 6, overflowX: "auto", whiteSpace: "pre-wrap" }}>
              {String(this.state.error)}{"\n\n"}{this.state.error?.stack || ""}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function SEOAdminPageInner() {
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    base44.auth.me().then((user) => {
      setAllowed(user && ALLOWED_EMAILS.includes(user.email));
      setAuthChecked(true);
    }).catch(() => { setAllowed(false); setAuthChecked(true); });
  }, []);

  const handleTest = async (source, cfg) => {
    setTestResults((p) => ({ ...p, [source]: { loading: true } }));
    try {
      if (source === "framer") {
        const res = await fetchFramerCollections(cfg.framerToken);
        const cols = res.collections || res.items || res || [];
        setTestResults((p) => ({ ...p, framer: { ok: true, msg: `✓ נמצאו ${cols.length} קולקשנים: ${cols.map(c => c.name || c.id).join(", ")}` } }));
        return;
      }
      if (source === "gsc") await fetchGSCSummary(cfg.gscSiteUrl, cfg.gscToken, 7);
      if (source === "blog") await buildoApi(null, null, "health");
      setTestResults((p) => ({ ...p, [source]: { ok: true, msg: "✓ חיבור תקין!" } }));
    } catch (e) {
      setTestResults((p) => ({ ...p, [source]: { ok: false, msg: `✗ ${e.message}` } }));
    }
  };

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
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            style={{ background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
            התחבר
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tabs = [
    { key: "dashboard", label: "דשבורד", icon: <Zap style={{ width: 13, height: 13 }} /> },
    { key: "gsc", label: "Search Console", icon: <Search style={{ width: 13, height: 13 }} /> },
    { key: "trends", label: "Google Trends", icon: <TrendingUp style={{ width: 13, height: 13 }} /> },
    { key: "framer", label: "Framer CMS", icon: <Globe style={{ width: 13, height: 13 }} /> },
    { key: "blog", label: "Buildo Blog", icon: <BookOpen style={{ width: 13, height: 13 }} /> },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Heebo', sans-serif", paddingBottom: 60 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .input-v { background: var(--cream-mid); border: 1px solid var(--gold-border); border-radius: 5px; padding: 7px 12px; width: 100%; font-family: 'Heebo',sans-serif; color: var(--ink); outline: none; } .input-v:focus { border-color: var(--gold); } textarea.input-v { width:100%; }`}</style>

      {/* Header */}
      <div style={{ background: "var(--forest)", borderBottom: "2px solid var(--gold)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/b6a902f52_Gemini_Generated_Image_b0y91hb0y91hb0y9.png" alt="Bildo" style={{ height: 38, filter: "brightness(1.3) invert(1)" }} />
          <div>
            <div className="font-label" style={{ fontSize: 8, color: "var(--gold-light)", letterSpacing: "0.18em" }}>ADMIN PANEL</div>
            <div style={{ fontSize: 18, color: "var(--gold-light)", fontWeight: 900 }}>ניהול SEO</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(196,150,42,0.15)", border: "1px solid var(--gold)", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--gold-light)", fontFamily: "'Heebo',sans-serif" }}>
          <Settings style={{ width: 13, height: 13 }} /> הגדרות API
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--gold-border)", marginBottom: 24 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", fontSize: 13, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: tab === t.key ? "var(--forest)" : "var(--ink-light)", borderBottom: tab === t.key ? "2.5px solid var(--gold)" : "2.5px solid transparent", marginBottom: -2 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {tab === "dashboard" && <DashboardTab settings={settings} />}
            {tab === "gsc" && <SearchConsoleTab settings={settings} />}
            {tab === "trends" && <TrendsTab settings={settings} />}
            {tab === "framer" && <FramerCMSTab settings={settings} />}
            {tab === "blog" && <BuildoBlogTab settings={settings} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            onClose={() => setShowSettings(false)}
            onTest={handleTest}
            testResults={testResults}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SEOAdminPage() {
  return (
    <SEOErrorBoundary>
      <SEOAdminPageInner />
    </SEOErrorBoundary>
  );
}
