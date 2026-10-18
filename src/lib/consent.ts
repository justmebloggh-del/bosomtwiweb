// Cookie-consent state shared between CookieConsentBanner.tsx and
// anything else that needs to know/change it (the Footer's "Cookie
// Settings" link reopens the banner rather than touching this directly).
//
// Two categories beyond "Necessary" (always on, nothing to toggle):
//  - analytics: GA4 (analytics_storage)
//  - ads: AdSense personalization (ad_storage / ad_user_data / ad_personalization)
//
// Talks to Google's Consent Mode v2 API via `window.gtag('consent', 'update', ...)`
// — the same `gtag` global index.html defines before loading gtag.js, already
// present by the time any React code runs. See index.html for the matching
// `gtag('consent', 'default', ...)` call this updates.
export const CONSENT_STORAGE_KEY = 'bw_cookie_consent';

export interface ConsentState {
  analytics: boolean;
  ads: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics === 'boolean' && typeof parsed?.ads === 'boolean') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function applyConsent(state: ConsentState): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private-browsing/storage-blocked visitors just get asked again next
    // visit — the consent update below still applies for this session.
  }
  window.gtag?.('consent', 'update', {
    ad_storage: state.ads ? 'granted' : 'denied',
    ad_user_data: state.ads ? 'granted' : 'denied',
    ad_personalization: state.ads ? 'granted' : 'denied',
    analytics_storage: state.analytics ? 'granted' : 'denied',
  });
}

export const OPEN_COOKIE_SETTINGS_EVENT = 'bw:open-cookie-settings';

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
