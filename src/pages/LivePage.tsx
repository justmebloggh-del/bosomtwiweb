import { Article } from '../types';
import { motion } from 'motion/react';
import { Radio, Clock, ArrowRight, Volume2 } from 'lucide-react';

interface LivePageProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export default function LivePage({ articles, onArticleClick }: LivePageProps) {
  const latest = articles.slice(0, 8);
  const streamAvailable = false; // Set to false to show the message

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ...existing code... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main player */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-ashanti-gold/20 rounded-[2rem] blur-xl" />
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/10 flex items-center justify-center">
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/wHmkUO1mkL0?si=bVrQuMSWbAjRcD1K"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
            {/* ...existing code... */}
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
