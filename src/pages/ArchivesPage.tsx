import { useState, useMemo } from 'react';
import { Article } from '../types';
import { motion } from 'motion/react';
import { Search, Archive, Clock, Filter, ArrowRight, X } from 'lucide-react';

interface ArchivesPageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  loading?: boolean;
}

const ALL_CATEGORIES = ['All', 'Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle', 'Health', 'Local', 'International'];

function groupByMonth(articles: Article[]) {
  const groups: Record<string, Article[]> = {};
  articles.forEach(a => {
    const key = new Date(a.publishedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return groups;
}

export default function ArchivesPage({ articles, onArticleClick, loading }: ArchivesPageProps) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = useMemo(() => {
    return articles
      .filter(a => {
        const q = query.toLowerCase();
        const matchQuery = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
        const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
        return matchQuery && matchCat;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles, query, categoryFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);
  const months = Object.keys(grouped);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Loading archives…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* Header */}
      <header className="relative bg-brand-surface border-b border-brand-secondary/20 py-14 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ashanti-gold opacity-3 blur-[120px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <Archive size={20} className="text-ashanti-gold" />
              <span className="text-ashanti-gold text-[11px] uppercase font-black tracking-[0.5em]">Complete Archive</span>
            </div>
            <h1 className="font-heading text-6xl md:text-8xl font-black text-news-text uppercase leading-none tracking-tighter">
              Archives
            </h1>
            <p className="mt-3 text-news-text/40 text-sm max-w-lg">
              Every story we've ever published, searchable and organised by date and section.
              {' '}<span className="font-bold text-news-text/60">{articles.length} articles</span> total.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 sticky top-0 z-20 bg-news-bg/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-brand-secondary/10">
          <div className="relative flex-grow max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-news-text/30" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword…"
              className="w-full bg-white border border-brand-secondary/20 rounded-xl py-3 pl-11 pr-10 text-sm font-bold focus:outline-none focus:border-ashanti-gold transition-all shadow-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-news-text/30 hover:text-news-text">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-news-text/30 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-brand-secondary/20 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-ashanti-gold cursor-pointer appearance-none"
            >
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(query || categoryFilter !== 'All') && (
            <button
              onClick={() => { setQuery(''); setCategoryFilter('All'); }}
              className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold hover:text-news-text transition-colors flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <Archive size={48} className="mx-auto mb-4 text-news-text/10" />
            <p className="font-heading text-2xl text-news-text/30 italic">No articles found</p>
            <p className="text-sm text-news-text/20 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {months.map(month => (
              <div key={month}>
                {/* Month divider */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-heading text-2xl font-black text-news-text/20 uppercase tracking-tight">{month}</span>
                  <div className="flex-grow h-px bg-brand-secondary/10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-news-text/20">
                    {grouped[month].length} {grouped[month].length === 1 ? 'story' : 'stories'}
                  </span>
                </div>

                <div className="space-y-0">
                  {grouped[month].map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => onArticleClick(article)}
                      className="flex items-center gap-4 py-4 border-b border-brand-secondary/10 cursor-pointer group hover:bg-brand-surface/50 -mx-4 px-4 transition-colors"
                    >
                      {/* Date */}
                      <div className="w-12 text-center shrink-0">
                        <span className="block text-lg font-black text-news-text/20 leading-none">
                          {new Date(article.publishedAt).getDate()}
                        </span>
                        <span className="block text-[9px] font-black uppercase text-news-text/20">
                          {new Date(article.publishedAt).toLocaleDateString('en-GB', { month: 'short' })}
                        </span>
                      </div>

                      {/* Thumbnail */}
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'}
                        alt={article.title}
                        className="w-16 h-12 rounded-xl object-cover shrink-0 hidden sm:block"
                      />

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-ashanti-gold">{article.category}</span>
                          <span className="text-news-text/20 text-[9px]">·</span>
                          <span className="text-[9px] text-news-text/30 font-bold">{article.author}</span>
                        </div>
                        <h4 className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-snug line-clamp-1 text-sm md:text-base">
                          {article.title}
                        </h4>
                        <p className="text-xs text-news-text/40 mt-0.5 line-clamp-1 hidden md:block">{article.excerpt}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Clock size={11} className="text-news-text/20" />
                        <ArrowRight size={14} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
