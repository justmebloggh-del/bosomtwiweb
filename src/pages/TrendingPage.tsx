import { Article } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Clock, ArrowRight, Flame } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';

interface TrendingPageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Manhyia: '#8B4513', Politics: '#1E40AF', Business: '#065F46',
  Sports: '#7C3AED', Entertainment: '#BE185D', Technology: '#0369A1', Lifestyle: '#B45309',
  Health: '#065F46', Local: '#B45309', International: '#1E40AF',
};

export default function TrendingPage({ articles, onArticleClick, loading }: TrendingPageProps) {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const featured = sorted.slice(0, 3);
  const rest = sorted.slice(3, 20);

  const categoryCounts = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});

  const hotCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Loading trending…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      <KenteBanner
        title="Trending"
        badge="Most Read Right Now"
        description="The most read stories across all sections — updated continuously by our newsroom."
        above={<div className="flex items-center gap-2"><Flame size={18} className="text-ashanti-gold" /></div>}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hot categories */}
        <div className="flex flex-wrap gap-2 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-black text-news-text/30 flex items-center gap-2 mr-2">
            <TrendingUp size={12} /> Hot sections:
          </span>
          {hotCategories.map(([cat, count]) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: CATEGORY_COLORS[cat] || '#333' }}
            >
              {cat} ({count})
            </span>
          ))}
        </div>

        {/* Featured top 3 */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {featured.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onArticleClick(article)}
                className="relative cursor-pointer group"
              >
                <div className="absolute -top-4 -left-2 z-10">
                  <span
                    className="font-heading text-7xl font-black leading-none"
                    style={{ color: idx === 0 ? '#E09E2B' : idx === 1 ? '#C0C0C0' : '#CD7F32', WebkitTextStroke: '1px currentColor' }}
                  >
                    {idx + 1}
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-brand-secondary/10 group-hover:border-ashanti-gold/40 transition-all shadow-sm mt-6">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=600'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span
                      className="absolute bottom-3 left-3 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white rounded-md"
                      style={{ backgroundColor: CATEGORY_COLORS[article.category] || '#333' }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5 bg-white">
                    <h3 className="font-heading font-bold text-news-text leading-snug group-hover:text-ashanti-gold transition-colors line-clamp-2 text-lg mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-news-text/50 flex items-center gap-1.5">
                      <Clock size={11} />
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ranked list */}
        {rest.length > 0 && (
          <div className="space-y-0">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-news-text/30 border-b border-brand-secondary/10 pb-4 mb-0">
              More Stories
            </h2>
            {rest.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onArticleClick(article)}
                className="flex items-center gap-5 py-5 border-b border-brand-secondary/10 cursor-pointer group hover:bg-brand-surface/50 -mx-4 px-4 transition-colors"
              >
                <span className="font-heading text-2xl font-black text-news-text/20 w-10 shrink-0 text-right">
                  {idx + 4}
                </span>
                <img
                  src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'}
                  alt={article.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest mb-1 block"
                    style={{ color: CATEGORY_COLORS[article.category] || '#666' }}
                  >
                    {article.category}
                  </span>
                  <h4 className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                </div>
                <ArrowRight size={16} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-1 transition-all shrink-0" />
              </motion.div>
            ))}
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-32">
            <TrendingUp size={48} className="mx-auto mb-4 text-news-text/10" />
            <p className="font-heading text-2xl text-news-text/30 italic">No trending stories yet.</p>
            <p className="text-sm text-news-text/20 mt-2">Check back soon as our reporters file stories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
