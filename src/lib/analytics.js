import { base44 } from "@/api/base44Client";

// Generate or reuse a session ID per browser session
const getSessionId = () => {
  let sid = sessionStorage.getItem("bildo_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("bildo_sid", sid);
  }
  return sid;
};

// Capture UTM params + referrer once per session
const getTrackingContext = () => {
  const params = new URLSearchParams(window.location.search);
  const cached = (() => {
    try { return JSON.parse(sessionStorage.getItem("bildo_ctx") || "{}"); } catch { return {}; }
  })();
  const ctx = {
    utm_source: params.get("utm_source") || cached.utm_source || "",
    utm_medium: params.get("utm_medium") || cached.utm_medium || "",
    utm_campaign: params.get("utm_campaign") || cached.utm_campaign || "",
    utm_content: params.get("utm_content") || cached.utm_content || "",
    landing_page: cached.landing_page || window.location.pathname,
    referrer: cached.referrer || document.referrer || "",
    visitor_type: localStorage.getItem("bildo_returning") ? "returning" : "new",
    language: navigator.language?.startsWith("he") ? "he" : "en",
  };
  sessionStorage.setItem("bildo_ctx", JSON.stringify(ctx));
  localStorage.setItem("bildo_returning", "1");
  return ctx;
};

export const trackEvent = (event, page, step = null, meta = null) => {
  const ctx = getTrackingContext();
  base44.entities.AnalyticsEvent.create({
    event,
    page,
    step: step || undefined,
    session_id: getSessionId(),
    meta: JSON.stringify({ ...ctx, ...(meta || {}) }),
  }).catch(() => {});
};

// Convenience wrappers matching tracking plan
export const track = {
  pageView: (page, extra) => trackEvent("page_view", page, null, extra),
  freeToolStarted: (page, tool_name, extra) => trackEvent("free_tool_started", page, null, { tool_name, ...extra }),
  freeToolCompleted: (page, tool_name, extra) => trackEvent("free_tool_completed", page, null, { tool_name, ...extra }),
  emailCaptured: (page, tool_name, extra) => trackEvent("email_captured", page, null, { tool_name, ...extra }),
  signupStarted: (page, extra) => trackEvent("signup_started", page, null, extra),
  demoClicked: (page, extra) => trackEvent("demo_clicked", page, null, extra),
  demoBooked: (page, extra) => trackEvent("demo_booked", page, null, extra),
};