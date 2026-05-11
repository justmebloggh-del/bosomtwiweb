import { Article, User } from '../types';
import { Share2, Bookmark, MessageSquare, ArrowLeft, Calendar, ArrowUpRight, Facebook, Twitter, Link, Check, PenLine, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, FormEvent, ReactNode, ReactElement } from 'react';
import AdBanner from '../components/AdBanner';
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
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
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
    <div key={key} className="my-8 rounded-xl shadow-lg overflow-hidden aspect-video">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: 'none' }}
      />
    </div>
  );
}

function renderBody(content: string): ReactElement[] {
  const lines = content.split('\n');
  const out: ReactElement[] = [];
  let buf: string[] = [];
  let n = 0;

  function flush() {
    const text = buf.join('\n').trim();
    if (text) out.push(<p key={`p${n++}`} className="leading-relaxed">{renderInline(text)}</p>);
    buf = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // [image]URL[/image]
    if (t.startsWith('[image]') && t.endsWith('[/image]')) {
      const url = t.slice(7, -8);
      if (url) {
        flush();
        out.push(
          <figure key={`img${n++}`} className="my-8 rounded-xl overflow-hidden shadow-lg">
            <img src={url} alt="" loading="lazy" className="w-full h-auto object-cover" />
          </figure>
        );
        continue;
      }
    }

    // [video]URL[/video]
    if (t.startsWith('[video]') && t.endsWith('[/video]')) {
      const url = t.slice(7, -8);
      if (url) {
        flush();
        if (/youtube\.com|youtu\.be/i.test(url)) {
          out.push(renderYouTubeEmbed(url, `yt${n++}`));
        } else {
          out.push(
            <div key={`vid${n++}`} className="my-8 rounded-xl shadow-lg overflow-hidden aspect-video bg-gray-100">
              <video src={url} controls className="w-full h-full" />
            </div>
          );
        }
        continue;
      }
    }

    // Bare image URL
    if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(t)) {
      flush();
      out.push(
        <figure key={`bimg${n++}`} className="my-8 rounded-xl overflow-hidden shadow-lg">
          <img src={t} alt="" loading="lazy" className="w-full h-auto object-cover" />
        </figure>
      );
      continue;
    }

    // Bare video URL
    if (/^https?:\/\/.+\.(mp4|webm|mov|avi)(\?.*)?$/i.test(t)) {
      flush();
      out.push(
        <div key={`bvid${n++}`} className="my-8 rounded-xl shadow-lg overflow-hidden aspect-video bg-gray-100">
          <video src={t} controls className="w-full h-full" />
        </div>
      );
      continue;
    }

    // Bare YouTube URL
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(t)) {
      flush();
      out.push(renderYouTubeEmbed(t, `byt${n++}`));
      continue;
    }

    // Empty line → paragraph break
    if (!t) { flush(); continue; }

    buf.push(lines[i]);
  }

  flush();
  return out;
}

// ────────────────────────────────────────────────────────────────

