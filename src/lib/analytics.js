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

export const trackEvent = (event, page, step = null, meta = null) => {
  base44.entities.AnalyticsEvent.create({
    event,
    page,
    step: step || undefined,
    session_id: getSessionId(),
    meta: meta ? JSON.stringify(meta) : undefined,
  }).catch(() => {}); // fire & forget, never block UI
};