import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Advertise from './pages/Advertise';
import { Article, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ChevronRight, AlertCircle, Search, X } from 'lucide-react';

type Page = 'home' | 'article' | 'admin' | 'category' | 'privacy' | 'terms' | 'advertise';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLivePlayer, setShowLivePlayer] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    setIsLoadingArticles(true);
    fetch('/api/articles')
      .then(res => res.ok ? res.json() : [])
      .then(data => { setArticles(data); setIsLoadingArticles(false); })
      .catch(() => { setArticles([]); setIsLoadingArticles(false); });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bosomtwi_user');
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('bosomtwi_token', data.token);
      localStorage.setItem('bosomtwi_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowLoginModal(false);
      setCurrentPage('admin');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bosomtwi_token');
    localStorage.removeItem('bosomtwi_user');
    setUser(null);
    setCurrentPage('home');
  };

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentPage('article');
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (category: string) => {
    if (!category) {
      setCurrentPage('home');
      setActiveCategory('');
    } else {
      setActiveCategory(category);
      setCurrentPage('category');
    }
    window.scrollTo(0, 0);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const searchResults = searchQuery.trim().length > 1
    ? articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (currentPage === 'admin' && user) {
    return <AdminDashboard onLogout={handleLogout} user={user} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-ashanti-gold selection:text-black bg-news-bg overflow-x-hidden text-news-text">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onAdminClick={() => setCurrentPage('admin')}
        onCategoryClick={handleCategorySelect}
        onNavigate={handleNavigate}
        onSearchOpen={() => setShowSearch(true)}
      />

      <main className="flex-grow bg-news-bg relative">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Home onArticleClick={navigateToArticle} articles={articles} onCategoryClick={handleCategorySelect} loading={isLoadingArticles} />
            </motion.div>
          )}
          {currentPage === 'category' && (
            <motion.div key={`cat-${activeCategory}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <CategoryPage category={activeCategory} onArticleClick={navigateToArticle} articles={articles} onHomeClick={() => handleCategorySelect('')} loading={isLoadingArticles} />
            </motion.div>
          )}
          {currentPage === 'article' && selectedArticle && (
            <motion.div key="article" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
              <ArticleView article={selectedArticle} onBack={() => { setCurrentPage('home'); setSelectedArticle(null); }} relatedArticles={articles.filter(a => a.id !== selectedArticle.id)} onArticleClick={navigateToArticle} />
            </motion.div>
          )}
          {currentPage === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <PrivacyPolicy onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
          {currentPage === 'terms' && (
            <motion.div key="terms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <TermsOfService onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
          {currentPage === 'advertise' && (
            <motion.div key="advertise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Advertise onBack={() => handleNavigate('home')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Draggable Live Video Player */}
        <AnimatePresence>
          {showLivePlayer && (
            <motion.div
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: 1.5 }}
              className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-60 md:w-80 aspect-video bg-black shadow-2xl border border-white/10 overflow-hidden touch-none rounded-xl"
            >
              <div className="absolute top-0 inset-x-0 h-7 bg-black/90 backdrop-blur-sm flex items-center justify-between px-3 z-10 border-b border-white/5">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary italic">🔴 Live Feed</span>
                <button
                  onClick={() => setShowLivePlayer(false)}
                  className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={12} />
                </button>
              </div>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/STQpAHL5G5g?autoplay=1&mute=1&controls=1&loop=1&playlist=STQpAHL5G5g&modestbranding=1&rel=0&playsinline=1"
                title="Bosomtwi Web Live"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 'none', paddingTop: '28px' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} onCategoryClick={handleCategorySelect} />

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 z-[200] flex flex-col px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white shadow-2xl w-full max-w-2xl mx-auto mt-24 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center border-b border-brand-secondary/20 px-6 py-4">
                <Search size={20} className="text-ashanti-gold shrink-0 mr-4" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search news, categories, authors..."
                  className="flex-grow text-lg font-sans text-news-text bg-transparent focus:outline-none placeholder:text-news-text/30"
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="ml-4 p-1.5 text-news-text/30 hover:text-news-text rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto">
                {searchQuery.trim().length > 1 ? (
                  searchResults.length > 0 ? (
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-news-text/30 px-3 py-2">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map(article => (
                        <button
                          key={article.id}
                          onClick={() => { navigateToArticle(article); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full text-left flex items-start space-x-4 p-3 hover:bg-brand-surface rounded-xl transition-colors group"
                        >
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
                      <p className="text-news-text/20 text-sm mt-2">Try different keywords or browse a category below</p>
                    </div>
                  )
                ) : (
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-news-text/30 mb-4">Browse Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {['Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 'Entertainment', 'Health', 'Local', 'International'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => { handleCategorySelect(cat); setShowSearch(false); setSearchQuery(''); }}
                          className="px-4 py-2 rounded-full bg-gray-100 text-[11px] font-bold uppercase tracking-wider text-news-text/70 hover:bg-ashanti-gold hover:text-black transition-all"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-brand-surface/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-brand-secondary/20 overflow-hidden"
            >
              <div className="p-12">
                <div className="mb-10 text-center">
                  <div className="font-heading text-3xl font-black mb-2 tracking-tighter text-news-text">
                    BOSOMTWI <span className="text-brand-primary">WEB</span>
                  </div>
                  <p className="text-news-text/40 text-[10px] font-black uppercase tracking-[0.3em]">Administrative Access</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-text/40 flex items-center space-x-2">
                      <Mail size={12} /><span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-news-text/20"
                      placeholder="admin@bosomtwi.web"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-text/40 flex items-center space-x-2">
                      <Lock size={12} /><span>Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-news-text/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100"
                    >
                      <AlertCircle size={14} /><span>{authError}</span>
                    </motion.div>
                  )}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full bg-ashanti-gold hover:bg-black text-black hover:text-ashanti-gold py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span>{isAuthenticating ? 'Authenticating...' : 'Sign In Now'}</span>
                      {!isAuthenticating && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                  <p className="text-center text-[10px] uppercase tracking-widest font-bold text-news-text/30 pt-4">
                    Access is restricted to authorised personnel only.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