export default function ArticleView({ article, onBack, relatedArticles, onArticleClick, user, onArticleUpdated }: ArticleViewProps) {
  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState(user?.name || '');
  const [commentBody, setCommentBody] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    // Count this view once per session per article
    const key = `viewed_${article.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      supabase.rpc('increment_article_views', { p_article_id: article.id }).then(() => {}, () => {});
    }
    // Load comments
    supabase
      .from('comments')
      .select('*')
      .eq('article_id', article.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments((data as Comment[]) || []));
  }, [article.id]);

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommenting(true);
    setCommentError('');
    const name = commentName.trim() || 'Anonymous';
    const body = commentBody.trim();
    const { error } = await supabase
      .from('comments')
      .insert({ article_id: article.id, author_name: name, body });
    setCommenting(false);
    if (error) {
      console.error('[Comments] insert error:', error);
      setCommentError(error.message || 'Failed to post comment. Please try again.');
    } else {
      const optimistic: Comment = {
        id: Date.now().toString(),
        author_name: name,
        body,
        created_at: new Date().toISOString(),
      };
      setComments(prev => [...prev, optimistic]);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-news-bg min-h-screen">

      {/* Top bar: Back + Edit */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] text-news-text/40 hover:text-ashanti-gold group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to News Feed</span>
        </motion.button>

        {user && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a0a35] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <PenLine size={13} />
            <span className="hidden sm:inline">Edit Article</span>
            <span className="sm:hidden">Edit</span>
          </motion.button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Main Article Content */}
        <div className="flex-grow max-w-4xl min-w-0">
          <header className="mb-10 md:mb-12">
            <div className="flex items-center space-x-4 mb-6 md:mb-8">
              <span className="text-ashanti-gold text-[12px] uppercase font-bold tracking-[0.3em]">
                {article.category}
              </span>
              <div className="h-px bg-brand-secondary/20 flex-grow" />
            </div>

            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-10 leading-[1.1] tracking-tight text-news-text">
              {article.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-brand-secondary/20 py-6 md:py-8 gap-6 md:gap-8">
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="w-11 h-11 md:w-14 md:h-14 bg-brand-surface rounded-full flex items-center justify-center text-news-text text-lg md:text-xl font-bold border border-brand-secondary/20 shrink-0">
                  {article.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-base md:text-lg font-bold text-news-text">By {article.author}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-news-text/30 flex items-center space-x-3 mt-1">
                    <Calendar size={12} />
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Share row */}
                <div className="flex bg-brand-surface p-1 rounded-lg border border-brand-secondary/20">
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="p-2 md:p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all" title="Share on Facebook">
                    <Facebook size={16} />
                  </a>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="p-2 md:p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all" title="Share on X">
                    <Twitter size={16} />
                  </a>
                  <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="p-2 md:p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all" title="Share on WhatsApp">
                    <Share2 size={16} />
                  </a>
                  <button onClick={copyToClipboard}
                    className="p-2 md:p-2.5 text-news-text/40 hover:text-ashanti-gold transition-all relative" title="Copy Link">
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} className="text-green-600" /></motion.div>
                        : <motion.div key="link"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Link size={16} /></motion.div>
                      }
                    </AnimatePresence>
                  </button>
                </div>
                <button className="p-2.5 bg-brand-surface border border-brand-secondary/20 hover:border-ashanti-gold rounded-lg transition-all text-news-text/40 hover:text-ashanti-gold shadow-sm">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Cover image */}
          <div className="relative h-[240px] md:h-[420px] lg:h-[500px] mb-10 md:mb-12 rounded-2xl overflow-hidden bg-brand-accent/20 border border-brand-secondary/20 shadow-xl">
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          {/* Body */}
          <div className="prose prose-lg max-w-none font-sans text-news-text/80 leading-relaxed selection:bg-ashanti-gold selection:text-black">
            {/* Excerpt pull-quote */}
            <p className="font-heading text-xl md:text-2xl lg:text-3xl font-bold mb-10 md:mb-12 text-news-text leading-tight border-l-8 border-ashanti-gold pl-6 md:pl-8 py-4 bg-brand-surface rounded-r-2xl italic">
              {article.excerpt}
            </p>

            <AdBanner size="wide" className="my-8" />

            <div className="space-y-6 text-base md:text-[18px]">
              {article.content
                ? renderBody(article.content)
                : <p className="text-news-text/40 italic">Full article body not available.</p>
              }
            </div>
          </div>

          {/* Embedded video */}
          {article.videoUrl && (
            <div className="mt-12 mb-16 bg-gray-100 rounded-2xl shadow-xl overflow-hidden aspect-video">
              {article.videoUrl === 'LIVE_FEED' ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/wHmkUO1mkL0?si=bVrQuMSWbAjRcD1K"
                  title="Live Feed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              ) : article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${
                    article.videoUrl.includes('youtu.be')
                      ? article.videoUrl.split('/').pop()
                      : new URLSearchParams(new URL(article.videoUrl).search).get('v')
                  }?rel=0&modestbranding=1&autoplay=0`}
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              ) : (
                <video src={article.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          )}

          <AdBanner size="leaderboard" className="mt-10 mb-4" />

          {/* Comments section */}
          <section className="mt-10 md:mt-12 border-t border-brand-secondary/20 pt-12 pb-16 md:pb-20">
            <div className="flex items-center space-x-4 mb-8 md:mb-10">
              <MessageSquare size={22} className="text-ashanti-gold" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-news-text">
                Reader Comments
                {comments.length > 0 && (
                  <span className="ml-3 text-lg font-normal text-news-text/40">({comments.length})</span>
                )}
              </h2>
            </div>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-6 mb-10">
                {comments.map((c: Comment) => (
                  <div key={c.id} className="flex items-start space-x-4">
                    <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-secondary/20 flex items-center justify-center text-sm font-bold text-news-text/60 shrink-0">
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow bg-brand-surface border border-brand-secondary/10 rounded-2xl px-5 py-4">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-sm font-bold text-news-text">{c.author_name}</span>
                        <span className="text-[11px] text-news-text/30">
                          {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[15px] text-news-text/80 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Post form */}
            <form onSubmit={handlePostComment} className="flex items-start space-x-4 md:space-x-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-surface rounded-full border border-brand-secondary/20 flex items-center justify-center text-sm font-bold text-news-text/40 shrink-0">
                {commentName ? commentName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-grow space-y-3">
                <input
                  type="text"
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-brand-surface border border-brand-secondary/20 rounded-xl px-4 py-3 text-sm font-sans text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-text/30"
                />
                <textarea
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                  placeholder="Contribute to the discussion..."
                  required
                  className="w-full bg-brand-surface border border-brand-secondary/20 rounded-2xl p-4 md:p-6 text-[15px] md:text-[16px] font-sans text-news-text focus:outline-none focus:border-ashanti-gold transition-all min-h-[120px] md:min-h-[150px] placeholder:text-news-text/30 shadow-inner resize-none"
                />
                {commentError && (
                  <p className="text-sm text-red-500 font-semibold">{commentError}</p>
                )}
                {commentSuccess && (
                  <p className="text-sm text-green-600 font-semibold">Comment posted!</p>
                )}
                <button
                  type="submit"
                  disabled={commenting || !commentBody.trim()}
                  className="px-8 md:px-10 py-3 md:py-4 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-black hover:text-ashanti-gold transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {commenting && <Loader2 size={15} className="animate-spin" />}
                  {commenting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          </section>

          {/* Disclaimer Section */}
          <section className="mt-12 md:mt-16 p-6 md:p-8 bg-brand-surface border border-brand-secondary/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-ashanti-gold rounded-full mt-2 shrink-0" />
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-ashanti-gold mb-3">
                  Disclaimer
                </h3>
                <p className="text-sm md:text-base text-news-text/70 leading-relaxed">
                  The Views, Comments, Opinions, Contributions and Statements made by Readers and Contributors on this platform do not necessarily represent the views or policy of <span className="font-bold text-news-text">BOSOMTWI MEDIA NETWORK</span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 xl:w-80 shrink-0 space-y-10 md:space-y-12">
          <section>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-news-text mb-6 md:mb-8 border-b-2 border-ashanti-gold pb-2 inline-block">
              Latest News
            </h4>
            <div className="space-y-6 md:space-y-8">
              {relatedArticles.slice(0, 5).map(rel => (
                <div key={rel.id} onClick={() => onArticleClick(rel)}
                  className="group cursor-pointer flex space-x-4 items-start">
                  <div className="w-18 h-18 md:w-20 md:h-20 rounded-lg overflow-hidden bg-brand-surface shrink-0 border border-brand-secondary/10" style={{ width: 72, height: 72 }}>
                    <img src={rel.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rel.title} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ashanti-gold block mb-1">{rel.category}</span>
                    <h5 className="font-heading text-sm md:text-base font-bold text-news-text group-hover:text-ashanti-gold leading-tight transition-colors line-clamp-2">
                      {rel.title}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <AdBanner size="rectangle" />

          <section className="bg-white rounded-2xl border border-brand-secondary/20 p-6 md:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-ashanti-gold/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-news-text/30 mb-4 block">Official Announcement</span>
            <div className="space-y-4 md:space-y-6">
              <h6 className="font-heading text-xl md:text-2xl font-bold leading-tight text-news-text">Experience the spirit of Kumasi.</h6>
              <p className="text-news-text/40 text-sm">Discover artisanal markets, golden heritage and vibrant culture.</p>
              <button className="w-full py-3 md:py-4 bg-ashanti-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-black hover:text-ashanti-gold transition-all flex items-center justify-center text-[10px]">
                Explore Now <ArrowUpRight size={14} className="ml-2" />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit && user && (
          <PublishModal
            user={user}
            editArticle={article}
            onClose={() => setShowEdit(false)}
            onPublished={() => {
              setShowEdit(false);
              onArticleUpdated?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
