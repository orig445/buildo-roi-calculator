import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, Plus, Sparkles, Globe, CheckCircle, AlertCircle, X, Trash2,
  Rocket, Eye, Clock, Settings, Save, ExternalLink, Wand2, ListPlus, Play
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─── API helper ──────────────────────────────────────────────────────────────
async function agent(payload) {
  let res;
  try {
    res = await base44.functions.invoke("blogAgent", payload);
  } catch (e) {
    throw new Error(e?.response?.data?.error || e?.message || "שגיאת שרת");
  }
  if (res?.error) throw new Error(res.error);
  return res;
}

const DEFAULT_CFG = {
  singleton: "main",
  brand_name: "Buildo",
  site_url: "https://buildoai.com",
  audience: "small and medium business owners who want to grow with AI-powered marketing",
  brand_context:
    "Buildo (Bildo) is an AI-powered marketing platform that acts like a full marketing team — SEO, paid ads, social, content and lead follow-up, automatically, for SMBs.",
  language: "en",
  seed_keywords: "AI marketing, marketing automation, SEO for small business, digital marketing tools, lead generation",
  framer_collection_id: "",
  framer_collection_name: "Blog",
  publish_as_draft: false,
  auto_propose: true,
  generate_hero_image: true,
};

const statusMeta = {
  queued: { label: "בתור", color: "#8B5A00", bg: "rgba(196,130,42,0.1)" },
  generating: { label: "בכתיבה…", color: "#1a4d7a", bg: "rgba(26,77,122,0.1)" },
  published: { label: "פורסם", color: "#2D5C3F", bg: "rgba(45,92,63,0.1)" },
  failed: { label: "נכשל", color: "#8B3A1A", bg: "rgba(139,58,26,0.1)" },
  rejected: { label: "נדחה", color: "var(--ink-light)", bg: "var(--cream-dark)" },
};

