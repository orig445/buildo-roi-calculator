import { useState } from "react";
import { Loader2, Copy, Check, ArrowRight, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Mail, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeadModal from "./LeadModal";

// Extract primary brand color (first color from businessInfo.colors)
function getBrandColor(businessInfo) {
  const colors = businessInfo?.colors || businessInfo?.brand_colors || [];
  return colors[0] || "#000000";
}

function downloadImage(url, filename) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename || "ad-image.jpg";
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

function AdCard({ ad, index, businessInfo, onUnlock, unlocked, lang = "he" }) {
  const [copied, setCopied] = useState(false);
  const brandColor = getBrandColor(businessInfo);
  const isFirst = index === 0;

  const copyAll = () => {
    const text = `${ad.headline}\n${ad.subheadline}\n\n${ad.body}\n\n${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pageName = businessInfo?.name || "העסק שלך";
  const pageInitial = pageName.charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        alignItems: "start",
      }}
    >
      {/* LEFT: Facebook Ad Mockup */}
      <div style={{ position: "relative", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.15)", color: "#000" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: brandColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>
              {pageInitial}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{pageName}</div>
              <div style={{ fontSize: 11, color: "#65676b" }}>ממומן</div>
            </div>
          </div>
          <MoreHorizontal size={18} color="#65676b" />
        </div>

        {/* Body text */}
        <div style={{ padding: "0 14px 10px", fontSize: 14, color: "#050505", lineHeight: 1.6, direction: "rtl" }}>
          {ad.body?.slice(0, 120)}{ad.body?.length > 120 ? "..." : ""}
        </div>

        {/* Ad Image */}
        <div style={{ position: "relative", background: "#f5f5f5", borderRadius: 8, overflow: "hidden" }}>
          {ad.imageUrl ? (
            <>
              <img src={ad.imageUrl} alt="ad" style={{ width: "100%", height: isFirst ? 260 : 220, objectFit: "cover", display: "block", filter: isFirst ? "none" : "blur(8px)" }} />
              {isFirst && unlocked && (
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
                  <button
                    onClick={() => downloadImage(ad.imageUrl, `ad-${pageName}.jpg`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: brandColor, color: "#fff", border: "none",
                      borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 800,
                      cursor: "pointer", fontFamily: "'Heebo', sans-serif",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Download size={14} /> הורד תמונה
                  </button>
                </div>
              )}
              {(!isFirst || !unlocked) && (
                <div
                  onClick={!isFirst ? onUnlock : undefined}
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: !isFirst ? "rgba(0,0,0,0.45)" : "transparent", gap: 8,
                    cursor: !isFirst ? "pointer" : "default",
                  }}
                >
                  {!isFirst && (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{lang === "en" ? "Click to view image" : "לחץ לצפייה בתמונה"}</div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ width: "100%", height: isFirst ? 260 : 220, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={28} color={brandColor} />
              </motion.div>
              <div style={{ fontSize: 12, color: "#999" }}>{lang === "en" ? "Generating image..." : "מייצר תמונה..."}</div>
            </div>
          )}
        </div>

        {/* Headline bar */}
        <div style={{ background: "#f0f2f5", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ direction: "rtl" }}>
            <div style={{ fontSize: 12, color: "#65676b", marginBottom: 2 }}>{businessInfo?.url?.replace(/^https?:\/\//, "") || "yoursite.com"}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#050505" }}>{ad.headline}</div>
            {ad.subheadline && <div style={{ fontSize: 12, color: "#65676b" }}>{ad.subheadline}</div>}
          </div>
          <div style={{ background: brandColor, borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", marginRight: 10, flexShrink: 0 }}>
            {ad.cta}
          </div>
        </div>

        {/* Reactions bar */}
        <div style={{ padding: "8px 14px", borderTop: "1px solid #e4e6eb", display: "flex", gap: 4 }}>
          {[
            <><ThumbsUp size={14} /> אהבתי</>,
            <><MessageCircle size={14} /> תגובה</>,
            <><Share2 size={14} /> שיתוף</>
          ].map((item, i) => (
            <button key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "none", border: "none", color: "#65676b", fontSize: 13, fontWeight: 600, padding: "6px 0", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Copy panel */}
      <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: brandColor, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{lang === "en" ? `Version ${index + 1}` : `גרסה ${index + 1}`}</div>
          <button onClick={copyAll} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "5px 12px", color: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "'Heebo', sans-serif" }}>
            {copied ? <><Check size={11} color="#4ade80" /> {lang === "en" ? "Copied!" : "הועתק!"}</> : <><Copy size={11} /> {lang === "en" ? "Copy all" : "העתק הכל"}</>}
          </button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{lang === "en" ? "Headline" : "כותרת ראשית"}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#000" }}>{ad.headline}</div>
          </div>
          {ad.subheadline && (
            <div>
              <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{lang === "en" ? "Subheadline" : "כותרת משנה"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{ad.subheadline}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{lang === "en" ? "Ad Body" : "גוף הפרסומת"}</div>
            <div style={{ fontSize: 12, color: "#444", lineHeight: 1.7, background: "#fff", borderRadius: 8, padding: "10px 12px", borderRight: `3px solid ${brandColor}` }}>
              {ad.body}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 6 }}>{lang === "en" ? "CTA Button" : "CTA"}</div>
            <div style={{ display: "inline-flex", background: brandColor, color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 800 }}>
              {ad.cta}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmailTemplate({ emailTemplate, onUnlock, brandColor }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("preview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}
    >
      <div style={{ background: brandColor, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={16} color="#fff" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>תבנית מייל שיווקי</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["preview", "html"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#fff" : "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "4px 12px", color: tab === t ? brandColor : "rgba(255,255,255,0.7)", fontSize: 11, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
              {t === "preview" ? "תצוגה מקדימה" : "HTML"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>נושא המייל</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #e0e0e0" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{emailTemplate.subject}</span>
            <button onClick={() => { navigator.clipboard.writeText(emailTemplate.subject); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              {copied ? <><Check size={11} color="#22c55e" /> הועתק</> : <><Copy size={11} /> העתק</>}
            </button>
          </div>
        </div>

        <div style={{ position: "relative", cursor: "pointer" }} onClick={onUnlock}>
          <div style={{ filter: "blur(5px)", pointerEvents: "none" }}>
            {tab === "preview" && emailTemplate.body ? (
              <div style={{ background: "white", borderRadius: 10, overflow: "hidden" }}>
                <iframe srcDoc={emailTemplate.body} style={{ width: "100%", height: 300, border: "none", display: "block" }} title="email preview" />
              </div>
            ) : (
              <pre style={{ background: "#1a1a1a", borderRadius: 8, padding: 14, fontSize: 11, color: "#ccc", overflow: "auto", maxHeight: 300, margin: 0, lineHeight: 1.6 }}>
                {emailTemplate.body}
              </pre>
            )}
          </div>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.5)", gap: 8, borderRadius: 10,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: brandColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div style={{ color: "#000", fontSize: 13, fontWeight: 700 }}>לחץ לצפייה בתבנית המייל</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdSkeleton({ index, brandColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e0e0" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, background: "#e0e0e0", borderRadius: 4, width: "60%", marginBottom: 6 }} />
            <div style={{ height: 10, background: "#f0f0f0", borderRadius: 4, width: "30%" }} />
          </div>
        </div>
        <div style={{ padding: "0 14px 10px" }}>
          <div style={{ height: 10, background: "#f0f0f0", borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 10, background: "#f0f0f0", borderRadius: 4, width: "80%" }} />
        </div>
        <div style={{ position: "relative", height: 220, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={32} color={brandColor} />
          </motion.div>
          <div style={{ position: "absolute", bottom: 12, fontSize: 11, color: "#999" }}>מייצר תמונה...</div>
        </div>
        <div style={{ background: "#f0f2f5", padding: "10px 14px" }}>
          <div style={{ height: 12, background: "#e0e0e0", borderRadius: 4, width: "70%", marginBottom: 6 }} />
          <div style={{ height: 10, background: "#e0e0e0", borderRadius: 4, width: "50%" }} />
        </div>
      </div>
      <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: brandColor, padding: "12px 16px", opacity: 0.7 }}>
          <div style={{ height: 12, background: "rgba(255,255,255,0.3)", borderRadius: 4, width: "40%" }} />
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {[70, 50, 100, 40].map((w, i) => (
            <div key={i} style={{ height: 10, background: "#e0e0e0", borderRadius: 4, width: `${w}%` }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsStep({ ads, isLoading, businessInfo, emailTemplate, lang = "he" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const brandColor = getBrandColor(businessInfo);

  const totalSlots = 3;

  // Show loading only while waiting for copy (not images)
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block", marginBottom: 20 }}
        >
          <Loader2 size={48} color={brandColor} />
        </motion.div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#000" }}>{lang === "en" ? "Creating your ads..." : "יוצר פרסומות..."}</div>
        <div style={{ fontSize: 13, color: "#666" }}>{lang === "en" ? "Writing personalized copy" : "כתיבת קופי מותאם אישית"}</div>
      </div>
    );
  }

  return (
    <div>
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        businessInfo={businessInfo}
        onSuccess={() => {
          setUnlocked(true);
          setModalOpen(false);
          // trigger download of first ad image
          if (ads[0]?.imageUrl) {
            downloadImage(ads[0].imageUrl, `ad-${businessInfo?.name || "image"}.jpg`);
          }
        }}
      />

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 8 }}>{lang === "en" ? "Step 3 of 3" : "שלב 3 מתוך 3"}</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "#000" }}>{lang === "en" ? "Your Ads Are Ready" : "הפרסומות שלך מוכנות"}</h2>
        <p style={{ fontSize: 13, color: "#666" }}>
          {lang === "en" ? `${ads.length} personalized versions for your business` : `${ads.length} גרסאות מותאמות אישית לעסק שלך`}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 28 }}>
        {Array.from({ length: totalSlots }).map((_, i) =>
          ads[i] ? (
            <AdCard
              key={i}
              ad={ads[i]}
              index={i}
              businessInfo={businessInfo}
              unlocked={unlocked}
              onUnlock={() => setModalOpen(true)}
              lang={lang}
            />
          ) : (
            <AdSkeleton key={i} index={i} brandColor={brandColor} />
          )
        )}
      </div>

      {emailTemplate && (
        <EmailTemplate
          emailTemplate={emailTemplate}
          onUnlock={() => setModalOpen(true)}
          brandColor={brandColor}
        />
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: "#000", borderRadius: 20, padding: "28px 24px", textAlign: "center" }}
      >
        <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: "#fff" }}>
          {lang === "en" ? "Want these ads as ready-to-use images?" : "רוצה לקבל את הפרסומות האלה כתמונות מוכנות?"}
        </h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 20 }}>
          {lang === "en"
            ? <>Join Bildo and get access to digital workers who create ads,<br />manage your WhatsApp and grow sales automatically.</>
            : <>הצטרף לבילדו וקבל גישה לעובדים דיגיטליים שיצרו פרסומות,<br />ינהלו את הוואטסאפ שלך ויגדילו את המכירות אוטומטית.</>}
        </p>
        <a
          href="https://buildoai.com/worker-onboarding"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: brandColor, color: "#fff", textDecoration: "none",
            borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 800,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          {lang === "en" ? "Join Bildo Now" : "הצטרף לבילדו עכשיו"} <ArrowRight size={16} />
        </a>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
          {lang === "en" ? "No credit card · Free trial · Response within hours" : "ללא כרטיס אשראי · ניסיון חינם · מענה תוך שעות"}
        </div>
      </motion.div>
    </div>
  );
}