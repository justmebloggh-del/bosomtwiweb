import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowRight, PenSquare } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import KenteBanner from '../components/KenteBanner';
import PublishModal from '../components/PublishModal';
import { Article, User } from '../types';

interface CategoryPageProps {
  category: string;
  onArticleClick: (article: Article) => void;
  articles: Article[];
  onHomeClick: () => void;
  loading?: boolean;
  user?: User | null;
  onArticlePublished?: () => void;
}

const DESCRIPTIONS: Record<string, string> = {
  Manhyia:       'Royal palace, traditional leadership, and Ashanti heritage.',
  Politics:      'Government, elections, policy, and national governance.',
  Business:      'Markets, enterprise, and economic insight from Ashanti Region.',
  Sports:        'Football, athletics, and all major sporting events.',
  Entertainment: 'Music, film, arts, celebrity, and cultural highlights.',
  Technology:    'Innovation, digital transformation, and science in Africa.',
  Lifestyle:     'Health, wellness, travel, food, and everyday living.',
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
  const description = DESCRIPTIONS[category] || 'Latest news updates from our newsroom.';

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

      <KenteBanner
        title={category}
        badge="Section"
        description={description}
        count={`${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}`}
        actions={
          user ? (
            <button
              onClick={() => setShowPublish(true)}
              className="inline-flex items-center gap-2 bg-ashanti-gold text-black px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-ashanti-gold/30"
            >
              <PenSquare size={16} />
              <span>Add Story</span>
            </button>
          ) : null
        }
      />

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
            {hero && (
              <div className="mb-12 cursor-pointer" onClick={() => onArticleClick(hero)}>
                <ArticleCard article={hero} variant="large" />
              </div>
            )}

            <AdBanner size="leaderboard" className="mb-12" />

            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                {secondary.map(article => (
                  <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                    <ArticleCard article={article} variant="medium" />
                  </div>
                ))}
              </div>
            )}

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
