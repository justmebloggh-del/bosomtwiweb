import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import CategoryPage from './pages/CategoryPage';
import TrendingPage from './pages/TrendingPage';
import VideosPage from './pages/VideosPage';
import LivePage from './pages/LivePage';
import ArchivesPage from './pages/ArchivesPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Advertise from './pages/Advertise';
import PublishModal from './components/PublishModal';
import { Article, User } from './types';
import { supabase, dbToArticle } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ChevronRight, AlertCircle, Search, X, PenSquare } from 'lucide-react';

type Page = 'home' | 'article' | 'category' | 'privacy' | 'terms' | 'advertise' | 'trending' | 'videos' | 'live' | 'archives';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLivePlayer, setShowLivePlayer] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loadArticles = () => {
    setIsLoadingArticles(true);
    supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[Bosomtwi] Failed to load articles:', error.message);
        setArticles(Array.isArray(data) ? data.map(dbToArticle) : []);
        setIsLoadingArticles(false);
      });
  };

  useEffect(() => { loadArticles(); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(sessionToUser(session.user));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? sessionToUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function sessionToUser(u: any): User {
    return {
      id: u.id,
      email: u.email ?? '',
      name: u.user_metadata?.name || u.email?.split('@')[0] || 'Journalist',
      role: u.user_metadata?.role || 'journalist',
    };
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('home');
  };

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentPage('article');
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (category: string) => {
    if (!category) { setCurrentPage('home'); setActiveCategory(''); }
    else { setActiveCategory(category); setCurrentPage('category'); }
    window.scrollTo(0, 0);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const publishDefaultCategory = currentPage === 'category' ? activeCategory : undefined;

  const searchResults = searchQuery.trim().length > 1
    ? articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-ashanti-gold selection:text-black bg-news-bg overflow-x-hidden text-news-text">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onCategoryClick={handleCategorySelect}
        onNavigate={handleNavigate}
        onSearchOpen={() => setShowSearch(true)}
      />

      <main className="flex-grow bg-news-bg relative">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Home onArticleClick={navigateToArticle} articles={articles} onCategoryClick={handleCategorySelect} loading={isLoadingArticles} />
            </motion.div>
          )}
          {currentPage === 'category' && (
            <motion.div key={`cat-${activeCategory}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CategoryPage
                category={activeCategory}
                onArticleClick={navigateToArticle}
                articles={articles}
                onHomeClick={() => handleCategorySelect('')}
                loading={isLoadingArticles}
                user={user}
                onArticlePublished={loadArticles}
              />
            </motion.div>
          )}
          {currentPage === 'article' && selectedArticle && (
            <motion.div key="article" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ArticleView
                article={selectedArticle}
                onBack={() => { setCurrentPage('home'); setSelectedArticle(null); }}
                relatedArticles={articles.filter(a => a.id !== selectedArticle.id)}
                onArticleClick={navigateToArticle}
                user={user}
                onArticleUpdated={loadArticles}
              />
            </motion.div>
          )}
          {currentPage === 'trending' && (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <TrendingPage articles={articles} onArticleClick={navigateToArticle} loading={isLoadingArticles} />
            </motion.div>
          )}
          {currentPage === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <VideosPage articles={articles} onArticleClick={navigateToArticle} loading={isLoadingArticles} user={user} onArticlePublished={loadArticles} />
            </motion.div>
          )}
          {currentPage === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LivePage articles={articles} onArticleClick={navigateToArticle} />
            </motion.div>
          )}
          {currentPage === 'archives' && (
            <motion.div key="archives" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ArchivesPage articles={articles} onArticleClick={navigateToArticle} loading={isLoadingArticles} />
            </motion.div>
          )}
          {currentPage === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <PrivacyPolicy onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
          {currentPage === 'terms' && (
            <motion.div key="terms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <TermsOfService onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
          {currentPage === 'advertise' && (
            <motion.div key="advertise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Advertise onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {user && currentPage !== 'live' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowPublish(true)}
              className="fixed bottom-24 right-4 md:bottom-10 md:right-8 z-[90] w-14 h-14 bg-ashanti-gold text-black rounded-full shadow-2xl shadow-ashanti-gold/30 flex items-center justify-center border-2 border-ashanti-gold hover:bg-black hover:text-ashanti-gold transition-colors"
              title="Publish new story"
            >
              <PenSquare size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLivePlayer && (
            <motion.div
              drag dragMomentum={false} dragElastic={0}
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 16 }}
              transition={{ delay: 2 }}
              className="fixed bottom-4 right-2 left-2 md:left-auto md:right-8 md:bottom-8 z-[100] md:w-80 bg-black shadow-2xl border border-white/10 overflow-hidden rounded-xl"
            >
              {/* Drag handle — touch-action managed by motion, safe to grab */}
              <div className="h-8 bg-black flex items-center justify-between px-3 border-b border-white/5 cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full"
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60 italic">🔴 Live Feed</span>
                </div>
                <button
                  onClick={() => setShowLivePlayer(false)}
                  style={{ touchAction: 'auto' }}
                  className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                >
                  <X size={13} />
                </button>
              </div>
              {/* Video — touchAction:auto lets YouTube volume/scrub controls work on mobile */}
              <div className="aspect-video" style={{ touchAction: 'auto' }}>
                <iframe
                  width="100%" height="100%"
                  src="https://www.youtube.com/embed/STQpAHL5G5g?autoplay=1&mute=1&controls=1&loop=1&playlist=STQpAHL5G5g&modestbranding=1&rel=0&playsinline=1"
                  title="Bosomtwi Web Live"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none', display: 'block', touchAction: 'auto' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} onCategoryClick={handleCategorySelect} />

      {/* Search */}
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 z-[200] flex flex-col px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white shadow-2xl w-full max-w-2xl mx-auto mt-24 rounded-2xl overflow-hidden">
              <div className="flex items-center border-b border-brand-secondary/20 px-6 py-4">
                <Search size={20} className="text-ashanti-gold shrink-0 mr-4" />
                <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search news, categories, authors…"
                  className="flex-grow text-lg font-sans text-news-text bg-transparent focus:outline-none placeholder:text-news-text/30" />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="ml-4 p-1.5 text-news-text/30 hover:text-news-text rounded-full hover:bg-gray-100 transition-all"><X size={18} /></button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {searchQuery.trim().length > 1 ? (
                  searchResults.length > 0 ? (
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-news-text/30 px-3 py-2">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                      {searchResults.map(article => (
                        <button key={article.id} onClick={() => { navigateToArticle(article); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full text-left flex items-start space-x-4 p-3 hover:bg-brand-surface rounded-xl transition-colors group">
                          <img src={article.image} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-ashanti-gold block mb-0.5">{article.category}</span>
                            <span className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-tight line-clamp-2 block">{article.title}</span>
                            <span className="text-[11px] text-news-text/40 mt-0.5 block">{article.author}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-6">
                      <p className="text-news-text/30 font-heading italic text-xl">No results for "{searchQuery}"</p>
                    </div>
                  )
                ) : (
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-news-text/30 mb-4">Browse Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle'].map(cat => (
                        <button key={cat} onClick={() => { handleCategorySelect(cat); setShowSearch(false); setSearchQuery(''); }}
                          className="px-4 py-2 rounded-full bg-gray-100 text-[11px] font-bold uppercase tracking-wider text-news-text/70 hover:bg-ashanti-gold hover:text-black transition-all">{cat}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publish modal */}
      <AnimatePresence>
        {showPublish && user && (
          <PublishModal user={user} defaultCategory={publishDefaultCategory}
            onClose={() => setShowPublish(false)}
            onPublished={() => { loadArticles(); setShowPublish(false); }} />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-brand-surface/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-brand-secondary/20 overflow-hidden">
              <div className="p-10 md:p-12">
                <div className="mb-10 text-center">
                  <div className="font-heading text-3xl font-black mb-2 tracking-tighter text-news-text">BOSOMTWI <span className="text-brand-primary">WEB</span></div>
                  <p className="text-news-text/40 text-[10px] font-black uppercase tracking-[0.3em]">Journalist Access</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-text/40 flex items-center space-x-2"><Mail size={12} /><span>Email Address</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-news-text/20"
                      placeholder="you@bosomtwi.web" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-text/40 flex items-center space-x-2"><Lock size={12} /><span>Password</span></label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-news-text/20"
                      placeholder="••••••••" required />
                  </div>
                  {authError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={14} /><span>{authError}</span>
                    </motion.div>
                  )}
                  <div className="pt-4">
                    <button type="submit" disabled={isAuthenticating}
                      className="w-full bg-ashanti-gold hover:bg-black text-black hover:text-ashanti-gold py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 group">
                      <span>{isAuthenticating ? 'Signing in…' : 'Sign In'}</span>
                      {!isAuthenticating && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                  <p className="text-center text-[10px] uppercase tracking-widest font-bold text-news-text/30 pt-2">Access restricted to authorised journalists only.</p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
