import { motion } from 'motion/react';
import { PenLine, Clock, ArrowRight } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';
import { Article } from '../types';

interface EditorialsPageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  loading?: boolean;
}

const FEATURED_TOPICS = [
  'Democracy & Governance', 'Traditional Authority', 'Economic Justice',
  'Youth & Education', 'Media Freedom', 'Regional Development',
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function EditorialsPage({ articles, onArticleClick, loading }: EditorialsPageProps) {
  const editorials = articles.filter(a => a.category === 'Editorials' || a.category === 'Opinion');
  const featured = editorials[0];
  const rest = editorials.slice(1);

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="Editorials & Opinion"
        badge="Perspectives"
        description="Informed analysis, bold opinions, and thoughtful commentary on the issues shaping Ashanti and Ghana."
        count={`${editorials.length} editorials`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-10">
            {loading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-news-card border border-news-border rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : editorials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PenLine size={40} className="text-news-border mb-4" />
                <h3 className="font-heading text-xl font-bold text-news-text mb-2">No Editorials Yet</h3>
                <p className="text-news-muted text-sm max-w-sm">Our editorial team is crafting insightful commentary. Check back soon.</p>
              </div>
            ) : (
              <>
                {featured && (
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => onArticleClick(featured)}
                    className="w-full text-left group">
                    <div className="relative aspect-[16/7] overflow-hidden rounded-2xl mb-5">
                      <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5">
                        <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-ashanti-gold text-black px-3 py-1 rounded-full mb-3">
                          Featured Editorial
                        </span>
                        <h2 className="font-heading text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2 group-hover:text-ashanti-gold transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-white/70 text-sm mt-2">By {featured.author}</p>
                      </div>
                    </div>
                    <p className="text-news-muted leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-2 mt-4 text-ashanti-gold font-black text-[11px] uppercase tracking-widest">
                      Read Full Editorial <ArrowRight size={13} />
                    </div>
                  </motion.button>
                )}

                <div className="space-y-5">
                  {rest.map((article, i) => (
                    <motion.button key={article.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => onArticleClick(article)}
                      className="w-full text-left flex gap-5 p-5 bg-news-card border border-news-border rounded-2xl hover:border-ashanti-gold/30 transition-all group">
                      <img src={article.image} alt={article.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold mb-1">{article.category}</p>
                        <h3 className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-snug line-clamp-2 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-news-muted text-xs line-clamp-2 mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-3 text-[10px] text-news-muted">
                          <span className="flex items-center gap-1"><PenLine size={9} />By {article.author}</span>
                          <span className="flex items-center gap-1"><Clock size={9} />{timeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-5">Topics We Cover</p>
              <div className="flex flex-wrap gap-2">
                {FEATURED_TOPICS.map(topic => (
                  <span key={topic} className="px-3 py-1.5 bg-news-card border border-news-border rounded-full text-[10px] font-bold text-news-muted hover:border-ashanti-gold hover:text-ashanti-gold transition-all cursor-default">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 bg-ashanti-green/10 border border-ashanti-green/20 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-3">Editorial Policy</p>
              <p className="text-news-muted text-sm leading-relaxed mb-4">
                All editorials represent the views of named authors and not necessarily those of Bosomtwi Web. We welcome diverse, evidence-based perspectives.
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-news-muted">Submit your column →</p>
              <a href="mailto:editorial@bosomtwi.web" className="text-sm font-bold text-ashanti-gold hover:underline">editorial@bosomtwi.web</a>
            </div>

            {articles.filter(a => a.category === 'Politics').slice(0, 3).map(article => (
              <button key={article.id} onClick={() => onArticleClick(article)}
                className="w-full text-left flex gap-3 group">
                <img src={article.image} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold mb-0.5">Related</p>
                  <p className="text-xs font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-snug line-clamp-2">{article.title}</p>
                </div>
              </button>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
