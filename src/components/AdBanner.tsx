import { ExternalLink } from 'lucide-react';

type AdSize = 'leaderboard' | 'rectangle' | 'square' | 'wide';

interface AdBannerProps {
  size?: AdSize;
  className?: string;
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

function getAdIndex(seed: number) {
  return seed % ADS.length;
}

export default function AdBanner({ size = 'rectangle', className = '' }: AdBannerProps) {
  // Use time-based rotation so different slots show different ads
  const slot = Math.floor(Date.now() / 60000) + (size === 'leaderboard' ? 0 : size === 'wide' ? 2 : size === 'square' ? 4 : 1);
  const ad = ADS[getAdIndex(slot)];

  if (size === 'leaderboard') {
    return (
      <div className={`w-full bg-gradient-to-r ${ad.bg} border border-gray-200 rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all ${className}`}>
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center space-x-6">
            <span className="text-4xl">{ad.logo}</span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                Sponsored • {ad.label}
              </p>
              <h4 className="font-heading text-xl font-black text-gray-800 leading-tight">{ad.brand}</h4>
              <p className="text-sm text-gray-500 font-medium italic">{ad.tagline}</p>
            </div>
          </div>
          <a
            href="#"
            onClick={e => e.preventDefault()}
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
      <div className={`w-full bg-gradient-to-r ${ad.bg} border border-gray-200 rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all ${className}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">{ad.logo}</span>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Sponsored</p>
              <h4 className="font-bold text-gray-800 text-sm leading-tight">{ad.brand} — <span className="font-normal text-gray-500 italic">{ad.tagline}</span></h4>
            </div>
          </div>
          <a
            href="#"
            onClick={e => e.preventDefault()}
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
    const ad2 = ADS[getAdIndex(slot + 1)];
    return (
      <div className={`bg-gradient-to-br ${ad2.bg} border border-gray-200 rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all aspect-square flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-3">Sponsored</p>
        <span className="text-5xl mb-3">{ad2.logo}</span>
        <h4 className="font-heading font-black text-gray-800 text-lg leading-tight mb-1">{ad2.brand}</h4>
        <p className="text-gray-500 text-xs italic mb-4">{ad2.tagline}</p>
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
    <div className={`w-full bg-gradient-to-br ${ad.bg} border border-gray-200 rounded-xl overflow-hidden relative group cursor-pointer hover:shadow-md transition-all ${className}`}>
      <div className="p-6">
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-3">Advertisement</p>
        <div className="flex items-start space-x-4 mb-4">
          <span className="text-3xl">{ad.logo}</span>
          <div>
            <h4 className="font-heading font-black text-gray-800 text-lg leading-tight">{ad.brand}</h4>
            <p className="text-gray-500 text-sm italic">{ad.tagline}</p>
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
