import { Article } from '../types';
import { Share2, Bookmark, MessageSquare, ArrowLeft, Calendar, ArrowUpRight, Facebook, Twitter, Instagram, Youtube, Link, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import AdBanner from '../components/AdBanner';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  relatedArticles: Article[];
  onArticleClick: (article: Article) => void;
}

export default function ArticleView({ article, onBack, relatedArticles, onArticleClick }: ArticleViewProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Read this on Bosomtwi Hub: ${article.title}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-news-bg min-h-screen">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] text-news-text/40 hover:text-ashanti-gold mb-12 group transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to News Feed</span>
      </motion.button>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Main Article Content */}
        <div className="flex-grow max-w-4xl">
          <header className="mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-ashanti-gold text-[12px] uppercase font-bold tracking-[0.3em]">
                {article.category}
              </span>
              <div className="h-px bg-brand-secondary/20 flex-grow" />
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-10 leading-[1.1] tracking-tight text-news-text">
              {article.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-brand-secondary/20 py-8 gap-8">
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-brand-surface rounded-full flex items-center justify-center text-news-text text-xl font-bold border border-brand-secondary/20">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-bold text-news-text">By {article.author}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-news-text/30 flex items-center space-x-3 mt-1">
                    <Calendar size={12} />
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex bg-brand-surface p-1 rounded-lg border border-brand-secondary/20">
                  <a 
                    href={shareLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all"
                    title="Share on Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                  <a 
                    href={shareLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all"
                    title="Share on X"
                  >
                    <Twitter size={18} />
                  </a>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all relative"
                    title="Copy Link"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check size={18} className="text-green-600" />
                        </motion.div>
                      ) : (
                        <motion.div key="link" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Link size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                <button className="p-3 bg-brand-surface border border-brand-secondary/20 hover:border-ashanti-gold rounded-lg transition-all text-news-text/40 hover:text-ashanti-gold shadow-sm">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="relative h-[500px] mb-12 rounded-2xl overflow-hidden bg-brand-accent/20 border border-brand-secondary/20 shadow-xl">
            <img 
              src={article.image} 
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          <div className="prose prose-lg max-w-none font-sans text-news-text/80 leading-relaxed selection:bg-ashanti-gold selection:text-black">
            <p className="font-heading text-2xl md:text-3xl font-bold mb-12 text-news-text leading-tight border-l-8 border-ashanti-gold pl-8 py-4 bg-brand-surface rounded-r-2xl italic">
              {article.excerpt}
            </p>
            
            {/* In-article ad */}
            <AdBanner size="wide" className="my-8" />

            <div className="space-y-8 text-[18px]">
              <p>
                The heart of Kumasi continues to evolve, blending centuries of royal tradition with the rapid pace of 21st-century innovation. As the regional capital and historical seat of the Ashanti Empire, the city serves as a beacon for cultural preservation and economic vitality across West Africa.
              </p>
              <p>
                Recent developments spearheaded by the Manhyia Palace focus on sustainable urban expansion and the protection of heritage sites. By collaborating with both local stakeholders and international conservation groups, the Ashanti Region is setting a global standard for how modern cities can flourish without losing their spiritual and ancestral foundations.
              </p>
              <div className="py-8 flex justify-center space-x-4">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-ashanti-gold rounded-full" />)}
              </div>
              <p>
                The digital era has brought new tools for storytelling. Bosomtwi Web aims to be at the forefront of this movement, ensuring that every significant event—from the grand durbars of the Golden Stool to the latest local business successes—is documented with the gravity and precision it deserves.
              </p>
            </div>
          </div>

          {article.videoUrl && (
            <div className="mt-16 mb-20 bg-gray-100 rounded-2xl shadow-xl overflow-hidden aspect-video relative group">
              {article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${article.videoUrl.includes('youtu.be') ? article.videoUrl.split('/').pop() : new URLSearchParams(new URL(article.videoUrl).search).get('v')}?rel=0&modestbranding=1&autoplay=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={article.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          )}

          {/* Post-article leaderboard ad */}
          <AdBanner size="leaderboard" className="mt-12 mb-4" />

          <section className="mt-12 border-t border-brand-secondary/20 pt-16 pb-20">
            <div className="flex items-center space-x-4 mb-10">
              <MessageSquare size={24} className="text-ashanti-gold" />
              <h2 className="text-3xl font-heading font-bold text-news-text">Reader Comments</h2>
            </div>
            <div className="flex items-start space-x-6">
               <div className="w-12 h-12 bg-brand-surface rounded-full border border-brand-secondary/20 shrink-0" />
               <div className="flex-grow space-y-4">
                  <textarea 
                    placeholder="Contribute to the discussion..."
                    className="w-full bg-brand-surface border border-brand-secondary/20 rounded-2xl p-6 text-[16px] font-sans text-news-text focus:outline-none focus:border-ashanti-gold transition-all min-h-[150px] placeholder:text-news-text/30 shadow-inner"
                  />
                  <button className="px-10 py-4 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-black hover:text-ashanti-gold transition-all shadow-lg">
                    Post Comment
                  </button>
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-12">
          {/* Related News */}
          <section>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-news-text mb-8 border-b-2 border-ashanti-gold pb-2 inline-block">Latest News</h4>
            <div className="space-y-8">
              {relatedArticles.slice(0, 5).map((rel) => (
                <div 
                  key={rel.id} 
                  onClick={() => onArticleClick(rel)}
                  className="group cursor-pointer flex space-x-4 items-start"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-surface shrink-0 border border-brand-secondary/10">
                    <img 
                      src={rel.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={rel.title}
                    />
                  </div>
                  <div className="flex-grow">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ashanti-gold block mb-1">{rel.category}</span>
                    <h5 className="font-heading text-md font-bold text-news-text group-hover:text-ashanti-gold leading-tight transition-colors line-clamp-2">
                      {rel.title}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rectangle ad in sidebar */}
          <AdBanner size="rectangle" />

          {/* Sidebar CTA */}
          <section className="bg-white rounded-2xl border border-brand-secondary/20 p-8 relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-24 h-24 bg-ashanti-gold/10 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-news-text/30 mb-4 block">Official Announcement</span>
             <div className="space-y-6">
                <h6 className="font-heading text-2xl font-bold leading-tight text-news-text">Experience the spirit of Kumasi.</h6>
                <p className="text-news-text/40 text-[14px]">Discover artisanal markets, golden heritage and vibrant culture.</p>
                <button className="w-full py-4 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-black hover:text-ashanti-gold transition-all flex items-center justify-center text-[10px]">
                  Explore Now <ArrowUpRight size={14} className="ml-2" />
                </button>
             </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
