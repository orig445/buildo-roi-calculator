// Detect browser language — returns 'en' or 'he'
export function getLanguage() {
  const lang = navigator.language || navigator.userLanguage || "he";
  return lang.toLowerCase().startsWith("en") ? "en" : "he";
}

export function useLanguage() {
  return getLanguage();
}