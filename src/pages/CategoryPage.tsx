import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { Article, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, PenSquare } from 'lucide-react';
import { useState } from 'react';
import PublishModal from '../components/PublishModal';

interface CategoryPageProps {
  category: string;
  onArticleClick: (article: Article) => void;
  articles: Article[];
  onHomeClick: () => void;
  loading?: boolean;
  user?: User | null;
  onArticlePublished?: () => void;
}

const CONFIG: Record<string, { description: string; gradient: string }> = {
  Manhyia:       { description: 'Royal palace, traditional leadership, and Ashanti heritage.',     gradient: 'from-[#3D1A00] via-[#1A0A00] to-[#0D0500]' },
  Politics:      { description: 'Government, elections, policy, and national governance.',          gradient: 'from-[#0A1B35] via-[#060F1E] to-[#030810]' },
  Business:      { description: 'Markets, enterprise, and economic insight from Ashanti Region.',   gradient: 'from-[#002B1A] via-[#001810] to-[#000D08]' },
  Sports:        { description: 'Football, athletics, and all major sporting events.',               gradient: 'from-[#1A0035] via-[#0D001E] to-[#060010]' },
  Entertainment: { description: 'Music, film, arts, celebrity, and cultural highlights.',           gradient: 'from-[#2D0020] via-[#1A0012] to-[#0D0009]' },
  Technology:    { description: 'Innovation, digital transformation, and science in Africa.',       gradient: 'from-[#001A2D] via-[#000F1A] to-[#00060D]' },
  Lifestyle:     { description: 'Health, wellness, travel, food, and everyday living.',             gradient: 'from-[#2D1A00] via-[#1A0F00] to-[#0D0800]' },
};

export default function CategoryPage({
  category,
  onArticleClick,
  articles,
  onHomeClick,
  loading,
  user,
  onArticlePublished,
}: CategoryPageProps) {
  const [showPublish, setShowPublish] = useState(false);

  const filtered = articles.filter(a => a.category === category);
  const hero = filtered[0] || null;
  const secondary = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  const config = CONFIG[category] || {
    description: 'Latest news updates from our newsroom.',
    gradient: 'from-[#0D1A0D] via-[#080D08] to-[#040604]',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Loading {category}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* ── Page Header ──────────────────────────────────────── */}
      <header className={`relative overflow-hidden border-b border-black/30 py-14 md:py-20 bg-gradient-to-br ${config.gradient}`}>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] bg-ashanti-gold"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, delay: 3 }}
          className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full blur-[100px] bg-ashanti-gold"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-ashanti-gold text-[11px] uppercase font-black tracking-[0.5em] block mb-3"
            >
              ◆ Section
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-heading text-5xl md:text-8xl font-black text-white uppercase leading-none tracking-tighter"
            >
              {category}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-white/50 text-sm max-w-lg"
            >
              {config.description}
            </motion.p>
            <p className="mt-2 text-white/25 text-[10px] uppercase tracking-widest font-black">
              {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
            </p>
          </div>

          {/* Publish button (logged-in users only) */}
          {user && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowPublish(true)}
              className="shrink-0 flex items-center gap-2 bg-ashanti-gold text-black px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-ashanti-gold/30"
            >
              <PenSquare size={16} />
              <span className="hidden sm:inline">Add Story</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {filtered.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-brand-secondary/10 rounded-[3rem]">
            <p className="text-news-text/40 font-heading italic text-2xl uppercase tracking-widest">
              No stories in {category} yet
            </p>
            <p className="mt-4 text-news-text/30 text-sm">
              Our newsroom is actively covering this section.
            </p>
            {user ? (
              <button
                onClick={() => setShowPublish(true)}
                className="mt-8 px-8 py-3 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all text-sm flex items-center gap-2 mx-auto"
              >
                <PenSquare size={16} /> Publish First Story
              </button>
            ) : (
              <button
                onClick={onHomeClick}
                className="mt-8 px-8 py-3 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all text-sm"
              >
                Back to Home
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Hero story */}
            {hero && (
              <div className="mb-12" onClick={() => onArticleClick(hero)}>
                <ArticleCard article={hero} variant="large" />
              </div>
            )}

            <AdBanner size="leaderboard" className="mb-12" />

            {/* Secondary stories row */}
            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                {secondary.map(article => (
                  <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                    <ArticleCard article={article} variant="medium" />
                  </div>
                ))}
              </div>
            )}

            {/* Rest of stories */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-news-text/40">
                    More from {category}
                  </h2>
                  <div className="flex-grow h-px bg-brand-secondary/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {rest.flatMap((article, i) => {
                    const items = [
                      <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                        <ArticleCard article={article} variant="medium" />
                      </div>,
                    ];
                    if ((i + 1) % 6 === 0) {
                      items.push(
                        <div key={`ad-${i}`} className="col-span-1 md:col-span-2 lg:col-span-3">
                          <AdBanner size="leaderboard" />
                        </div>
                      );
                    }
                    return items;
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ── CTA strip ────────────────────────────────────────── */}
      <section className="bg-brand-surface py-16 border-y border-brand-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-news-text uppercase">
              More from Bosomtwi Web
            </h2>
            <p className="text-news-text/50 text-sm italic mt-1">
              Explore all sections of our newsroom.
            </p>
          </div>
          <button
            onClick={onHomeClick}
            className="px-8 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest flex items-center gap-3 hover:bg-news-text hover:text-ashanti-gold transition-all hover:scale-105 rounded-xl"
          >
            Back to Home <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublish && user && (
          <PublishModal
            user={user}
            defaultCategory={category}
            onClose={() => setShowPublish(false)}
            onPublished={() => { onArticlePublished?.(); setShowPublish(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
