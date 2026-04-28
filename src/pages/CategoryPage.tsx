import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { Article } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  category: string;
  onArticleClick: (article: Article) => void;
  articles: Article[];
  onHomeClick: () => void;
  loading?: boolean;
}

export default function CategoryPage({ category, onArticleClick, articles, onHomeClick, loading }: CategoryPageProps) {
  const filteredArticles = category === 'All' ? articles : articles.filter(a => a.category === category);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Retrieving archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* Category Header */}
      <header
        className="relative overflow-hidden border-b border-black/20 py-16"
        style={{ background: 'linear-gradient(135deg, #0D3B1A 0%, #0A2810 40%, #1A1A00 80%, #0D3B1A 100%)' }}
      >
        {/* Background orbs */}
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: '#E09E2B' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: '#2D7A31' }} />
        <motion.div animate={{ x: [0, 40, 0], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 rounded-full blur-[80px]" style={{ backgroundColor: '#E09E2B' }} />

        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i % 4) + 2}px`,
              height: `${(i % 4) + 2}px`,
              top: `${(i * 17 + 5) % 100}%`,
              left: `${(i * 23 + 3) % 100}%`,
              backgroundColor: i % 2 === 0 ? '#E09E2B' : '#2D7A31',
            }}
            animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: (i % 4) + 4, repeat: Infinity, ease: 'easeInOut', delay: (i % 5) * 0.6 }}
          />
        ))}

        {/* Kente stripe overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(90deg, #E09E2B 0px, #E09E2B 8px, transparent 8px, transparent 32px)',
              'repeating-linear-gradient(90deg, #2D7A31 32px, #2D7A31 40px, transparent 40px, transparent 80px)',
            ].join(', '),
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          <div className="flex-1">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-ashanti-gold text-[11px] uppercase font-bold tracking-[0.5em] mb-5 block">
              ◆ Category Archives ◆
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              {category}
            </motion.h1>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
              style={{ originX: 0 }} className="mt-5 h-1.5 w-44 rounded-full overflow-hidden flex">
              <div className="flex-1" style={{ backgroundColor: '#E09E2B' }} />
              <div className="flex-1" style={{ backgroundColor: '#2D7A31' }} />
              <div className="flex-1" style={{ backgroundColor: '#E09E2B' }} />
              <div className="flex-1" style={{ backgroundColor: '#2D7A31' }} />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-4 text-white/40 text-sm font-sans uppercase tracking-widest font-bold">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'} found
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex shrink-0 items-center justify-center relative">
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute w-44 h-44 rounded-full blur-2xl" style={{ backgroundColor: '#E09E2B' }} />
            <motion.img src="/kente-artifact.png" alt="Ashanti Artifact" animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-36 h-36 object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AdBanner size="leaderboard" className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.flatMap((article, index) => {
            const items = [
              <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                <ArticleCard article={article} variant="medium" />
              </div>,
            ];
            if ((index + 1) % 6 === 0) {
              items.push(
                <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3">
                  <AdBanner size="wide" />
                </div>
              );
            }
            return items;
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-brand-secondary/10 rounded-[3rem]">
            <p className="text-news-text/30 font-heading italic text-2xl tracking-widest uppercase">
              No articles found in {category}
            </p>
            <button onClick={onHomeClick} className="mt-8 px-8 py-3 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all text-sm">
              Back to Home
            </button>
          </div>
        )}
      </main>

      {/* Deep Dive CTA */}
      <section className="bg-brand-surface py-20 border-y border-brand-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ashanti-gold opacity-5 blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-news-text font-heading text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
              Deep Dive: The Future of {category} in Ashanti
            </h2>
            <p className="text-news-text/60 leading-relaxed text-lg italic">
              Our specialised team brings you investigative reports and long-form analysis you won't find anywhere else.
            </p>
          </div>
          <button
            onClick={onHomeClick}
            className="whitespace-nowrap px-10 py-5 bg-ashanti-gold text-black font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-news-text hover:text-ashanti-gold transition-all hover:scale-105"
          >
            <span>Explore More</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
