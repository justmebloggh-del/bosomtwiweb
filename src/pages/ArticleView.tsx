import { Article, User } from '../types';
import {
  Share2, Bookmark, MessageSquare, ArrowLeft, Calendar,
  ArrowUpRight, Link, Check, PenLine, Loader2, Volume2, VolumeX,
  Clock, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, ReactNode, ReactElement, useRef } from 'react';

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function XIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
import AdBanner from '../components/AdBanner';
import ReadingProgress from '../components/ReadingProgress';
import PublishModal from '../components/PublishModal';
import { supabase } from '../lib/supabase';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  relatedArticles: Article[];
  onArticleClick: (article: Article) => void;
  user?: User | null;
  onArticleUpdated?: () => void;
}

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

// ── Content renderer ─────────────────────────────────────────────

function renderInline(text: string): ReactNode {
  const TOKEN = /(\*\*[^*\n]+\*\*|_[^_\n]+_|\[size:(?:sm|base|lg|xl)\][^\[]+\[\/size\])/g;
  const parts: ReactNode[] = [];
  let last = 0, k = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('_')) {
      parts.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    } else {
      const sm = tok.match(/^\[size:(sm|base|lg|xl)\](.*)\[\/size\]$/s);
      if (sm) {
        const cls: Record<string, string> = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl' };
        parts.push(<span key={k++} className={cls[sm[1]]}>{sm[2]}</span>);
      } else {
        parts.push(<span key={k++}>{tok}</span>);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length ? <>{parts}</> : text;
}

function renderYouTubeEmbed(url: string, key: string): ReactElement {
  let vid = '';
  try {
    vid = url.includes('youtu.be')
      ? (url.split('/').pop()?.split('?')[0] ?? '')
      : (new URLSearchParams(new URL(url).search).get('v') ?? '');
  } catch { vid = ''; }
  return (
    <div key={key} className="my-8 rounded-2xl shadow-lg overflow-hidden aspect-video">
      <iframe className="w-full h-full"
        src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`}
        title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen style={{ border: 'none' }} />
    </div>
  );
}

function renderBody(content: string): ReactElement[] {
  const lines = content.split('\n');
  const out: ReactElement[] = [];
  let buf: string[] = [], n = 0;

  function flush() {
    const text = buf.join('\n').trim();
    if (text) out.push(<p key={`p${n++}`} className="leading-relaxed mb-6">{renderInline(text)}</p>);
    buf = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith('[image]') && t.endsWith('[/image]')) {
      const url = t.slice(7, -8);
      if (url) { flush(); out.push(<figure key={`img${n++}`} className="my-8 rounded-2xl overflow-hidden shadow-lg"><img src={url} alt="" loading="lazy" className="w-full h-auto object-cover" /></figure>); continue; }
    }
    if (t.startsWith('[video]') && t.endsWith('[/video]')) {
      const url = t.slice(7, -8);
      if (url) {
        flush();
        if (/youtube\.com|youtu\.be/i.test(url)) out.push(renderYouTubeEmbed(url, `yt${n++}`));
        else out.push(<div key={`vid${n++}`} className="my-8 rounded-2xl shadow-lg overflow-hidden aspect-video bg-brand-surface"><video src={url} controls className="w-full h-full" /></div>);
        continue;
      }
    }
    if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(t)) { flush(); out.push(<figure key={`bimg${n++}`} className="my-8 rounded-2xl overflow-hidden shadow-lg"><img src={t} alt="" loading="lazy" className="w-full h-auto object-cover" /></figure>); continue; }
    if (/^https?:\/\/.+\.(mp4|webm|mov|avi)(\?.*)?$/i.test(t)) { flush(); out.push(<div key={`bvid${n++}`} className="my-8 rounded-2xl shadow-lg overflow-hidden aspect-video bg-brand-surface"><video src={t} controls className="w-full h-full" /></div>); continue; }
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(t)) { flush(); out.push(renderYouTubeEmbed(t, `byt${n++}`)); continue; }
    if (!t) { flush(); continue; }
    buf.push(lines[i]);
  }
  flush();
  return out;
}

// ── AI Narration button ──────────────────────────────────────────

function NarrationButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggle = () => {
    if (!('speechSynthesis' in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const u = new SpeechSynthesisUtterance(text.slice(0, 3000));
      u.rate = 0.95; u.pitch = 1;
      u.onend = () => setPlaying(false);
      utterRef.current = u;
      window.speechSynthesis.speak(u);
      setPlaying(true);
    }
  };

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  return (
    <button onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        playing
          ? 'bg-ashanti-gold text-black shadow-md shadow-ashanti-gold/30'
          : 'border border-news-border text-news-muted hover:border-ashanti-gold hover:text-ashanti-gold'
      }`}>
      {playing ? <VolumeX size={13} /> : <Volume2 size={13} />}
      {playing ? 'Stop Audio' : 'Listen to Article'}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────

export default function ArticleView({ article, onBack, relatedArticles, onArticleClick, user, onArticleUpdated }: ArticleViewProps) {
  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState(user?.name || '');
  const [commentBody, setCommentBody] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  const readingTime = Math.max(1, Math.ceil((article.content?.split(' ').length ?? 0) / 200));

  // ── Dynamic title + JSON-LD ──────────────────────────────────
  useEffect(() => {
    const prev = document.title;
    document.title = `${article.title} | Bosomtwi Web`;

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt,
      image: article.image ? [article.image] : [],
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      author: [{ '@type': 'Person', name: article.author }],
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'Bosomtwi Web',
        logo: { '@type': 'ImageObject', url: 'https://www.bosomtwiweb.com/logo.png' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': window.location.href },
      articleSection: article.category,
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-ld';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);

    return () => {
      document.title = prev;
      document.getElementById('article-ld')?.remove();
    };
  }, [article]);

  useEffect(() => {
    const key = `viewed_${article.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      supabase.rpc('increment_article_views', { p_article_id: article.id }).then(() => {}, () => {});
    }
    supabase.from('comments').select('*').eq('article_id', article.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments((data as Comment[]) || []));
  }, [article.id]);

  const handlePostComment = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommenting(true); setCommentError('');
    const name = commentName.trim() || 'Anonymous';
    const body = commentBody.trim();
    const { error } = await supabase.from('comments').insert({ article_id: article.id, author_name: name, body });
    setCommenting(false);
    if (error) {
      setCommentError(error.message || 'Failed to post comment. Please try again.');
    } else {
      setComments(prev => [...prev, { id: Date.now().toString(), author_name: name, body, created_at: new Date().toISOString() }]);
      setCommentBody('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Read this on Bosomtwi Web: ${article.title}`;
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <ReadingProgress />

      {/* ── Breadcrumbs ───────────────────────────────────────── */}
      <div className="border-b border-news-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-news-muted overflow-x-auto whitespace-nowrap">
            <button onClick={onBack} className="hover:text-ashanti-gold transition-colors">Home</button>
            <span>/</span>
            <span className="hover:text-ashanti-gold transition-colors cursor-default">{article.category}</span>
            <span>/</span>
            <span className="text-news-text line-clamp-1 max-w-[200px] sm:max-w-xs normal-case tracking-normal">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-news-muted hover:text-ashanti-gold group transition-colors">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Feed</span>
          </motion.button>
          {user && (
            <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 bg-ashanti-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-news-text transition-all shadow-lg">
              <PenLine size={12} /><span className="hidden sm:inline">Edit Article</span><span className="sm:hidden">Edit</span>
            </motion.button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

          {/* ── Sticky left share rail (desktop) ──────────────── */}
          <div className="hidden xl:flex flex-col items-center gap-3 sticky top-28 self-start pt-48">
            <span className="text-[8px] uppercase tracking-widest font-black text-news-muted writing-vertical rotate-180" style={{ writingMode: 'vertical-lr' }}>Share</span>
            <div className="w-px h-8 bg-news-border" />
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-news-border flex items-center justify-center text-news-muted hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all">
              <FacebookIcon size={15} />
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-news-border flex items-center justify-center text-news-muted hover:bg-black hover:border-black hover:text-white transition-all">
              <XIcon size={15} />
            </a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-news-border flex items-center justify-center text-news-muted hover:bg-green-500 hover:border-green-500 hover:text-white transition-all">
              <Share2 size={15} />
            </a>
            <button onClick={copyToClipboard}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${copied ? 'bg-ashanti-gold border-ashanti-gold text-black' : 'border-news-border text-news-muted hover:border-ashanti-gold hover:text-ashanti-gold'}`}>
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={14} /></motion.div>
                  : <motion.div key="link"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Link size={14} /></motion.div>}
              </AnimatePresence>
            </button>
            <button onClick={() => setBookmarked(b => !b)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${bookmarked ? 'bg-ashanti-gold border-ashanti-gold text-black' : 'border-news-border text-news-muted hover:border-ashanti-gold hover:text-ashanti-gold'}`}>
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* ── Main content ───────────────────────────────────── */}
          <article className="flex-grow max-w-3xl min-w-0">

            {/* Category + meta */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="cat-pill bg-ashanti-gold text-black">{article.category}</span>
                <div className="h-px bg-news-border flex-grow" />
              </div>

              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-news-text">
                {article.title}
              </h1>

              {/* Author + date + reading time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-news-border py-5 gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ashanti-gold rounded-full flex items-center justify-center text-black font-black text-lg shrink-0">
                    {article.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-base text-news-text">By {article.author}</div>
                    <div className="flex items-center gap-4 text-[10px] text-news-muted font-bold uppercase tracking-widest mt-0.5">
                      <span className="flex items-center gap-1"><Calendar size={10} />{new Date(article.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{readingTime} min read</span>
                      <span className="flex items-center gap-1"><Eye size={10} />Article</span>
                    </div>
                  </div>
                </div>

                {/* Mobile share row */}
                <div className="flex items-center gap-2 xl:hidden">
                  <div className="flex rounded-xl border border-news-border overflow-hidden bg-news-card">
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 text-news-muted hover:text-ashanti-gold transition-all"><FacebookIcon size={15} /></a>
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 text-news-muted hover:text-ashanti-gold transition-all"><XIcon size={15} /></a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 text-news-muted hover:text-ashanti-gold transition-all"><Share2 size={15} /></a>
                    <button onClick={copyToClipboard}
                      className="p-2.5 text-news-muted hover:text-ashanti-gold transition-all">
                      <AnimatePresence mode="wait">
                        {copied
                          ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={14} className="text-green-500" /></motion.div>
                          : <motion.div key="l" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Link size={14} /></motion.div>}
                      </AnimatePresence>
                    </button>
                  </div>
                  <button onClick={() => setBookmarked(b => !b)}
                    className={`p-2.5 border rounded-xl transition-all ${bookmarked ? 'bg-ashanti-gold border-ashanti-gold text-black' : 'border-news-border text-news-muted hover:border-ashanti-gold'}`}>
                    <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* AI narration */}
              <div className="mt-4">
                <NarrationButton text={`${article.title}. ${article.excerpt}. ${article.content ?? ''}`} />
              </div>
            </header>

            {/* Cover image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-10 bg-brand-surface shadow-xl">
              <img src={article.image} alt={article.title} loading="eager"
                className="w-full h-full object-cover" />
            </div>

            {/* Body */}
            <div className="font-sans text-news-text/85 text-[17px] leading-relaxed selection:bg-ashanti-gold selection:text-black">
              {/* Pull-quote excerpt */}
              <p className="font-heading text-xl md:text-2xl font-bold mb-8 text-news-text leading-snug gold-border-l pl-6 py-3 bg-brand-surface rounded-r-2xl italic">
                {article.excerpt}
              </p>

              <AdBanner size="wide" className="my-8" />

              <div className="space-y-0">
                {article.content
                  ? renderBody(article.content)
                  : <p className="text-news-muted italic">Full article body not available.</p>
                }
              </div>
            </div>

            {/* Embedded video */}
            {article.videoUrl && (
              <div className="mt-10 mb-8 rounded-2xl shadow-xl overflow-hidden aspect-video bg-gray-100">
                {article.videoUrl === 'LIVE_FEED' ? (
                  <iframe className="w-full h-full"
                    src="https://www.youtube.com/embed/wHmkUO1mkL0?si=bVrQuMSWbAjRcD1K"
                    title="Live Feed" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen style={{ border: 'none' }} />
                ) : article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
                  <iframe className="w-full h-full"
                    src={`https://www.youtube.com/embed/${
                      article.videoUrl.includes('youtu.be')
                        ? article.videoUrl.split('/').pop()
                        : new URLSearchParams(new URL(article.videoUrl).search).get('v')
                    }?rel=0&modestbranding=1`}
                    title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen style={{ border: 'none' }} />
                ) : (
                  <video src={article.videoUrl} controls className="w-full h-full" />
                )}
              </div>
            )}

            <AdBanner size="leaderboard" className="mt-8 mb-4" />

            {/* Tags / categories */}
            <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-news-border">
              <span className="text-[9px] font-black uppercase tracking-widest text-news-muted">Tags:</span>
              {[article.category, 'Ghana', 'Bosomtwe', 'Ashanti'].map(tag => (
                <span key={tag} className="cat-pill bg-brand-surface text-news-muted border border-news-border hover:border-ashanti-gold hover:text-ashanti-gold transition-all cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>

            {/* Comments */}
            <section className="mt-12 border-t border-news-border pt-10 pb-16">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare size={20} className="text-ashanti-gold" />
                <h2 className="text-2xl font-heading font-bold text-news-text">
                  Reader Comments
                  {comments.length > 0 && <span className="ml-2 text-lg font-normal text-news-muted">({comments.length})</span>}
                </h2>
              </div>

              {comments.length > 0 && (
                <div className="space-y-5 mb-10">
                  {comments.map((c: Comment) => (
                    <div key={c.id} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-brand-surface border border-news-border flex items-center justify-center text-sm font-bold text-news-muted shrink-0">
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow bg-brand-surface border border-news-border rounded-2xl px-5 py-4">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-sm font-bold text-news-text">{c.author_name}</span>
                          <span className="text-[10px] text-news-muted">
                            {new Date(c.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </div>
                        <p className="text-[15px] text-news-text/80 leading-relaxed">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handlePostComment} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-surface rounded-full border border-news-border flex items-center justify-center text-sm font-bold text-news-muted shrink-0">
                  {commentName ? commentName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-grow space-y-3">
                  <input type="text" value={commentName} onChange={e => setCommentName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                  <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)}
                    placeholder="Share your thoughts on this story…"
                    required
                    className="w-full bg-brand-surface border border-news-border rounded-2xl p-5 text-[15px] text-news-text focus:outline-none focus:border-ashanti-gold transition-all min-h-[130px] placeholder:text-news-muted resize-none shadow-inner" />
                  {commentError && <p className="text-sm text-red-500 font-semibold">{commentError}</p>}
                  {commentSuccess && <p className="text-sm text-green-500 font-semibold">Comment posted successfully!</p>}
                  <button type="submit" disabled={commenting || !commentBody.trim()}
                    className="px-8 py-3.5 bg-ashanti-gold text-black rounded-xl font-black uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all shadow-lg text-[11px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {commenting && <Loader2 size={14} className="animate-spin" />}
                    {commenting ? 'Posting…' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </section>

            {/* Disclaimer */}
            <section className="p-6 bg-brand-surface border border-news-border rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-ashanti-gold rounded-full mt-2 shrink-0" />
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-2">Disclaimer</h3>
                  <p className="text-sm text-news-muted leading-relaxed">
                    The Views, Comments, Opinions, Contributions and Statements made by Readers and Contributors on this platform do not necessarily represent the views or policy of{' '}
                    <span className="font-bold text-news-text">BOSOMTWI MEDIA NETWORK</span>
                  </p>
                </div>
              </div>
            </section>
          </article>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <aside className="lg:w-72 xl:w-80 shrink-0 space-y-8">

            {/* Latest news */}
            <section>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-news-text mb-5 pb-2 border-b-2 border-ashanti-gold inline-block">
                Latest News
              </h4>
              <div className="space-y-5">
                {relatedArticles.slice(0, 6).map(rel => (
                  <div key={rel.id} onClick={() => onArticleClick(rel)}
                    className="group cursor-pointer flex gap-3 items-start p-2 rounded-xl hover:bg-brand-surface transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-news-border">
                      <img src={rel.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rel.title} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold block mb-0.5">{rel.category}</span>
                      <h5 className="font-heading text-sm font-bold text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-3 leading-snug">
                        {rel.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <AdBanner size="rectangle" />

            {/* Promo card */}
            <section className="bg-news-card rounded-2xl border border-news-border p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-ashanti-gold/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
              <span className="text-[9px] font-black uppercase tracking-widest text-news-muted mb-4 block">Official Announcement</span>
              <h6 className="font-heading text-xl font-bold leading-snug text-news-text mb-2">Experience the spirit of Kumasi.</h6>
              <p className="text-news-muted text-sm mb-5">Discover artisanal markets, golden heritage and vibrant culture.</p>
              <button className="w-full py-3 bg-ashanti-gold text-black rounded-xl font-black uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all flex items-center justify-center text-[10px]">
                Explore Now <ArrowUpRight size={13} className="ml-2" />
              </button>
            </section>
          </aside>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit && user && (
          <PublishModal user={user} editArticle={article}
            onClose={() => setShowEdit(false)}
            onPublished={() => { setShowEdit(false); onArticleUpdated?.(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
