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

const categoryDescriptions: Record<string, string> = {
  Manhyia: "Latest updates from Manhyia Palace, traditional leadership, and Ashanti heritage.",
  Politics: "Breaking political developments, governance, and national policy updates.",
  Business: "Market trends, entrepreneurship, and economic insights shaping Ghana.",
  Sports: "Live scores, transfers, and major sporting events across Ghana and beyond.",
  Technology: "Innovations, startups, and digital transformation in Africa and the world.",
  Entertainment: "Trending stories in music, movies, culture, and celebrity news.",
  Health: "Public health updates, medical insights, and wellness information.",
  Local: "Stories from Ashanti Region and surrounding communities.",
  International: "Global news, geopolitics, and world affairs impacting Africa.",
};

export default function CategoryPage({
  category,
  onArticleClick,
  articles,
  onHomeClick,
  loading,
}: CategoryPageProps) {

  const filteredArticles =
    category === 'All'
      ? articles
      : articles.filter(a => a.category === category);

  const description =
    categoryDescriptions[category] || "Latest news updates";

  const breakingNews = filteredArticles.find(a => (a as any).breaking);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">
            Retrieving archive...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* HEADER */}
      <header
        className="relative overflow-hidden border-b border-black/20 py-16"
        style={{
          background:
            'linear-gradient(135deg, #0D3B1A 0%, #0A2810 40%, #1A1A00 80%, #0D3B1A 100%)',
        }}
      >
        {/* Glow effects */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: '#E09E2B' }}
        />

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full blur-[100px]"
          style={{ backgroundColor: '#2D7A31' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">

          <div className="flex-1">

            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-ashanti-gold text-[11px] uppercase font-bold tracking-[0.5em]"
            >
              ◆ Category Archives ◆
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-5xl md:text-7xl font-black text-white uppercase"
            >
              {category}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-white/60 text-sm tracking-wide"
            >
              {description}
            </motion.p>

            <p className="mt-2 text-white/30 text-xs uppercase tracking-widest font-bold">
              {filteredArticles.length}{' '}
              {filteredArticles.length === 1 ? 'story' : 'stories'} available
            </p>

            <div className="flex items-center gap-2 mt-4 text-xs text-red-500 font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Updates
            </div>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <AdBanner size="leaderboard" className="mb-12" />

        {/* Breaking News */}
        {breakingNews && (
          <div
            onClick={() => onArticleClick(breakingNews)}
            className="mb-10 p-6 border-l-4 border-red-500 bg-black/30 cursor-pointer hover:bg-black/50 transition"
          >
            <p className="text-red-500 text-xs uppercase font-bold tracking-widest mb-2">
              Breaking News
            </p>
            <h3 className="text-white font-bold text-lg">
              {breakingNews.title}
            </h3>
          </div>
        )}

        {/* Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {filteredArticles.flatMap((article, index) => {
            const items = [
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="cursor-pointer"
              >
                <ArticleCard article={article} variant="medium" />
              </div>,
            ];

            // Mid-feed ad injection
            if (index === 2) {
              items.push(
                <div
                  key={`ad-${index}`}
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                >
                  <AdBanner size="leaderboard" />
                </div>
              );
            }

            if ((index + 1) % 6 === 0) {
              items.push(
                <div
                  key={`ad-${index}-wide`}
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                >
                  <AdBanner size="wide" />
                </div>
              );
            }

            return items;
          })}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-brand-secondary/10 rounded-[3rem]">
            <p className="text-news-text/40 font-heading italic text-2xl uppercase tracking-widest">
              No current reports in {category}
            </p>
            <p className="mt-4 text-news-text/30 text-sm">
              Our newsroom is actively updating this section. Check back shortly.
            </p>

            <button
              onClick={onHomeClick}
              className="mt-8 px-8 py-3 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all text-sm"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-brand-surface py-20 border-y border-brand-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ashanti-gold opacity-5 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">

          <div className="max-w-2xl">
            <h2 className="text-news-text font-heading text-3xl md:text-4xl font-bold mb-4 uppercase">
              Deep Dive: The Future of {category}
            </h2>
            <p className="text-news-text/60 text-lg italic">
              Investigative reporting and long-form analysis from our newsroom.
            </p>
          </div>

          <button
            onClick={onHomeClick}
            className="px-10 py-5 bg-ashanti-gold text-black font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-news-text hover:text-ashanti-gold transition-all hover:scale-105"
          >
            Explore More <ArrowRight size={20} />
          </button>

        </div>
      </section>
    </div>
  );
}