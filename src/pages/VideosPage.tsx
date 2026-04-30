import { useState } from 'react';
import { Article, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Youtube, Clock, ArrowRight, PenSquare } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';
import PublishModal from '../components/PublishModal';

interface VideosPageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  loading?: boolean;
  user?: User | null;
  onArticlePublished?: () => void;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/\s]{11})/);
  return match ? match[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` : null;
}

export default function VideosPage({ articles, onArticleClick, loading, user, onArticlePublished }: VideosPageProps) {
  const videoArticles = articles.filter(a => !!a.videoUrl);
  const [featured, setFeatured] = useState<Article | null>(videoArticles[0] || null);
  const [showPublish, setShowPublish] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Loading videos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      <KenteBanner
        title="Videos"
        badge="Video Reports"
        description="Watch the latest video reports from our newsroom."
        count={`${videoArticles.length} video ${videoArticles.length === 1 ? 'report' : 'reports'}`}
        above={
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Youtube size={20} className="text-white" />
          </div>
        }
        actions={
          user ? (
            <button
              onClick={() => setShowPublish(true)}
              className="inline-flex items-center gap-2 bg-ashanti-gold text-black px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-ashanti-gold/30"
            >
              <PenSquare size={16} />
              <span>Add Video Story</span>
            </button>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {videoArticles.length === 0 ? (
          <div className="text-center py-32">
            <Play size={48} className="mx-auto mb-4 text-news-text/10" />
            <p className="font-heading text-2xl text-news-text/30 italic uppercase">No video reports yet</p>
            <p className="text-sm text-news-text/20 mt-2">
              Video content will appear here as journalists publish stories with YouTube links.
            </p>
            {user && (
              <button
                onClick={() => setShowPublish(true)}
                className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all text-sm"
              >
                <PenSquare size={16} /> Publish First Video Story
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Featured player */}
            <div className="xl:col-span-2">
              {featured && (
                <motion.div
                  key={featured.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {getEmbedUrl(featured.videoUrl!) ? (
                      <iframe
                        src={getEmbedUrl(featured.videoUrl!)!}
                        title={featured.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <img src={featured.image} alt={featured.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <a
                            href={featured.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                          >
                            <Play size={32} className="text-white ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div onClick={() => onArticleClick(featured)} className="cursor-pointer group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold block mb-1">{featured.category}</span>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-news-text/50 text-sm mt-2 leading-relaxed">{featured.excerpt}</p>
                    <p className="text-news-text/30 text-xs mt-2 flex items-center gap-1.5">
                      <Clock size={11} />
                      {new Date(featured.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Playlist */}
            <div className="xl:col-span-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-news-text/40 mb-4 pb-3 border-b border-brand-secondary/10">
                All Video Reports
              </h3>
              <div className="space-y-1">
                {videoArticles.map(article => {
                  const isActive = featured?.id === article.id;
                  const thumbId = getYouTubeId(article.videoUrl!);
                  return (
                    <button
                      key={article.id}
                      onClick={() => setFeatured(article)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all group ${isActive ? 'bg-ashanti-gold/10 border border-ashanti-gold/30' : 'hover:bg-brand-surface/60'}`}
                    >
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                        {thumbId ? (
                          <img src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <img src={article.image} alt="" className="w-full h-full object-cover opacity-60" />
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'bg-ashanti-gold/20' : 'bg-black/30'}`}>
                          <Play size={14} className={isActive ? 'text-ashanti-gold' : 'text-white'} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isActive ? 'text-ashanti-gold' : 'text-news-text/40'}`}>
                          {article.category}
                        </p>
                        <p className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${isActive ? 'text-ashanti-gold' : 'text-news-text group-hover:text-ashanti-gold'}`}>
                          {article.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Full video archive grid */}
        {videoArticles.length > 1 && (
          <div className="mt-16">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-news-text/30 border-b border-brand-secondary/10 pb-4 mb-8">
              Full Video Archive
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoArticles.map(article => (
                <motion.div
                  key={article.id}
                  whileHover={{ y: -3 }}
                  onClick={() => onArticleClick(article)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-brand-secondary/10 hover:border-ashanti-gold/30 transition-all shadow-sm hover:shadow-lg"
                >
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={getYouTubeId(article.videoUrl!) ? `https://img.youtube.com/vi/${getYouTubeId(article.videoUrl!)}/mqdefault.jpg` : article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[9px] font-black uppercase tracking-wider rounded">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading font-bold text-news-text leading-snug line-clamp-2 group-hover:text-ashanti-gold transition-colors text-sm">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[10px] text-news-text/40 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <ArrowRight size={14} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPublish && user && (
          <PublishModal
            user={user}
            defaultCategory="Entertainment"
            onClose={() => setShowPublish(false)}
            onPublished={() => { onArticlePublished?.(); setShowPublish(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
