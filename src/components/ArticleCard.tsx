import { Article } from '../types';
import { Clock, ArrowUpRight, Play } from 'lucide-react';
import { optimizedImageUrl } from '../lib/supabase';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'list' | 'cinematic';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ArticleCard({ article, variant = 'medium' }: ArticleCardProps) {
  // ── Cinematic (full-bleed overlay) ──────────────────────────
  if (variant === 'cinematic') {
    return (
      <div className="group relative h-[500px] overflow-hidden cursor-pointer bg-gray-200 rounded-2xl">
        <img src={optimizedImageUrl(article.image, 1200)} alt={article.title} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70" />
        <div className="news-banner-overlay absolute inset-0 rounded-2xl" />
        <div className="absolute bottom-0 p-8 w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="cat-pill bg-ashanti-gold text-black">{article.category}</span>
            {(article as any).status === 'published' && (
              <span className="cat-pill bg-red-600 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />LIVE
              </span>
            )}
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight text-white group-hover:text-ashanti-gold transition-colors mb-4 line-clamp-3">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-white/50 text-[11px] font-bold uppercase tracking-widest">
            <span>{article.author}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Large ────────────────────────────────────────────────────
  if (variant === 'large') {
    return (
      <div className="group relative h-[500px] overflow-hidden cursor-pointer bg-gray-200 rounded-2xl">
        <img src={optimizedImageUrl(article.image, 1200)} alt={article.title} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-65" />
        <div className="news-banner-overlay absolute inset-0 rounded-2xl" />
        <div className="absolute bottom-0 p-8 w-full">
          <span className="cat-pill bg-ashanti-gold text-black mb-4 inline-block">
            Top Story · {article.category}
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight text-white group-hover:text-ashanti-gold transition-colors mb-3 line-clamp-3">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-white/50 text-[11px] font-bold uppercase tracking-widest">
            <span>{article.author}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div className="flex gap-4 items-start group cursor-pointer border-b border-news-border pb-5 last:border-0">
        <div className="w-24 h-24 rounded-xl shrink-0 overflow-hidden bg-brand-surface border border-news-border">
          <img src={optimizedImageUrl(article.image, 200)} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt={article.title} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] uppercase tracking-widest font-black text-ashanti-gold block mb-1">{article.category}</span>
          <h3 className="font-heading text-base font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-news-muted font-bold uppercase tracking-widest">
            <span>{article.author}</span>
            <span className="flex items-center gap-1"><Clock size={9} />{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Small ────────────────────────────────────────────────────
  if (variant === 'small') {
    return (
      <div className="group cursor-pointer flex gap-3">
        <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden bg-brand-surface">
          <img src={optimizedImageUrl(article.image, 150)} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={article.title} />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase tracking-widest font-black text-ashanti-gold block mb-0.5">{article.category}</span>
          <h4 className="font-heading text-sm font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </div>
    );
  }

  // ── Medium (default) — premium card ─────────────────────────
  return (
    <div className="bg-news-card rounded-2xl overflow-hidden border border-news-border card-glass hover:border-ashanti-gold/50 group cursor-pointer flex flex-col h-full">
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
        <img src={optimizedImageUrl(article.image, 600)} alt={article.title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Video play button */}
        {article.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-ashanti-gold rounded-full flex items-center justify-center text-black shadow-xl group-hover:scale-110 transition-transform">
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="cat-pill bg-ashanti-gold text-black shadow-md shadow-ashanti-gold/30">{article.category}</span>
          {(article as any).status === 'published' && (
            <span className="cat-pill bg-red-600 text-white flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping" />LIVE
            </span>
          )}
        </div>

        {/* Time badge */}
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1 bg-black/60 text-white/80 text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            <Clock size={9} />{timeAgo(article.publishedAt)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold mb-2.5 leading-snug text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-news-muted text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-news-border">
          <span className="text-[10px] font-bold text-news-muted uppercase tracking-widest">{article.author}</span>
          <span className="flex items-center gap-1 text-ashanti-gold text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
            Read <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
