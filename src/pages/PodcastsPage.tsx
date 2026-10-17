import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Mic, Calendar, ExternalLink, Headphones } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';
import { supabase } from '../lib/supabase';

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episode: string | null;
  category: string | null;
  audio_url: string | null;
  video_url: string | null;
  author: string | null;
  created_at: string;
}

const SHOWS = [
  {
    id: 'ashanti-morning',
    title: 'Ashanti Morning',
    host: 'Kwame Asante & Akosua Mensah',
    desc: 'Start your day with the top stories from across the Ashanti Region. Weekdays, 30 minutes.',
    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
    category: 'News',
    frequency: 'Weekdays',
  },
  {
    id: 'manhyia-decoded',
    title: 'Manhyia Decoded',
    host: 'Abena Osei-Bonsu',
    desc: 'In-depth analysis of traditional governance, Ashanti culture, and the Manhyia Palace.',
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop',
    category: 'Culture',
    frequency: 'Weekly',
  },
  {
    id: 'the-business-hour',
    title: 'The Business Hour',
    host: 'Yaw Mensah',
    desc: 'Conversations with entrepreneurs, market insights, and economic analysis for the modern Ghanaian.',
    cover: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
    category: 'Business',
    frequency: 'Weekly',
  },
  {
    id: 'kumasi-underground',
    title: 'Kumasi Underground',
    host: 'Adwoa Frimpong',
    desc: 'The untold stories of Kumasi — art, music, food, and the creatives shaping the city.',
    cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
    category: 'Lifestyle',
    frequency: 'Bi-weekly',
  },
];

const CAT_COLORS: Record<string, string> = {
  News: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  Culture: 'bg-ashanti-gold/10 text-ashanti-gold',
  Business: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  Lifestyle: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
};
const DEFAULT_CAT_COLOR = 'bg-gray-50 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400';

const PLATFORMS = [
  { name: 'Spotify', href: '#' },
  { name: 'Apple Podcasts', href: '#' },
  { name: 'Google Podcasts', href: '#' },
  { name: 'YouTube', href: '#' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PodcastsPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('podcasts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setEpisodes(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = episodes;

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="Bosomtwi Podcasts"
        badge="Audio Journalism"
        description="Deep conversations, analysis, and stories told in audio. Listen anywhere, anytime."
        count={`${episodes.length} episode${episodes.length === 1 ? '' : 's'}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Listen on */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold">Listen on:</span>
          {PLATFORMS.map(p => (
            <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-news-card border border-news-border rounded-full text-[11px] font-bold text-news-text hover:border-ashanti-gold hover:text-ashanti-gold transition-all">
              <ExternalLink size={11} /> {p.name}
            </a>
          ))}
        </div>

        {/* Shows */}
        <section className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-6">Our Shows</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWS.map((show, i) => (
              <motion.div key={show.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="text-left group rounded-2xl overflow-hidden border border-news-border bg-news-card">
                <div className="relative aspect-square overflow-hidden">
                  <img src={show.cover} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${CAT_COLORS[show.category] ?? ''}`}>{show.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-news-text text-sm mb-0.5">{show.title}</h3>
                  <p className="text-[10px] text-ashanti-gold font-bold mb-2">{show.frequency}</p>
                  <p className="text-xs text-news-muted leading-relaxed line-clamp-2">{show.desc}</p>
                  <p className="text-[10px] text-news-muted mt-2">Hosted by {show.host}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Episodes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold">
              Latest Episodes ({filtered.length})
            </p>
          </div>
          {loading ? (
            <p className="text-sm text-news-muted">Loading episodes…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-news-muted">No episodes uploaded yet. Check back soon.</p>
          ) : (
          <div className="space-y-3">
            {filtered.map((ep, i) => {
              const isPlaying = playingId === ep.id;
              return (
                <motion.div key={ep.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`rounded-2xl border transition-all ${isPlaying ? 'border-ashanti-gold bg-ashanti-gold/5' : 'border-news-border bg-news-card hover:border-ashanti-gold/30'}`}>
                  <div className="flex items-center gap-4 p-4">
                    <button
                      disabled={!ep.audio_url && !ep.video_url}
                      onClick={() => setPlayingId(isPlaying ? null : ep.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${isPlaying ? 'bg-ashanti-gold text-black' : 'bg-brand-surface border border-news-border text-news-muted hover:bg-ashanti-gold hover:text-black hover:border-ashanti-gold'}`}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {ep.category && (
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${CAT_COLORS[ep.category] ?? DEFAULT_CAT_COLOR}`}>{ep.category}</span>
                        )}
                        {ep.episode && <span className="text-[9px] font-bold uppercase tracking-widest text-ashanti-gold">Ep. {ep.episode}</span>}
                      </div>
                      <p className="font-heading font-bold text-news-text text-sm line-clamp-1">{ep.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {ep.author && <span className="text-[10px] text-news-muted">By {ep.author}</span>}
                        <span className="flex items-center gap-1 text-[10px] text-news-muted"><Calendar size={9} />{formatDate(ep.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {isPlaying && (ep.audio_url || ep.video_url) && (
                    <div className="px-4 pb-4">
                      {ep.video_url
                        ? <video src={ep.video_url} controls autoPlay className="w-full rounded-xl max-h-80" />
                        : <audio src={ep.audio_url || undefined} controls autoPlay className="w-full" />}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          )}
        </section>

        {/* Subscribe CTA */}
        <div className="mt-14 p-8 bg-ashanti-green/10 border border-ashanti-green/20 rounded-3xl text-center">
          <Headphones size={28} className="text-ashanti-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-black text-news-text mb-2">Never Miss an Episode</h2>
          <p className="text-news-muted text-sm mb-6 max-w-sm mx-auto">Subscribe on your favourite platform and get new episodes delivered automatically.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {PLATFORMS.map(p => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
