import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/AdminDashboard';
import { Article, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'article' | 'admin' | 'category'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    setIsLoadingArticles(true);
    fetch('/api/articles')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setArticles(data);
        setIsLoadingArticles(false);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
        setArticles([]);
        setIsLoadingArticles(false);
      });
  }, []);

  useEffect(() => {
    // Check for stored token
    const savedUser = localStorage.getItem('bosomtwi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('bosomtwi_token', data.token);
      localStorage.setItem('bosomtwi_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowLoginModal(false);

      if (data.user.role === 'admin') {
        setCurrentPage('admin');
      }
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

  if (currentPage === 'admin' && user?.role === 'admin') {
    return (
      <AdminDashboard onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-ashanti-gold selection:text-black bg-news-bg overflow-x-hidden text-news-text">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onAdminClick={() => setCurrentPage('admin')}
        onCategoryClick={handleCategorySelect}
      />

      <main className="flex-grow bg-news-bg relative">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Home
                onArticleClick={navigateToArticle}
                articles={articles}
                onCategoryClick={handleCategorySelect}
                loading={isLoadingArticles}
              />
            </motion.div>
          )}

          {currentPage === 'category' && (
            <motion.div
              key={`category-${activeCategory}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CategoryPage
                category={activeCategory}
                onArticleClick={navigateToArticle}
                articles={articles}
                onHomeClick={() => handleCategorySelect('')}
                loading={isLoadingArticles}
              />
            </motion.div>
          )}

          {currentPage === 'article' && selectedArticle && (
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ArticleView
                article={selectedArticle}
                onBack={() => {
                  setCurrentPage('home');
                  setSelectedArticle(null);
                }}
                relatedArticles={articles.filter(a => a.id !== selectedArticle.id)}
                onArticleClick={navigateToArticle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Persistent Video Player */}
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed bottom-8 right-8 z-[100] w-72 md:w-80 aspect-video bg-black shadow-2xl border border-white/10 group overflow-hidden touch-none rounded-xl"
        >
          <div className="absolute top-0 inset-x-0 h-7 bg-black/90 backdrop-blur-sm flex items-center justify-between px-3 z-10 border-b border-white/5">
            <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary italic">🔴 Live Feed</span>
            <div className="flex space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=1&loop=1&playlist=jfKfPfyJRdk&modestbranding=1&rel=0"
            title="Bosomtwi Web Live"
            frameBorder="0"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ paddingTop: '28px' }}
          />
        </motion.div>
      </main>

      <Footer />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                      <Mail size={12} />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-news-text/20"
                      placeholder="admin@bosomtwi.web"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-text/40 flex items-center space-x-2">
                      <Lock size={12} />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      <AlertCircle size={14} />
                      <span>{authError}</span>
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
                    Security policy: Access is restricted to authorized personnel.
                  </p>

                  {/* <div className="mt-8 pt-8 border-t border-brand-secondary/10 text-center">
                       <p className="text-xs font-medium text-news-text/50">
                         Demo Credentials: <br/>
                         <span className="font-bold text-news-text">admin@bosomtwi.web / admin123</span>
                       </p>
                    </div> */}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
