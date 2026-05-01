import { Article } from '../types';
import { motion } from 'motion/react';
import { Radio, Clock, ArrowRight, Volume2 } from 'lucide-react';

interface LivePageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export default function LivePage({ articles, onArticleClick }: LivePageProps) {
  const latest = articles.slice(0, 8);

  return (
    <div className="bg-black min-h-screen text-white">

      {/* Live badge header */}
      <header className="bg-black border-b border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-red-400 text-[11px] font-black uppercase tracking-[0.5em]">On Air Now</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
            <Radio size={13} />
            <span>Bosomtwi Web Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main player — full width on mobile, 2/3 on desktop */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-ashanti-gold/20 rounded-[2rem] blur-xl" />
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/10">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/y99chr0KUfY?si=yyGZh8sS0bY9re0f" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              </div>
            </motion.div>

            {/* Stream info */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      LIVE
                    </motion.span>
                    <span className="text-white/20 text-[9px]">·</span>
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">Bosomtwi Web TV</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Bosomtwi Web Live Broadcast
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    Live coverage, breaking news, and real-time updates from Ashanti Region and beyond.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl shrink-0">
                  <Volume2 size={13} className="text-ashanti-gold" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Audio On</span>
                </div>
              </div>
            </div>

            {/* Breaking news ticker */}
            <div className="bg-red-600 rounded-xl overflow-hidden">
              <div className="flex items-center">
                <div className="bg-red-800 px-4 py-3 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Breaking</span>
                </div>
                <div className="overflow-hidden flex-grow py-3 px-4">
                  <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="whitespace-nowrap text-white text-xs font-bold"
                  >
                    {latest.map(a => a.title).join('  ·  ')}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — latest news */}
          <div className="xl:col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <Clock size={12} />
              Latest Updates
            </h3>
            <div className="space-y-0">
              {latest.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onArticleClick(article)}
                  className="flex items-start gap-3 py-4 border-b border-white/5 cursor-pointer group hover:bg-white/3 -mx-2 px-2 transition-colors"
                >
                  <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-800">
                    <img
                      src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-ashanti-gold text-[9px] font-black uppercase tracking-wider block mb-0.5">
                      {article.category}
                    </span>
                    <p className="text-white/80 text-xs font-bold leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {article.title}
                    </p>
                    <p className="text-white/25 text-[10px] mt-1">
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <ArrowRight size={13} className="text-white/10 group-hover:text-ashanti-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </motion.div>
              ))}
            </div>

            {/* Schedule */}
            <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-4">
                Broadcast Schedule
              </h4>
              {[
                { time: '06:00', show: 'Morning News Digest' },
                { time: '09:00', show: 'Ashanti Business Report' },
                { time: '12:00', show: 'Midday News Bulletin' },
                { time: '17:00', show: 'Evening Headlines' },
                { time: '21:00', show: 'Night Watch — Live' },
              ].map(({ time, show }) => (
                <div key={time} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-ashanti-gold text-xs font-black tabular-nums">{time}</span>
                  <span className="text-white/50 text-xs font-bold">{show}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
