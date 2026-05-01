import { useState } from 'react';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

function TikTokIcon({ size = 17, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z" />
    </svg>
  );
}

interface FooterProps {
  onNavigate?: (page: string) => void;
  onCategoryClick?: (category: string) => void;
}

const CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle', 'International'];

const SECTIONS = [
  { label: 'Trending', page: 'trending' },
  { label: 'Videos', page: 'videos' },
  { label: 'Live', page: 'live' },
  { label: 'Archives', page: 'archives' },
];

const SOCIAL = [
  { Icon: Facebook,  href: 'https://www.facebook.com/share/1B519RZZYj/?mibextid=wwXIfr', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/bosomtwi_web?igsh=MXZoNXY5MWRmMzV3bQ%3D%3D&utm_source=qr', label: 'Instagram' },
  { Icon: Youtube,   href: 'https://youtube.com/@bosomtwi_web_news?si=Q1xhFNZ42xo4uKeM', label: 'YouTube' },
  { Icon: TikTokIcon, href: 'https://www.tiktok.com/@bosomtwi_web_news?_r=1&_t=ZS-95g3WG3MCer', label: 'TikTok' },
];

export default function Footer({ onNavigate, onCategoryClick }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-brand-surface text-news-text pt-20 pb-10 border-t border-brand-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Branding */}
          <div className="sm:col-span-2 lg:col-span-2">
            <button onClick={() => onCategoryClick?.('')} className="flex items-center mb-6 w-fit group">
              <img src="/logo.png" alt="Bosomtwi Web" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
            </button>
            <p className="text-news-text/40 max-w-md mb-8 leading-relaxed text-base italic">
              The premier destination for news, analysis, and culture in the Ashanti Region and beyond.
              Committed to delivering the truth with integrity and passion.
            </p>

            <div className="flex gap-3 mb-8">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-brand-secondary/20 flex items-center justify-center hover:bg-ashanti-gold hover:border-ashanti-gold transition-all group"
                >
                  <Icon size={17} className="text-news-text/50 group-hover:text-black transition-colors" />
                </a>
              ))}
            </div>

            <ul className="space-y-2 text-xs text-news-text/40">
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-ashanti-gold shrink-0" />
                <span>Kumasi, Ashanti Region, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-ashanti-gold shrink-0" />
                <span>+233 (0) 0241 963 600</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-ashanti-gold shrink-0" />
                <a href="mailto:info@bosomtwi.web" className="hover:text-ashanti-gold transition-colors">
                  bosomtwiweb@gmail.com/ info@bosomtwi.web
                </a>
              </li>
            </ul>
          </div>

          {/* Sections + Categories */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-ashanti-gold">Sections</h3>
            <ul className="space-y-2 mb-8">
              {SECTIONS.map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => onNavigate?.(page)}
                    className="text-xs font-bold uppercase tracking-widest text-news-text/40 hover:text-ashanti-gold transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-ashanti-gold">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onCategoryClick?.(cat)}
                    className="text-xs font-bold uppercase tracking-widest text-news-text/40 hover:text-ashanti-gold transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Newsletter */}
          <div className="space-y-10">
            <div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-6 text-ashanti-gold">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', page: 'privacy' },
                  { label: 'Terms of Service', page: 'terms' },
                  { label: 'Advertise With Us', page: 'advertise' },
                ].map(({ label, page }) => (
                  <li key={page}>
                    <button
                      onClick={() => onNavigate?.(page)}
                      className="text-xs font-bold uppercase tracking-widest text-news-text/40 hover:text-ashanti-gold transition-colors"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-ashanti-gold">Newsletter</h3>
              <p className="text-xs text-news-text/40 mb-4 italic leading-relaxed">
                Daily headlines from Ashanti Region, delivered to your inbox.
              </p>
              {subscribed ? (
                <p className="text-xs font-bold text-ashanti-gold uppercase tracking-wider">
                  ✓ You're subscribed!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-white border border-brand-secondary/20 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-ashanti-gold text-news-text transition-colors pr-12 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 w-8 h-8 bg-ashanti-gold rounded flex items-center justify-center hover:bg-news-text transition-colors text-black hover:text-ashanti-gold"
                  >
                    <Mail size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-brand-secondary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-news-text/25 font-bold">
          <p>© {new Date().getFullYear()} Bosomtwi Web Media. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => onNavigate?.('privacy')} className="hover:text-ashanti-gold transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate?.('terms')} className="hover:text-ashanti-gold transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate?.('advertise')} className="hover:text-ashanti-gold transition-colors">Advertise</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
