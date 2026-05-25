import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Phone, Globe, Star, Building2, ChevronRight, Plus } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';

interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  phone?: string;
  website?: string;
  rating: number;
  verified: boolean;
  image: string;
}

const BUSINESSES: Business[] = [
  { id: 1, name: 'Ashanti Gold Jewellers', category: 'Retail', description: 'Authentic Ghanaian gold jewellery crafted by master artisans in the heart of Kumasi.', location: 'Adum, Kumasi', phone: '+233 24 111 2233', website: '#', rating: 4.8, verified: true, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop' },
  { id: 2, name: 'Kejetia Tech Hub', category: 'Technology', description: 'Co-working space and startup incubator supporting the next generation of Ghanaian tech founders.', location: 'Kejetia, Kumasi', phone: '+233 20 234 5678', website: '#', rating: 4.6, verified: true, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop' },
  { id: 3, name: 'Osei Farms & Produce', category: 'Agriculture', description: 'Fresh organic produce direct from our farms in the Ashanti Region to your table.', location: 'Ejisu, Ashanti', phone: '+233 27 567 8901', rating: 4.5, verified: true, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300&h=200&fit=crop' },
  { id: 4, name: 'Bosomtwi Hospitality', category: 'Hospitality', description: 'Boutique hotel and conference centre with stunning views of Lake Bosomtwi.', location: 'Abono, Lake Bosomtwi', phone: '+233 32 222 1100', website: '#', rating: 4.9, verified: true, image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=300&h=200&fit=crop' },
  { id: 5, name: 'Kumasi Legal Group', category: 'Legal Services', description: 'Full-service law firm specialising in corporate, property, and family law for Ashanti businesses.', location: 'Bantama, Kumasi', phone: '+233 32 244 6677', website: '#', rating: 4.7, verified: true, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop' },
  { id: 6, name: 'Adinkra Design Studio', category: 'Creative', description: 'Graphic design, branding, and digital marketing for businesses across Ghana.', location: 'Airport Area, Kumasi', phone: '+233 24 890 1234', rating: 4.4, verified: false, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop' },
  { id: 7, name: 'GoldCoast Auto Parts', category: 'Automotive', description: 'Genuine spare parts for all vehicles. Fast delivery across Ashanti Region.', location: 'Magazine, Kumasi', phone: '+233 20 777 8899', rating: 4.3, verified: false, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop' },
  { id: 8, name: 'Asante Health Clinic', category: 'Healthcare', description: 'Comprehensive outpatient services, diagnostics, and specialist consultations.', location: 'Nhyiaeso, Kumasi', phone: '+233 32 202 3344', website: '#', rating: 4.6, verified: true, image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=200&fit=crop' },
];

const CATEGORIES = ['All', 'Retail', 'Technology', 'Agriculture', 'Hospitality', 'Legal Services', 'Creative', 'Automotive', 'Healthcare'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={10} className={s <= Math.round(rating) ? 'fill-ashanti-gold text-ashanti-gold' : 'text-news-border'} />
      ))}
      <span className="text-[10px] text-news-muted ml-1">{rating}</span>
    </div>
  );
}

export default function BusinessDirectoryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = BUSINESSES.filter(b => {
    const matchCat = category === 'All' || b.category === category;
    const q = query.toLowerCase();
    const matchQ = q.length < 2 || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.location.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="Business Directory"
        badge="Ashanti Businesses"
        description="Discover and support local businesses across the Ashanti Region. From startups to established enterprises."
        count={`${BUSINESSES.length} businesses`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-news-muted" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search businesses, services, locations…"
              className="w-full bg-news-card border border-news-border rounded-xl pl-11 pr-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
          </div>
          <a href="mailto:directory@bosomtwi.web"
            className="flex items-center gap-2 px-5 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all whitespace-nowrap">
            <Plus size={13} /> List Your Business
          </a>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${category === cat ? 'bg-ashanti-gold text-black border-ashanti-gold' : 'bg-news-card text-news-muted border-news-border hover:border-ashanti-gold hover:text-ashanti-gold'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-6">
          {filtered.length} {filtered.length === 1 ? 'Business' : 'Businesses'} Found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={40} className="text-news-border mx-auto mb-4" />
            <p className="text-news-muted">No businesses match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((biz, i) => (
              <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-news-card border border-news-border rounded-2xl overflow-hidden hover:border-ashanti-gold/30 transition-all group flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {biz.category}
                    </span>
                    {biz.verified && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-ashanti-gold text-black px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-heading font-bold text-news-text text-sm leading-tight">{biz.name}</h3>
                  </div>
                  <StarRating rating={biz.rating} />
                  <p className="text-news-muted text-xs leading-relaxed mt-2 mb-3 line-clamp-2 flex-1">{biz.description}</p>
                  <div className="space-y-1.5 text-[10px] text-news-muted">
                    <div className="flex items-center gap-1.5"><MapPin size={10} className="shrink-0 text-ashanti-gold" />{biz.location}</div>
                    {biz.phone && <div className="flex items-center gap-1.5"><Phone size={10} className="shrink-0 text-ashanti-gold" />{biz.phone}</div>}
                  </div>
                  {biz.website && (
                    <a href={biz.website} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-[10px] font-bold text-ashanti-gold hover:underline">
                      <Globe size={10} /> Visit Website <ChevronRight size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List your business CTA */}
        <div className="mt-14 p-8 bg-ashanti-green/10 border border-ashanti-green/20 rounded-3xl flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="font-heading text-xl font-black text-news-text mb-2">Is Your Business Listed?</h2>
            <p className="text-news-muted text-sm">
              Get your business in front of over 1 million monthly readers. Listings are free for Ashanti Region businesses.
            </p>
          </div>
          <a href="mailto:directory@bosomtwi.web"
            className="flex items-center gap-2 px-7 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all whitespace-nowrap shrink-0">
            <Plus size={14} /> Add Free Listing
          </a>
        </div>
      </div>
    </div>
  );
}
