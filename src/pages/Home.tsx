import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { Article } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, ArrowUpRight, Play, Radio, TrendingUp,
  Users, FileText, MessageSquare, BarChart2, Flame, Clock
} from 'lucide-react';

interface HomeProps {
  onArticleClick: (article: Article) => void;
  articles: Article[];
  onCategoryClick: (category: string) => void;
  onNavigate?: (page: string) => void;
  loading?: boolean;
}

const CAT_SECTIONS = [
  { cat: 'Manhyia',       color: '#0D3B1A', emoji: '👑' },
  { cat: 'Politics',      color: '#E09E2B', emoji: '🏛️' },
  { cat: 'Business',      color: '#0D3B1A', emoji: '💼' },
  { cat: 'Sports',        color: '#DC2626', emoji: '🏆' },
  { cat: 'Entertainment', color: '#7C3AED', emoji: '🎬' },
  { cat: 'Technology',    color: '#0EA5E9', emoji: '💻' },
  { cat: 'Editorials',    color: '#E09E2B', emoji: '✍️' },
];

function SectionHeader({ title, onSeeAll }: { title: string; category?: string; onSeeAll: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-1 h-8 bg-ashanti-gold rounded-full" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-news-text tracking-tight">{title}</h2>
      </div>
      <button onClick={onSeeAll}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-ashanti-gold hover:text-news-text transition-colors group">
        See All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}

function CategorySection({ cat, articles, onArticleClick, onCategoryClick }: {
  cat: typeof CAT_SECTIONS[0];
  articles: Article[];
  onArticleClick: (a: Article) => void;
  onCategoryClick: (c: string) => void;
}) {
  const filtered = articles.filter(a => a.category.toLowerCase() === cat.cat.toLowerCase());
  if (filtered.length === 0) return null;
  const [lead, ...rest] = filtered;

  return (
    <section className="py-12 border-t border-news-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={cat.cat} category={cat.cat} onSeeAll={() => onCategoryClick(cat.cat)} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead story */}
          <div className="lg:col-span-2 cursor-pointer group" onClick={() => onArticleClick(lead)}>
            <div className="relative overflow-hidden rounded-2xl aspect-[16/9] bg-gray-200 mb-4">
              <img src={lead.image} alt={lead.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="news-banner-overlay absolute inset-0" />
              <div className="absolute top-4 left-4">
                <span className="cat-pill text-white" style={{ backgroundColor: cat.color }}>{cat.cat}</span>
              </div>
              <div className="absolute bottom-0 p-6 text-white">
                <h3 className="font-heading text-xl md:text-2xl font-bold leading-tight group-hover:text-ashanti-gold transition-colors line-clamp-2">
                  {lead.title}
                </h3>
                <p className="text-white/60 text-sm mt-2 line-clamp-2">{lead.excerpt}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-white/40 uppercase tracking-wider font-bold">
                  <span>{lead.author}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{new Date(lead.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side stories */}
          <div className="flex flex-col gap-5">
            {rest.slice(0, 3).map(a => (
              <div key={a.id} onClick={() => onArticleClick(a)}
                className="group cursor-pointer flex gap-4 items-start p-3 rounded-xl hover:bg-brand-surface transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-ashanti-gold block mb-1">{a.category}</span>
                  <h4 className="font-heading text-sm font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-3">
                    {a.title}
                  </h4>
                  <span className="text-[10px] text-news-muted mt-1 block">
                    {new Date(a.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PollWidget() {
  const [voted, setVoted] = useState<number | null>(null);
  const options = [
    { label: 'Yes, very satisfied',      pct: 42 },
    { label: 'Somewhat satisfied',        pct: 28 },
    { label: 'Not satisfied',             pct: 18 },
    { label: 'No opinion',                pct: 12 },
  ];

  return (
    <div className="bg-news-card rounded-2xl border border-news-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-ashanti-gold" />
        <span className="text-[9px] font-black uppercase tracking-widest text-news-muted">Community Poll</span>
      </div>
      <h4 className="font-heading font-bold text-news-text text-lg leading-snug mb-5">
        Are you satisfied with the development in Bosomtwe District?
      </h4>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button key={i} onClick={() => setVoted(i)} disabled={voted !== null}
            className={`w-full text-left rounded-xl overflow-hidden border transition-all ${voted === i ? 'border-ashanti-gold' : 'border-news-border hover:border-ashanti-gold/40'}`}>
            <div className="flex items-center justify-between px-4 py-2.5 relative">
              {voted !== null && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="h-full bg-ashanti-gold/10 transition-all duration-700"
                    style={{ width: `${opt.pct}%` }} />
                </div>
              )}
              <span className={`relative text-sm font-medium z-10 ${voted === i ? 'text-ashanti-gold font-bold' : 'text-news-text'}`}>
                {opt.label}
              </span>
              {voted !== null && (
                <span className="relative z-10 text-[11px] font-black text-ashanti-gold">{opt.pct}%</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-news-muted mt-4">
        {voted !== null ? '1,247 votes cast — thank you!' : '1,246 votes so far'}
      </p>
    </div>
  );
}

function HeroSlider({ articles, onArticleClick }: { articles: Article[]; onArticleClick: (a: Article) => void }) {
  const slides = articles.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prev = useCallback(() => setCurrent(c => (c === 0 ? slides.length - 1 : c - 1)), [slides.length]);
  const next = useCallback(() => setCurrent(c => (c === slides.length - 1 ? 0 : c + 1)), [slides.length]);

  useEffect(() => {
    if (isHovered || slides.length < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [isHovered, next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div className="relative overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={slide.id}
          initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="relative aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1.2] cursor-pointer"
          onClick={() => onArticleClick(slide)}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
          <div className="news-banner-overlay absolute inset-0" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="cat-pill bg-ashanti-gold text-black">{slide.category}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <Clock size={10} />
                  {new Date(slide.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-4xl mb-3
                group-hover:text-ashanti-gold transition-colors line-clamp-2">
                {slide.title}
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-2xl line-clamp-2 hidden sm:block">{slide.excerpt}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-ashanti-gold flex items-center justify-center text-black font-black text-sm">
                  {slide.author.charAt(0)}
                </div>
                <span className="text-white/70 text-sm font-medium">{slide.author}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-ashanti-gold text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-ashanti-gold text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-ashanti-gold' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            {!isHovered && (
              <motion.div key={current} className="h-full bg-ashanti-gold"
                initial={{ width: '0%' }} animate={{ width: '100%' }}
                transition={{ duration: 6, ease: 'linear' }} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BreakingTicker({ articles, onArticleClick }: { articles: Article[]; onArticleClick: (a: Article) => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % articles.length), 5000);
    return () => clearInterval(t);
  }, [articles.length]);

  const current = articles[index];

  return (
    <div className="h-10 bg-ashanti-green flex items-center overflow-hidden px-0 border-b border-white/10">
      {/* Badge */}
      <div className="breaking-badge shrink-0 flex items-center gap-2 h-full">
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
          className="w-1.5 h-1.5 bg-white rounded-full" />
        Breaking
      </div>

      {/* Rotating headline */}
      <div className="flex-1 overflow-hidden relative h-full mx-3">
        <AnimatePresence mode="wait">
          <motion.button
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            onClick={() => onArticleClick(current)}
            className="absolute inset-0 flex items-center gap-2 text-left w-full"
          >
            <span className="w-1 h-1 bg-ashanti-gold rotate-45 inline-block shrink-0" />
            <span className="text-[11px] font-bold text-white/80 hover:text-ashanti-gold transition-colors truncate uppercase tracking-wide">
              {current.title}
            </span>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center gap-1 shrink-0 pr-3">
        <button onClick={() => setIndex(i => (i - 1 + articles.length) % articles.length)}
          className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-ashanti-gold transition-colors">
          <ChevronLeft size={13} />
        </button>
        <span className="text-[9px] text-white/20 font-bold tabular-nums">{index + 1}/{articles.length}</span>
        <button onClick={() => setIndex(i => (i + 1) % articles.length)}
          className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-ashanti-gold transition-colors">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

const FILTER_TABS = ['All', 'Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 'Entertainment', 'Health', 'Local', 'International'];

export default function Home({ onArticleClick, articles, onCategoryClick, onNavigate, loading }: HomeProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-muted">Syncing with newsroom...</p>
        </div>
      </div>
    );
  }

  const filteredArticles = activeFilter === 'All'
    ? articles
    : articles.filter(a => a.category.toLowerCase() === activeFilter.toLowerCase());

  const featuredArticles = articles.slice(0, 4);
  const mostRead = articles.slice(0, 5);
  const editorPicks = articles.slice(0, 4);
  const videoArticles = articles.filter(a => a.videoUrl);

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* ── Breaking News Ticker ─────────────────────────────── */}
      {articles.length > 0 && <BreakingTicker articles={articles} onArticleClick={onArticleClick} />}

      {/* ── Leaderboard Ad ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdBanner size="leaderboard" />
      </div>

      {/* ── Hero Slider ──────────────────────────────────────── */}
      {articles.length > 0 && <HeroSlider articles={articles} onArticleClick={onArticleClick} />}

      {/* ── Kente divider ────────────────────────────────────── */}
      <div className="kente-stripe" />

      {/* ── Featured 4-grid ──────────────────────────────────── */}
      {featuredArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader title="Featured Stories" category="" onSeeAll={() => onCategoryClick('')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArticles.map(a => (
              <div key={a.id} onClick={() => onArticleClick(a)} className="cursor-pointer card-hover">
                <ArticleCard article={a} variant="medium" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Live TV + Trending Sidebar ───────────────────────── */}
      <section className="bg-brand-surface border-y border-news-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">

          {/* Live TV embed */}
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-red-600 rounded-full" />
              <h2 className="font-heading text-2xl font-bold text-news-text">BOSOMTWIWEB TV</h2>
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full" />
                Live
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl shadow-black/20">
              <iframe width="100%" height="100%"
                src="https://www.youtube.com/embed/ArF_tiH8A5s"
                title="Bosomtwi Web Live" style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen className="scale-105 hover:scale-100 transition-transform duration-[2000ms]" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => onNavigate?.('live')}
                className="flex items-center gap-2 px-5 py-2.5 bg-ashanti-gold text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all">
                <Radio size={13} />Watch Full Broadcast
              </button>
              <button onClick={() => onNavigate?.('videos')}
                className="flex items-center gap-2 px-5 py-2.5 border border-news-border text-news-text rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-ashanti-gold hover:text-ashanti-gold transition-all">
                <Play size={13} />Video Archive
              </button>
            </div>
          </div>

          {/* Trending sidebar */}
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp size={16} className="text-ashanti-gold" />
              <h2 className="font-heading text-xl font-bold text-news-text">Trending Now</h2>
            </div>
            <div className="space-y-4">
              {mostRead.map((a, i) => (
                <div key={a.id} onClick={() => onArticleClick(a)}
                  className="group cursor-pointer flex items-start gap-4 p-3 rounded-xl hover:bg-news-card transition-colors border border-transparent hover:border-news-border">
                  <span className="font-heading text-3xl font-bold text-ashanti-gold/20 group-hover:text-ashanti-gold/40 transition-colors leading-none shrink-0 w-8 text-center">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold block mb-1">{a.category}</span>
                    <h4 className="font-heading text-sm font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">
                      {a.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mid Ad ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner size="leaderboard" />
      </div>

      {/* ── Category Sections ────────────────────────────────── */}
      {CAT_SECTIONS.map(cat => (
        <CategorySection key={cat.cat} cat={cat} articles={articles} onArticleClick={onArticleClick}
          onCategoryClick={cat.cat === 'Editorials' ? () => onNavigate?.('editorials') : onCategoryClick} />
      ))}

      {/* ── Video News Section ───────────────────────────────── */}
      {videoArticles.length > 0 && (
        <section className="py-12 border-t border-news-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Video News" category="videos" onSeeAll={() => onNavigate?.('videos')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoArticles.slice(0, 6).map(a => (
                <div key={a.id} onClick={() => onArticleClick(a)} className="cursor-pointer group card-hover">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black mb-3">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-ashanti-gold rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={22} fill="currentColor" className="text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="cat-pill bg-red-600 text-white">Video</span>
                    </div>
                  </div>
                  <h4 className="font-heading font-bold text-sm leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">{a.title}</h4>
                  <span className="text-[10px] text-news-muted mt-1 block">{a.author} · {new Date(a.publishedAt).toLocaleDateString('en-GB')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Stories + Sidebar ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col xl:flex-row gap-12">

          {/* Main: Latest grid */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-ashanti-gold rounded-full" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-news-text tracking-tight">
                  Latest Stories
                  <span className="text-ashanti-gold text-base font-normal ml-3 tracking-[0.2em] uppercase hidden md:inline">
                    {new Date().getFullYear()}
                  </span>
                </h2>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                {FILTER_TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveFilter(tab)}
                    className={`text-[9px] uppercase tracking-[0.15em] font-black px-3 py-1.5 rounded-full shrink-0 transition-all whitespace-nowrap ${
                      activeFilter === tab
                        ? 'bg-ashanti-gold text-black shadow-md'
                        : 'bg-brand-surface text-news-muted hover:bg-ashanti-gold/10 hover:text-ashanti-gold border border-news-border'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-news-border rounded-3xl">
                <FileText size={32} className="text-news-muted mx-auto mb-3 opacity-40" />
                <p className="text-news-muted font-heading italic text-xl">No stories in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.flatMap((article, index) => {
                  const items = [
                    <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer card-hover">
                      <ArticleCard article={article} variant="medium" />
                    </div>,
                  ];
                  if (index === 5) {
                    items.push(
                      <div key="in-feed-ad" className="col-span-1 sm:col-span-2 lg:col-span-3">
                        <AdBanner size="leaderboard" />
                      </div>
                    );
                  }
                  return items;
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Editor's picks + Poll + Ad */}
          <aside className="xl:w-80 shrink-0 space-y-8">

            {/* Editor's picks */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Flame size={16} className="text-ashanti-gold" />
                <h3 className="font-heading text-lg font-bold text-news-text">Editor's Picks</h3>
              </div>
              <div className="space-y-4">
                {editorPicks.map((a) => (
                  <div key={a.id} onClick={() => onArticleClick(a)}
                    className="group cursor-pointer flex gap-3 p-2.5 rounded-xl hover:bg-brand-surface transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-ashanti-gold block mb-0.5">{a.category}</span>
                      <h4 className="font-heading text-sm font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">
                        {a.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Poll widget */}
            <PollWidget />

            {/* Ad */}
            <AdBanner size="rectangle" />

            {/* Community stats */}
            <div className="bg-news-card rounded-2xl border border-news-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users size={15} className="text-ashanti-gold" />
                <h3 className="font-heading text-base font-bold text-news-text">Community</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Readers',   value: '24K+',  icon: Users },
                  { label: 'Stories',   value: `${articles.length}+`, icon: FileText },
                  { label: 'Comments',  value: '850+',  icon: MessageSquare },
                  { label: 'Trending',  value: '12',    icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center p-3 bg-brand-surface rounded-xl">
                    <Icon size={16} className="text-ashanti-gold mx-auto mb-1.5" />
                    <div className="font-heading text-xl font-bold text-news-text">{value}</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-news-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Kente divider before newsletter ─────────────────── */}
      <div className="kente-stripe" />

      {/* ── Newsletter CTA ───────────────────────────────────── */}
      <section className="py-16 bg-ashanti-green relative overflow-hidden kente-pattern-bg">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-ashanti-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ashanti-green rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-ashanti-gold mb-3">Free Daily Briefing</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-4">
              Stay ahead with<br />
              <span className="text-ashanti-gold">BOSOMTWIWEB.</span>
            </h2>
            <p className="text-white/50 text-base">
              Daily briefings on Politics, Business, and Culture in the Ashanti Region. No spam. Unsubscribe anytime.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form className="flex rounded-xl overflow-hidden shadow-2xl border border-white/10" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address"
                className="flex-grow bg-white/5 border-0 px-5 py-4 text-white font-medium placeholder:text-white/25 focus:outline-none text-sm" />
              <button type="submit"
                className="bg-ashanti-gold text-black px-6 py-4 font-black uppercase tracking-widest hover:bg-white transition-all text-[11px] shrink-0">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-white/25 mt-3 text-center">Join 24,000+ readers. Free forever.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
