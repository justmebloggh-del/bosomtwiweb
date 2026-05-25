import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AdSize = 'leaderboard' | 'rectangle' | 'square' | 'wide';

interface AdBannerProps {
  size?: AdSize;
  className?: string;
  customAd?: {
    brand: string;
    tagline: string;
    cta: string;
    bg: string;
    accent: string;
    label: string;
    logo: string;
  };
}

const ADS = [
  {
    brand: 'Kumasi City Mall',
    tagline: 'Shop Premium. Live Royal.',
    cta: 'Visit Now',
    bg: 'from-amber-50 to-yellow-100',
    accent: '#E09E2B',
    label: 'Retail',
    logo: '🛍️',
  },
  {
    brand: 'Ashanti Gold Bank',
    tagline: 'Your Wealth, Our Promise.',
    cta: 'Open Account',
    bg: 'from-blue-50 to-indigo-100',
    accent: '#0A1B35',
    label: 'Finance',
    logo: '🏦',
  },
  {
    brand: 'Osei Motors GH',
    tagline: 'Drive the Future Today.',
    cta: 'Book a Test Drive',
    bg: 'from-gray-50 to-slate-100',
    accent: '#374151',
    label: 'Automotive',
    logo: '🚗',
  },
  {
    brand: 'Bosomtwi Resort',
    tagline: 'Escape to Paradise.',
    cta: 'Book Now',
    bg: 'from-green-50 to-emerald-100',
    accent: '#2D7A31',
    label: 'Tourism',
    logo: '🌿',
  },
  {
    brand: 'Kente Fashion Hub',
    tagline: 'Wear Your Heritage.',
    cta: 'Shop Collection',
    bg: 'from-orange-50 to-red-100',
    accent: '#DC2626',
    label: 'Fashion',
    logo: '👘',
  },
  {
    brand: 'GhanaTech Academy',
    tagline: 'Code the Next Generation.',
    cta: 'Enroll Free',
    bg: 'from-purple-50 to-violet-100',
    accent: '#7C3AED',
    label: 'Education',
    logo: '💻',
  },
];

function getAdIndex(seed: number, pool: number) {
  return seed % pool;
}

// Module-level cache so all AdBanner instances share one fetch
let _liveAds: any[] | null = null;
let _fetchedAt = 0;

function mapLiveAd(a: any) {
  return {
    brand:   a.brand,
    tagline: a.tagline || '',
    cta:     a.cta_text || 'Learn More',
    ctaUrl:  a.cta_url || '#',
    bg:      'from-amber-50 to-yellow-50',
    accent:  a.accent_color || '#E09E2B',
    label:   a.package_tier || 'Sponsored',
    logo:    a.logo || '📢',
  };
}

function AdLogo({ logo, size = 'md' }: { logo: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-8 h-8 text-2xl', md: 'w-10 h-10 text-3xl', lg: 'w-12 h-12 text-4xl' };
  if (logo.startsWith('http')) {
    return <img src={logo} alt="Ad logo" className={`${sizeMap[size]} rounded-lg object-contain border border-gray-100 bg-white`} />;
  }
  return <span className={sizeMap[size].split(' ').slice(2).join(' ')}>{logo}</span>;
}

export default function AdBanner({ size = 'rectangle', className = '', customAd }: AdBannerProps) {
  const [liveAds, setLiveAds] = useState<typeof ADS>(_liveAds ? _liveAds.map(mapLiveAd) : []);

  useEffect(() => {
    if (_liveAds && Date.now() - _fetchedAt < 300_000) {
      setLiveAds(_liveAds.map(mapLiveAd));
      return;
    }
    supabase.from('live_ads').select('*').eq('active', true).then(({ data }) => {
      _liveAds = data || [];
      _fetchedAt = Date.now();
      setLiveAds(_liveAds.map(mapLiveAd));
    });
  }, []);

  const slot = Math.floor(Date.now() / 60000) + (size === 'leaderboard' ? 0 : size === 'wide' ? 2 : size === 'square' ? 4 : 1);
  const pool = liveAds.length > 0 ? liveAds : ADS;
  const ad = customAd || pool[getAdIndex(slot, pool.length)];

  if (size === 'leaderboard') {
    return (
      <div className={`w-full bg-gradient-to-r ${ad.bg} dark:bg-none dark:bg-news-card border border-gray-200 dark:border-news-border rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all ${className}`}>
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center space-x-6">
            <AdLogo logo={ad.logo} size="lg" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-news-muted mb-0.5">
                Sponsored • {ad.label}
              </p>
              <h4 className="font-heading text-xl font-black text-gray-800 dark:text-news-text leading-tight">{ad.brand}</h4>
              <p className="text-sm text-gray-500 dark:text-news-muted font-medium italic">{ad.tagline}</p>
            </div>
          </div>
          <a
            href={(ad as any).ctaUrl || '#'}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-black text-[11px] uppercase tracking-widest text-white transition-all hover:opacity-80 whitespace-nowrap"
            style={{ backgroundColor: ad.accent }}
          >
            <span>{ad.cta}</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="absolute top-2 right-20 text-[8px] font-bold uppercase tracking-widest text-gray-300">Ad</div>
      </div>
    );
  }

  if (size === 'wide') {
    return (
      <div className={`w-full bg-gradient-to-r ${ad.bg} dark:bg-none dark:bg-news-card border border-gray-200 dark:border-news-border rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all ${className}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AdLogo logo={ad.logo} size="sm" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-news-muted">Sponsored</p>
              <h4 className="font-bold text-gray-800 dark:text-news-text text-sm leading-tight">{ad.brand} — <span className="font-normal text-gray-500 dark:text-news-muted italic">{ad.tagline}</span></h4>
            </div>
          </div>
          <a
            href={(ad as any).ctaUrl || '#'}
            target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest text-white hover:opacity-80 transition-all whitespace-nowrap"
            style={{ backgroundColor: ad.accent }}
          >
            {ad.cta}
          </a>
        </div>
      </div>
    );
  }

  if (size === 'square') {
    const ad2 = pool[getAdIndex(slot + 1, pool.length)];
    return (
      <div className={`bg-gradient-to-br ${ad2.bg} dark:bg-none dark:bg-news-card border border-gray-200 dark:border-news-border rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all aspect-square flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-news-muted mb-3">Sponsored</p>
        <div className="mb-3"><AdLogo logo={ad2.logo} size="lg" /></div>
        <h4 className="font-heading font-black text-gray-800 dark:text-news-text text-lg leading-tight mb-1">{ad2.brand}</h4>
        <p className="text-gray-500 dark:text-news-muted text-xs italic mb-4">{ad2.tagline}</p>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest text-white hover:opacity-80 transition-all"
          style={{ backgroundColor: ad2.accent }}
        >
          {ad2.cta}
        </a>
      </div>
    );
  }

  // Default: rectangle
  return (
    <div className={`w-full bg-gradient-to-br ${ad.bg} dark:bg-none dark:bg-news-card border border-gray-200 dark:border-news-border rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all ${className}`}>
      <div className="p-6">
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-news-muted mb-3">Advertisement</p>
        <div className="flex items-start space-x-4 mb-4">
          <AdLogo logo={ad.logo} size="md" />
          <div>
            <h4 className="font-heading font-black text-gray-800 dark:text-news-text text-lg leading-tight">{ad.brand}</h4>
            <p className="text-gray-500 dark:text-news-muted text-sm italic">{ad.tagline}</p>
          </div>
        </div>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-black text-[11px] uppercase tracking-widest text-white hover:opacity-80 transition-all"
          style={{ backgroundColor: ad.accent }}
        >
          <span>{ad.cta}</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
