import { useState } from 'react';
import { MapPin, Phone, Mail, ArrowUpRight, Radio } from 'lucide-react';
import { openCookieSettings } from '../lib/consent';

function FacebookIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
}
function YoutubeIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}
function TikTokIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>;
}
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.746-.873-2.888-1.557-4.036-3.53-.306-.526.306-.489.874-1.627.096-.198.048-.371-.05-.52-.1-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.372-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.073 3.163 5.025 4.312 2.95 1.148 2.95.766 3.942.64.99-.124 2.183-.86 2.439-1.86.255-.998.255-1.86.18-2.01-.075-.149-.307-.223-.605-.372z"/>
      <path d="M12.04 2.004c-5.46 0-9.91 4.447-9.91 9.91 0 1.746.46 3.455 1.333 4.95L2.057 22l5.254-1.378a9.86 9.86 0 0 0 4.728 1.202h.004c5.46 0 9.908-4.447 9.908-9.91 0-2.647-1.03-5.136-2.9-7.007a9.822 9.822 0 0 0-6.999-2.903zm5.45 15.371a8.168 8.168 0 0 1-5.455 2.08h-.003a8.14 8.14 0 0 1-4.147-1.138l-.297-.177-2.93.768.782-2.857-.194-.294a8.146 8.146 0 0 1-1.247-4.343c.002-4.506 3.672-8.175 8.185-8.175 2.187 0 4.244.852 5.79 2.398a8.133 8.133 0 0 1 2.396 5.788c0 4.507-3.671 8.176-8.18 8.176-.005 0-.005 0 0 0z"/>
    </svg>
  );
}

interface FooterProps {
  onNavigate?: (page: string) => void;
  onCategoryClick?: (category: string) => void;
}

const CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle', 'International'];

const QUICK_LINKS = [
  { label: 'Trending',          page: 'trending' },
  { label: 'Videos',            page: 'videos' },
  { label: 'Live TV',           page: 'live' },
  { label: 'Archives',          page: 'archives' },
  { label: 'Podcasts',          page: 'podcasts' },
  { label: 'Editorials',        page: 'editorials' },
  { label: 'Fact Check',        page: 'factcheck' },
  { label: 'Business Directory',page: 'directory' },
  { label: 'Community',         page: 'community' },
  { label: 'Submit a Story',    page: 'submit' },
  { label: 'Advertise',         page: 'advertise' },
];

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaDxjSPKgsNn2w0XDI1k';

const SOCIAL = [
  { Icon: WhatsAppIcon,  href: WHATSAPP_CHANNEL_URL, label: 'WhatsApp Channel' },
  { Icon: FacebookIcon,  href: 'https://www.facebook.com/share/1B519RZZYj/?mibextid=wwXIfr', label: 'Facebook' },
  { Icon: InstagramIcon, href: 'https://www.instagram.com/bosomtwi_web?igsh=MXZoNXY5MWRmMzV3bQ%3D%3D', label: 'Instagram' },
  { Icon: YoutubeIcon,   href: 'https://youtube.com/@bosomtwi_web_news', label: 'YouTube' },
  { Icon: TikTokIcon,    href: 'https://www.tiktok.com/@bosomtwi_web_news', label: 'TikTok' },
];