function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 6, background: msg.ok ? "rgba(45,92,63,0.1)" : "rgba(139,58,26,0.1)", color: msg.ok ? "#2D5C3F" : "var(--rust)", fontSize: 12, border: `1px solid ${msg.ok ? "#2D5C3F33" : "var(--rust)33"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {msg.ok ? <CheckCircle style={{ width: 13, height: 13 }} /> : <AlertCircle style={{ width: 13, height: 13 }} />}
        {msg.text}
      </span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><X style={{ width: 12, height: 12 }} /></button>
    </div>
  );
}

const btnPrimary = { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--forest)", color: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Heebo',sans-serif" };
const btnGhost = { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "none", border: "1px solid var(--gold-border)", borderRadius: 5, cursor: "pointer", fontSize: 12, color: "var(--ink-mid)", fontFamily: "'Heebo',sans-serif" };
const sectionCard = { padding: "18px 20px", marginBottom: 18 };

// ─── Preview Modal ───────────────────────────────────────────────────────────
function PreviewModal({ post, cfg, onClose, onPublish, publishing }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--cream)", border: "1px solid var(--gold-border)", borderRadius: 10, width: "100%", maxWidth: 780, maxHeight: "92vh", overflowY: "auto", direction: "rtl" }}>
        <div style={{ position: "sticky", top: 0, background: "var(--forest)", borderBottom: "2px solid var(--gold)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "var(--gold-light)" }}>תצוגה מקדימה</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onPublish(post)} disabled={publishing} style={{ ...btnPrimary, background: "var(--gold)", color: "var(--forest)", opacity: publishing ? 0.7 : 1 }}>
              <Rocket style={{ width: 13, height: 13 }} /> {publishing ? "מפרסם…" : "פרסם ל-Framer"}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold-light)" }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* SEO preview */}
          <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff", borderRadius: 6, border: "1px solid #e0e0e0" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 5 }}>גוגל / תצוגת SEO</div>
            <div style={{ fontSize: 16, color: "#1a0dab", fontFamily: "Arial", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.meta_title || post.title}</div>
            <div style={{ fontSize: 12, color: "#006621", fontFamily: "Arial", marginBottom: 2 }}>{(cfg.site_url || "https://buildoai.com").replace(/\/$/, "")}/blog/{post.slug}</div>
            <div style={{ fontSize: 13, color: "#545454", fontFamily: "Arial", lineHeight: 1.4 }}>{post.meta_description}</div>
          </div>

          {post.hero_image_url && (
            <img src={post.hero_image_url} alt={post.title} style={{ width: "100%", borderRadius: 8, marginBottom: 16, border: "1px solid var(--gold-border)" }} />
          )}

          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", lineHeight: 1.25, marginBottom: 8 }}>{post.title}</h1>
          {post.excerpt && <p style={{ fontSize: 15, color: "var(--ink-light)", marginBottom: 16, lineHeight: 1.6 }}>{post.excerpt}</p>}

          <div className="blog-preview-body" dir="ltr" style={{ textAlign: "left", fontSize: 15, color: "var(--ink)", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: post.content_html || "" }} />

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 18 }}>
              {post.tags.map((t) => (
                <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(196,150,42,0.12)", color: "var(--gold)", border: "1px solid var(--gold)33" }}>{t}</span>
              ))}
            </div>
          )}
          <style>{`.blog-preview-body h2{font-size:20px;font-weight:800;margin:22px 0 8px;color:var(--ink);} .blog-preview-body h3{font-size:16px;font-weight:700;margin:16px 0 6px;} .blog-preview-body p{margin:0 0 12px;} .blog-preview-body ul,.blog-preview-body ol{margin:0 0 12px 20px;padding-left:18px;} .blog-preview-body li{margin-bottom:5px;} .blog-preview-body a{color:var(--forest-mid);} .blog-preview-body table{border-collapse:collapse;width:100%;margin:12px 0;} .blog-preview-body th,.blog-preview-body td{border:1px solid var(--gold-border);padding:7px 10px;font-size:13px;text-align:left;} .blog-preview-body blockquote{border-left:3px solid var(--gold);padding-left:12px;color:var(--ink-light);margin:12px 0;}`}</style>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────────────────
export default function BlogAgentTab() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [cfgId, setCfgId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null); // free-text label of current async op

  // Framer connection
  const [collections, setCollections] = useState(null);
  const [inspecting, setInspecting] = useState(false);

  // Topic proposals
  const [proposals, setProposals] = useState(null);
  const [proposing, setProposing] = useState(false);

  // New manual topic
  const [newTitle, setNewTitle] = useState("");
  const [newKw, setNewKw] = useState("");

  // Preview modal
  const [preview, setPreview] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const notify = (ok, text) => setToast({ ok, text });

  const loadConfig = useCallback(async () => {
    try {
      const rows = await base44.entities.BlogAgentConfig.list().catch(() => []);
      const row = (rows || []).find((r) => r.singleton === "main") || (rows || [])[0];
      if (row) { setCfg({ ...DEFAULT_CFG, ...row }); setCfgId(row.id); }
    } catch (_) { /* keep defaults */ }
  }, []);

  const loadTopics = useCallback(async () => {
    try {
      const rows = await base44.entities.BlogTopic.list("-created_date").catch(() => base44.entities.BlogTopic.list());
      setTopics(rows || []);
    } catch (_) { setTopics([]); }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await Promise.all([loadConfig(), loadTopics()]); setLoading(false); })();
  }, [loadConfig, loadTopics]);

  const saveConfig = async () => {
    setBusy("config");
    try {
      const payload = { ...cfg, singleton: "main" };
      if (cfgId) await base44.entities.BlogAgentConfig.update(cfgId, payload);
      else { const created = await base44.entities.BlogAgentConfig.create(payload); setCfgId(created.id); }
      notify(true, "ההגדרות נשמרו");
    } catch (e) { notify(false, e.message); }
    finally { setBusy(null); }
  };

  const testFramer = async () => {
    setInspecting(true); setToast(null);
    try {
      const res = await agent({ action: "inspectFramer" });
      setCollections(res.collections || []);
      notify(true, `נמצאו ${res.collections?.length || 0} קולקשנים ב-Framer`);
    } catch (e) { setCollections(null); notify(false, e.message); }
    finally { setInspecting(false); }
  };

  const propose = async () => {
    setProposing(true); setToast(null);
    try {
      const res = await agent({ action: "proposeTopics", count: 6, existingTitles: topics.map((t) => t.title) });
      setProposals((res.topics || []).map((t) => ({ ...t, _add: true })));
    } catch (e) { notify(false, e.message); }
    finally { setProposing(false); }
  };

  const addProposals = async () => {
    const chosen = (proposals || []).filter((p) => p._add);
    if (!chosen.length) return;
    setBusy("addProposals");
    try {
      for (const p of chosen) {
        await base44.entities.BlogTopic.create({
          title: p.title, target_keyword: p.target_keyword || "",
          secondary_keywords: Array.isArray(p.secondary_keywords) ? p.secondary_keywords.join(", ") : (p.secondary_keywords || ""),
          angle: p.angle || "", rationale: p.rationale || "", status: "queued", source: "ai", priority: 100,
        });
      }
      setProposals(null); await loadTopics(); notify(true, `נוספו ${chosen.length} נושאים לתור`);
    } catch (e) { notify(false, e.message); }
    finally { setBusy(null); }
  };

  const addManual = async () => {
    if (!newTitle.trim()) return;
    setBusy("manual");
    try {
      await base44.entities.BlogTopic.create({ title: newTitle.trim(), target_keyword: newKw.trim(), status: "queued", source: "manual", priority: 50 });
      setNewTitle(""); setNewKw(""); await loadTopics(); notify(true, "הנושא נוסף לתור");
    } catch (e) { notify(false, e.message); }
    finally { setBusy(null); }
  };

  const removeTopic = async (id) => {
    try { await base44.entities.BlogTopic.delete(id); await loadTopics(); }
    catch (e) { notify(false, e.message); }
  };

  const generatePreview = async (topic) => {
    setBusy("gen-" + topic.id); setToast(null);
    try {
      const res = await agent({ action: "generate", topic: { title: topic.title, target_keyword: topic.target_keyword, secondary_keywords: topic.secondary_keywords, angle: topic.angle } });
      setPreview({ post: res.post, topicId: topic.id });
    } catch (e) { notify(false, e.message); }
    finally { setBusy(null); }
  };

  const publish = async (post) => {
    setPublishing(true); setToast(null);
    try {
      const res = await agent({ action: "publish", post, topicId: preview?.topicId });
      setPreview(null); await loadTopics();
      notify(true, `פורסם ל-Framer בקולקשן "${res.collectionName}" — /${res.slug}`);
    } catch (e) { notify(false, e.message); }
    finally { setPublishing(false); }
  };

  const runCycleNow = async () => {
    setBusy("cycle"); setToast(null);
    try {
      const res = await agent({ action: "runCycle" });
      if (res.skipped) notify(true, `דילוג: ${res.reason}`);
      else notify(true, `פורסם: "${res.title}" → /${res.slug}`);
      await loadTopics();
    } catch (e) { notify(false, e.message); }
    finally { setBusy(null); }
  };

  const setC = (k, v) => setCfg((p) => ({ ...p, [k]: v }));
  const queued = topics.filter((t) => t.status === "queued" || t.status === "generating" || t.status === "failed");
  const published = topics.filter((t) => t.status === "published");

  if (loading) return <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink-light)" }}>טוען…</div>;

  return (
    <div>
      <Toast msg={toast} onClose={() => setToast(null)} />

      {/* Hero / run bar */}
      <div className="card-v" style={{ ...sectionCard, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", background: "var(--cream-mid)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "var(--forest)", borderRadius: 8, padding: 10, border: "1px solid var(--gold)" }}><Wand2 style={{ width: 20, height: 20, color: "var(--gold-light)" }} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>סוכן הבלוגים האוטומטי</div>
            <div style={{ fontSize: 12, color: "var(--ink-light)" }}>מייצר בלוגים חזקים ל-SEO / AEO / GEO עם גרפיקה ומפרסם ישירות ל-Framer CMS</div>
          </div>
        </div>
        <button onClick={runCycleNow} disabled={busy === "cycle"} style={{ ...btnPrimary, padding: "10px 18px", opacity: busy === "cycle" ? 0.7 : 1 }}>
          <Play style={{ width: 14, height: 14 }} /> {busy === "cycle" ? "מריץ מחזור…" : "הרץ מחזור עכשיו"}
        </button>
      </div>

      {/* Framer connection */}
      <div className="card-v" style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe style={{ width: 15, height: 15, color: "var(--gold)" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>חיבור ל-Framer</span>
          </div>
          <button onClick={testFramer} disabled={inspecting} style={btnGhost}>
            <RefreshCw style={{ width: 12, height: 12, ...(inspecting ? { animation: "spin 1s linear infinite" } : {}) }} /> בדוק חיבור
          </button>
        </div>
        <div style={{ padding: "10px 14px", background: "rgba(196,150,42,0.07)", borderRadius: 6, border: "1px solid var(--gold-border)", fontSize: 11, color: "var(--ink-light)", lineHeight: 1.7 }}>
          הגדר ב-<b>base44 → Secrets</b> את שני הערכים: <code>FRAMER_API_KEY</code> (המפתח <code>fr_…</code>) ו-<code>FRAMER_PROJECT_URL</code> (כתובת הפרויקט, למשל <code>https://framer.com/projects/Website--xxxx</code>). לאחר מכן לחץ "בדוק חיבור" כדי לזהות את הקולקשנים.
        </div>

        {collections && collections.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", marginBottom: 6 }}>בחר קולקשן יעד לבלוג:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {collections.map((c) => (
                <label key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", border: `1px solid ${cfg.framer_collection_id === c.id ? "var(--gold)" : "var(--gold-border)"}`, borderRadius: 6, cursor: "pointer", background: cfg.framer_collection_id === c.id ? "rgba(196,150,42,0.08)" : "transparent" }}>
                  <input type="radio" name="framerCol" checked={cfg.framer_collection_id === c.id} onChange={() => setCfg((p) => ({ ...p, framer_collection_id: c.id, framer_collection_name: c.name }))} style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{c.name} <span style={{ fontSize: 10, color: "var(--ink-light)", fontWeight: 400 }}>({c.fields?.length || 0} שדות)</span></div>
                    <div style={{ fontSize: 10, color: "var(--ink-light)", marginTop: 2 }}>{(c.fields || []).map((f) => `${f.name}·${f.type}`).join("  |  ") || "—"}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Topic queue */}
      <div className="card-v" style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ListPlus style={{ width: 15, height: 15, color: "var(--gold)" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>תור נושאים ({queued.length})</span>
          </div>
          <button onClick={propose} disabled={proposing} style={btnGhost}>
            <Sparkles style={{ width: 12, height: 12, ...(proposing ? { animation: "spin 1s linear infinite" } : {}) }} /> {proposing ? "חוקר…" : "הצע נושאים חמים"}
          </button>
        </div>

        {/* Add manual */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="כותרת / נושא לבלוג…" className="input-v" style={{ flex: 2, minWidth: 200, fontSize: 12 }} />
          <input value={newKw} onChange={(e) => setNewKw(e.target.value)} placeholder="מילת מפתח (אופציונלי)" className="input-v" style={{ flex: 1, minWidth: 140, fontSize: 12 }} />
          <button onClick={addManual} disabled={!newTitle.trim() || busy === "manual"} style={{ ...btnPrimary, opacity: !newTitle.trim() ? 0.5 : 1 }}>
            <Plus style={{ width: 13, height: 13 }} /> הוסף
          </button>
        </div>

        {/* Proposals */}
        {proposals && (
          <div style={{ marginBottom: 16, padding: "12px 14px", border: "1px dashed var(--gold)", borderRadius: 8, background: "rgba(196,150,42,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)" }}>נושאים מוצעים ממחקר AI</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addProposals} disabled={busy === "addProposals"} style={{ ...btnPrimary, padding: "5px 12px", fontSize: 11 }}>הוסף מסומנים</button>
                <button onClick={() => setProposals(null)} style={{ ...btnGhost, padding: "5px 10px", fontSize: 11 }}>בטל</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {proposals.map((p, i) => (
                <label key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", background: "#fff", borderRadius: 6, border: "1px solid var(--gold-border)", cursor: "pointer" }}>
                  <input type="checkbox" checked={p._add} onChange={() => setProposals((prev) => prev.map((x, j) => j === i ? { ...x, _add: !x._add } : x))} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--forest-mid)", marginTop: 1 }}>🎯 {p.target_keyword}</div>
                    {p.rationale && <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 2 }}>{p.rationale}</div>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Queue list */}
        {queued.length === 0 && !proposals && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-light)", fontSize: 13 }}>אין נושאים בתור — הוסף ידנית או לחץ "הצע נושאים חמים"</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {queued.map((t) => {
            const sm = statusMeta[t.status] || statusMeta.queued;
            const generating = busy === "gen-" + t.id || t.status === "generating";
            return (
              <div key={t.id} className="card-v" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sm.bg, color: sm.color, whiteSpace: "nowrap" }}>{sm.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    {t.source === "ai" && <Sparkles style={{ width: 11, height: 11, color: "var(--gold)", flexShrink: 0 }} />}
                  </div>
                  {t.target_keyword && <div style={{ fontSize: 11, color: "var(--forest-mid)", marginTop: 2 }}>🎯 {t.target_keyword}</div>}
                  {t.status === "failed" && t.error && <div style={{ fontSize: 11, color: "var(--rust)", marginTop: 2 }}>{t.error}</div>}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => generatePreview(t)} disabled={generating} style={{ ...btnGhost, padding: "6px 10px" }}>
                    <Eye style={{ width: 12, height: 12, ...(generating ? { animation: "spin 1s linear infinite" } : {}) }} /> {generating ? "כותב…" : "תצוגה מקדימה"}
                  </button>
                  <button onClick={() => removeTopic(t.id)} style={{ ...btnGhost, padding: "6px 8px", borderColor: "var(--rust)44", color: "var(--rust)" }}><Trash2 style={{ width: 12, height: 12 }} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Published log */}
      {published.length > 0 && (
        <div className="card-v" style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CheckCircle style={{ width: 15, height: 15, color: "#2D5C3F" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>פורסמו ({published.length})</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {published.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--cream-mid)", borderRadius: 6, gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 10, height: 10 }} />{t.published_at ? new Date(t.published_at).toLocaleString("he-IL") : ""}</div>
                </div>
                {t.published_url && (
                  <a href={t.published_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--forest-mid)", textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" }}>
                    פתח <ExternalLink style={{ width: 10, height: 10 }} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config */}
      <div className="card-v" style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Settings style={{ width: 15, height: 15, color: "var(--gold)" }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>הגדרות הסוכן</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="שם המותג" value={cfg.brand_name} onChange={(v) => setC("brand_name", v)} />
          <Field label="כתובת האתר" value={cfg.site_url} onChange={(v) => setC("site_url", v)} />
        </div>
        <FieldArea label="תיאור המותג (מה בילדו עושה, טון, בידול)" value={cfg.brand_context} onChange={(v) => setC("brand_context", v)} rows={3} />
        <FieldArea label="קהל יעד" value={cfg.audience} onChange={(v) => setC("audience", v)} rows={2} />
        <FieldArea label="מילות מפתח / נושאי מקור (מופרד בפסיקים)" value={cfg.seed_keywords} onChange={(v) => setC("seed_keywords", v)} rows={2} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "6px 0 12px" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", display: "block", marginBottom: 4 }}>שפת הפוסטים</label>
            <select value={cfg.language} onChange={(e) => setC("language", e.target.value)} className="input-v" style={{ fontSize: 12 }}>
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          <Field label="שם קולקשן ב-Framer (גיבוי לזיהוי)" value={cfg.framer_collection_name} onChange={(v) => setC("framer_collection_name", v)} />
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 14 }}>
          <Toggle label="ייצור גרפיקה לכל פוסט" checked={cfg.generate_hero_image} onChange={(v) => setC("generate_hero_image", v)} />
          <Toggle label="הצעת נושא אוטומטית כשהתור ריק" checked={cfg.auto_propose} onChange={(v) => setC("auto_propose", v)} />
          <Toggle label="פרסום כטיוטה בלבד" checked={cfg.publish_as_draft} onChange={(v) => setC("publish_as_draft", v)} />
        </div>
        <button onClick={saveConfig} disabled={busy === "config"} style={btnPrimary}>
          <Save style={{ width: 13, height: 13 }} /> {busy === "config" ? "שומר…" : "שמור הגדרות"}
        </button>
      </div>

      {/* Scheduling instructions */}
      <div className="card-v" style={{ ...sectionCard, background: "rgba(45,92,63,0.05)", border: "1px solid rgba(45,92,63,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Clock style={{ width: 15, height: 15, color: "var(--forest)" }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>הפעלת האוטומציה המתוזמנת</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.8 }}>
          כדי שהמערכת תפרסם לבד לפי לו"ז: היכנס ל-<b>base44 → Scheduled Tasks</b>, צור משימה חדשה שמריצה את הפונקציה <code>blogAgent</code> (ללא פרמטרים — ברירת המחדל היא <code>runCycle</code>), ובחר תדירות (למשל כל יום או 3× בשבוע). בכל ריצה הסוכן מושך נושא אחד מהתור (או חוקר נושא חדש אם התור ריק), כותב פוסט מלא עם גרפיקה, ומפרסם ל-Framer.
        </div>
      </div>

      {preview && (
        <PreviewModal post={preview.post} cfg={cfg} onClose={() => setPreview(null)} onPublish={publish} publishing={publishing} />
      )}
    </div>
  );
}

// ─── small field helpers ─────────────────────────────────────────────────────
function Field({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", display: "block", marginBottom: 4 }}>{label}</label>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="input-v" style={{ fontSize: 12 }} />
    </div>
  );
}
function FieldArea({ label, value, onChange, rows = 2 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-light)", display: "block", marginBottom: 4 }}>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} className="input-v" style={{ fontSize: 12, resize: "vertical" }} />
    </div>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontSize: 12, color: "var(--ink-mid)", fontWeight: 600 }}>{label}</span>
    </label>
  );
}
