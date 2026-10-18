import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { applyConsent, getStoredConsent, OPEN_COOKIE_SETTINGS_EVENT, ConsentState } from '../lib/consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [draft, setDraft] = useState<ConsentState>({ analytics: true, ads: true });

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) setVisible(true);
    else setDraft(existing);

    const reopen = () => {
      setDraft(getStoredConsent() ?? { analytics: true, ads: true });
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const choose = (state: ConsentState) => {
    applyConsent(state);
    setVisible(false);
    setManaging(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[150] p-4 sm:p-6 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-news-card border border-news-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Cookie size={18} className="text-ashanti-gold shrink-0 mt-0.5" />
            <div>
              <h2 className="font-heading font-black text-news-text text-sm">We use cookies</h2>
              <p className="text-news-muted text-xs leading-relaxed mt-1">
                We use cookies for site analytics and to show relevant ads. Choose what you're comfortable
                with below — you can change this anytime via "Cookie Settings" in the footer. See our{' '}
                <span className="underline">Privacy Policy</span> for details.
              </p>
            </div>
            {managing && (
              <button
                onClick={() => { setVisible(false); setManaging(false); }}
                className="ml-auto text-news-muted hover:text-news-text transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {managing ? (
            <div className="space-y-3 mb-4">
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-news-bg border border-news-border opacity-60">
                <span className="text-xs font-bold text-news-text">Necessary — always on</span>
                <input type="checkbox" checked disabled className="accent-ashanti-gold w-4 h-4" />
              </label>
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-news-bg border border-news-border cursor-pointer">
                <span className="text-xs font-bold text-news-text">Analytics — helps us understand site usage</span>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={e => setDraft(d => ({ ...d, analytics: e.target.checked }))}
                  className="accent-ashanti-gold w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-news-bg border border-news-border cursor-pointer">
                <span className="text-xs font-bold text-news-text">Advertising — personalized ads</span>
                <input
                  type="checkbox"
                  checked={draft.ads}
                  onChange={e => setDraft(d => ({ ...d, ads: e.target.checked }))}
                  className="accent-ashanti-gold w-4 h-4"
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2.5">
            {managing ? (
              <button
                onClick={() => choose(draft)}
                className="px-5 py-2.5 bg-ashanti-gold text-black rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Save Preferences
              </button>
            ) : (
              <>
                <button
                  onClick={() => choose({ analytics: true, ads: true })}
                  className="px-5 py-2.5 bg-ashanti-gold text-black rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Accept All
                </button>
                <button
                  onClick={() => choose({ analytics: false, ads: false })}
                  className="px-5 py-2.5 bg-news-bg border border-news-border text-news-text rounded-xl font-black text-[11px] uppercase tracking-widest hover:border-ashanti-gold transition-all"
                >
                  Necessary Only
                </button>
                <button
                  onClick={() => setManaging(true)}
                  className="px-5 py-2.5 text-news-muted hover:text-ashanti-gold rounded-xl font-black text-[11px] uppercase tracking-widest transition-all"
                >
                  Manage Preferences
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
