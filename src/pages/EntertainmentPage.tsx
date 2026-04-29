import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, ArrowRight, PenSquare } from 'lucide-react';
import { Article, User } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import PublishModal from '../components/PublishModal';

interface Props {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onHomeClick: () => void;
  loading?: boolean;
  user?: User | null;
  onArticlePublished?: () => void;
}

const CATEGORY = 'Entertainment';

export default function EntertainmentPage({ articles, onArticleClick, onHomeClick, loading, user, onArticlePublished }: Props) {
  const [showPublish, setShowPublish] = useState(false);
  const filtered = articles.filter(a => a.category === CATEGORY);
  const hero = filtered[0] || null;
  const secondary = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      <header className="relative overflow-hidden border-b border-black/30 py-16 md:py-24 bg-gradient-to-br from-[#2D0020] via-[#170010] to-black">
        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] bg-pink-600" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-24 right-0 w-80 h-80 rounded-full blur-[100px] bg-fuchsia-900" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-6">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
              <Music size={18} className="text-pink-400" />
              <span className="text-pink-400 text-[11px] uppercase font-black tracking-[0.5em]">Arts, Music & Culture</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="font-heading text-5xl md:text-8xl font-black text-white uppercase leading-none tracking-tighter">
              Entertainment
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="mt-3 text-white/50 text-sm max-w-xl">
              Music, film, theatre, celebrity news, festivals, and cultural events from Ghana and across Africa.
            </motion.p>
            <p className="mt-2 text-white/25 text-[10px] uppercase tracking-widest font-black">
              {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
          {user && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowPublish(true)}
              className="shrink-0 flex items-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              <PenSquare size={15} /><span className="hidden sm:inline">Add Story</span>
            </motion.button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-brand-secondary/10 rounded-[3rem]">
            <Music size={40} className="mx-auto mb-4 text-news-text/10" />
            <p className="text-news-text/40 font-heading italic text-2xl uppercase tracking-widest">No Entertainment stories yet</p>
            {user && (
              <button onClick={() => setShowPublish(true)} className="mt-6 px-8 py-3 bg-pink-600 text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all text-sm flex items-center gap-2 mx-auto">
                <PenSquare size={14} /> Publish First Story
              </button>
            )}
          </div>
        ) : (
          <>
            {hero && <div className="mb-12 cursor-pointer" onClick={() => onArticleClick(hero)}><ArticleCard article={hero} variant="large" /></div>}
            <AdBanner size="leaderboard" className="mb-12" />
            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                {secondary.map(a => <div key={a.id} className="cursor-pointer" onClick={() => onArticleClick(a)}><ArticleCard article={a} variant="medium" /></div>)}
              </div>
            )}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-news-text/40">More from Entertainment</h2>
                  <div className="flex-grow h-px bg-brand-secondary/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {rest.flatMap((a, i) => {
                    const items = [<div key={a.id} className="cursor-pointer" onClick={() => onArticleClick(a)}><ArticleCard article={a} variant="medium" /></div>];
                    if ((i + 1) % 6 === 0) items.push(<div key={`ad-${i}`} className="col-span-full"><AdBanner size="leaderboard" /></div>);
                    return items;
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <section className="bg-brand-surface py-14 border-y border-brand-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-news-text uppercase">More from Bosomtwi Web</h2>
            <p className="text-news-text/40 text-sm italic mt-1">All the news from Ashanti Region and beyond.</p>
          </div>
          <button onClick={onHomeClick} className="px-8 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest flex items-center gap-3 hover:bg-news-text hover:text-ashanti-gold transition-all hover:scale-105 rounded-xl">
            Back to Home <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showPublish && user && (
          <PublishModal user={user} defaultCategory={CATEGORY} onClose={() => setShowPublish(false)}
            onPublished={() => { onArticlePublished?.(); setShowPublish(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