export default function Footer({ onNavigate, onCategoryClick }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-ashanti-green text-white">

      {/* ── Kente stripe ────────────────────────────────────── */}
      <div className="kente-stripe" />

      {/* ── Top CTA band ────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-black/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-ashanti-gold mb-1">Free Newsletter</p>
            <h3 className="font-heading text-2xl font-bold text-white">Daily headlines, straight to your inbox.</h3>
          </div>
          {subscribed ? (
            <p className="text-sm font-bold text-ashanti-gold uppercase tracking-widest">✓ You're subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md rounded-xl overflow-hidden border border-white/10">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow bg-white/5 border-0 px-5 py-3.5 text-white text-sm placeholder:text-white/25 focus:outline-none" />
              <button type="submit"
                className="bg-ashanti-gold text-black px-6 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shrink-0">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main footer columns ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={() => onCategoryClick?.('')} className="inline-block mb-5 bg-white rounded-xl p-2 shadow-md">
              <img src="/logo.png" alt="BOSOMTWIWEB" className="h-12 w-auto object-contain" />
            </button>
            <p className="text-white/40 text-sm leading-relaxed mb-6 italic">
              YOUR VOICE. OUR MISSION. — The premier digital media platform for Bosomtwe, the Ashanti Region, and beyond.
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mb-8">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-ashanti-gold hover:border-ashanti-gold hover:text-black transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Google Preferred Sources — lets a reader mark Bosomtwi Web as
                a preferred source so they see more of our stories in
                Google Search/Discover/News. Script tag is in index.html;
                this div is auto-upgraded into Google's own button. */}
            <div className="mb-6">
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-2">See more of our stories on Google</p>
              <div google-add-preferred-source-btn="" data-theme="dark"></div>
            </div>

            {/* Live TV + WhatsApp Channel pills */}
            <div className="flex flex-wrap gap-2.5">
              <button onClick={() => onNavigate?.('live')}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <Radio size={12} />
                Watch Live TV
                <ArrowUpRight size={11} />
              </button>
              <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe59] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <WhatsAppIcon size={12} />
                Follow on WhatsApp
                <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* Col 2: Coverage */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-5">News Coverage</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button onClick={() => onCategoryClick?.(cat)}
                    className="text-sm text-white/40 hover:text-ashanti-gold transition-colors font-medium">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-5">Quick Links</h4>
            <ul className="space-y-2.5 mb-8">
              {QUICK_LINKS.map(({ label, page }) => (
                <li key={page}>
                  <button onClick={() => onNavigate?.(page)}
                    className="text-sm text-white/40 hover:text-ashanti-gold transition-colors font-medium">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-5">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us',         page: 'about' },
                { label: 'Careers',          page: 'careers' },
                { label: 'Contact Us',       page: 'contact' },
                { label: 'Privacy Policy',   page: 'privacy' },
                { label: 'Terms of Service', page: 'terms' },
              ].map(({ label, page }) => (
                <li key={page}>
                  <button onClick={() => onNavigate?.(page)}
                    className="text-sm text-white/40 hover:text-ashanti-gold transition-colors font-medium">
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={openCookieSettings}
                  className="text-sm text-white/40 hover:text-ashanti-gold transition-colors font-medium">
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact + Stats */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-5">Contact Us</h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-white/40">
                <MapPin size={14} className="text-ashanti-gold shrink-0 mt-0.5" />
                <span>Kumasi, Ashanti Region, Ghana</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Phone size={14} className="text-ashanti-gold shrink-0" />
                <span>+233 (0) 0241 963 600</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Mail size={14} className="text-ashanti-gold shrink-0" />
                <a href="mailto:bosomtwiweb@gmail.com"
                  className="hover:text-ashanti-gold transition-colors">
                  bosomtwiweb@gmail.com
                </a>
              </li>
            </ul>

            {/* Trust stats */}
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <p className="text-[9px] uppercase tracking-widest font-black text-white/30 mb-3">Media Stats</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Readers', value: '24K+' },
                  { label: 'Articles', value: '500+' },
                  { label: 'Followers', value: '12K+' },
                  { label: 'Videos', value: '150+' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="font-heading text-lg font-bold text-ashanti-gold">{value}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/30 font-bold">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Gold divider ──────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-ashanti-gold/30 to-transparent mb-8" />

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/20 font-bold">
          <p>© {new Date().getFullYear()} Bosomtwi Web Media. All rights reserved.</p>
          <p className="text-ashanti-gold/40 italic normal-case text-[11px] tracking-normal font-medium">
            "YOUR VOICE. OUR MISSION."
          </p>
          <div className="flex gap-5">
            <button onClick={() => onNavigate?.('privacy')} className="hover:text-ashanti-gold transition-colors">Privacy</button>
            <button onClick={() => onNavigate?.('terms')} className="hover:text-ashanti-gold transition-colors">Terms</button>
            <button onClick={() => onNavigate?.('advertise')} className="hover:text-ashanti-gold transition-colors">Advertise</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
