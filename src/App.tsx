import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PublishModal from './components/PublishModal';
import { Article, User } from './types';
import { supabase, dbToArticle } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ChevronRight, AlertCircle, Search, X, PenSquare, ChevronUp } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ── Lazy page imports (code-split per route) ─────────────────────
const Home          = lazy(() => import('./pages/Home'));
const ArticleView   = lazy(() => import('./pages/ArticleView'));
const CategoryPage  = lazy(() => import('./pages/CategoryPage'));
const TrendingPage  = lazy(() => import('./pages/TrendingPage'));
const VideosPage    = lazy(() => import('./pages/VideosPage'));
const LivePage      = lazy(() => import('./pages/LivePage'));
const ArchivesPage  = lazy(() => import('./pages/ArchivesPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Advertise     = lazy(() => import('./pages/Advertise'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login         = lazy(() => import('./pages/Login'));
const ContactPage   = lazy(() => import('./pages/ContactPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const SubmitStoryPage = lazy(() => import('./pages/SubmitStoryPage'));
const AboutPage     = lazy(() => import('./pages/AboutPage'));
const CareersPage   = lazy(() => import('./pages/CareersPage'));
const PodcastsPage  = lazy(() => import('./pages/PodcastsPage'));
const EditorialsPage = lazy(() => import('./pages/EditorialsPage'));
const FactCheckPage = lazy(() => import('./pages/FactCheckPage'));
const BusinessDirectoryPage = lazy(() => import('./pages/BusinessDirectoryPage'));

type Page = 'home' | 'article' | 'category' | 'privacy' | 'terms' | 'advertise' | 'trending' | 'videos' | 'live' | 'archives' | 'admin' | 'login' | 'community' | 'contact' | 'submit' | 'about' | 'careers' | 'podcasts' | 'editorials' | 'factcheck' | 'directory';

// ── Page title map ───────────────────────────────────────────────
const PAGE_TITLES: Partial<Record<Page, string>> = {
  home:      'Bosomtwi Web | Ashanti Region\'s Premier News Portal',
  trending:  'Trending Now | Bosomtwi Web',
  videos:    'Videos | Bosomtwi Web',
  live:      'Live TV | Bosomtwi Web',
  archives:  'Archives | Bosomtwi Web',
  privacy:   'Privacy Policy | Bosomtwi Web',
  terms:     'Terms of Service | Bosomtwi Web',
  advertise: 'Advertise With Us | Bosomtwi Web',
  admin:     'Newsroom | Bosomtwi Web',
  login:     'Login | Bosomtwi Web',
  community: 'Community Hub | Bosomtwi Web',
  contact:   'Contact Us | Bosomtwi Web',
  submit:    'Submit a Story | Bosomtwi Web',
  about:     'About Us | Bosomtwi Web',
  careers:   'Careers | Bosomtwi Web',
  podcasts:  'Podcasts | Bosomtwi Web',
  editorials: 'Editorials & Opinion | Bosomtwi Web',
  factcheck: 'Fact Check | Bosomtwi Web',
  directory: 'Business Directory | Bosomtwi Web',
};

// ── Spinner for Suspense fallback ────────────────────────────────
function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-news-muted">Loading…</p>
      </div>
    </div>
  );
}


// ── Back-to-top button ───────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 left-4 md:bottom-10 md:left-8 z-[90] w-12 h-12 bg-news-card border border-news-border text-news-muted rounded-full shadow-xl flex items-center justify-center hover:bg-ashanti-gold hover:text-black hover:border-ashanti-gold transition-all"
          aria-label="Back to top">
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ── Dynamic page title ───────────────────────────────────────
  useEffect(() => {
    if (currentPage === 'article') return; // ArticleView manages its own title
    if (currentPage === 'category') {
      document.title = `${activeCategory} News | Bosomtwi Web`;
    } else {
      document.title = PAGE_TITLES[currentPage] ?? 'Bosomtwi Web';
    }
  }, [currentPage, activeCategory]);

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
    if (!sessionStorage.getItem('bw_visited')) {
      sessionStorage.setItem('bw_visited', '1');
      supabase.rpc('increment_site_visits').then(() => {}, () => {});
    }
  }, []);

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

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      if (user?.role === 'journalist' || user?.role === 'admin') {
        setCurrentPage('admin');
      }
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
    const knownPages: Page[] = ['home','article','category','privacy','terms','advertise','trending','videos','live','archives','admin','login','community','contact','submit','about','careers','podcasts','editorials','factcheck','directory'];
    if (knownPages.includes(page as Page)) {
      setCurrentPage(page as Page);
    } else {
      setCurrentPage('home');
    }
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
    <div className="min-h-screen flex flex-col font-sans bg-news-bg text-news-text overflow-x-hidden">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setCurrentPage('login')}
        onCategoryClick={handleCategorySelect}
        onNavigate={handleNavigate}
        onSearchOpen={() => setShowSearch(true)}
        onAdminClick={() => setCurrentPage('admin')}
      />

      <main className="flex-grow bg-news-bg relative">
        <Suspense fallback={<PageSpinner />}>
          <AnimatePresence mode="wait">
            {currentPage === 'login' && (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Login onLoginSuccess={(loggedInUser) => { setUser(loggedInUser); setCurrentPage('admin'); }} />
              </motion.div>
            )}
            {currentPage === 'admin' && user && (user.role === 'journalist' || user.role === 'admin') && (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <AdminDashboard user={user} />
              </motion.div>
            )}
            {currentPage === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Home onArticleClick={navigateToArticle} articles={articles} onCategoryClick={handleCategorySelect} onNavigate={handleNavigate} loading={isLoadingArticles} />
              </motion.div>
            )}
            {currentPage === 'category' && (
              <motion.div key={`cat-${activeCategory}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <CategoryPage category={activeCategory} onArticleClick={navigateToArticle} articles={articles} onHomeClick={() => handleCategorySelect('')} loading={isLoadingArticles} user={user} onArticlePublished={loadArticles} />
              </motion.div>
            )}
            {currentPage === 'article' && selectedArticle && (
              <motion.div key="article" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ArticleView article={selectedArticle} onBack={() => { setCurrentPage('home'); setSelectedArticle(null); }} relatedArticles={articles.filter(a => a.id !== selectedArticle.id)} onArticleClick={navigateToArticle} user={user} onArticleUpdated={loadArticles} />
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
            {currentPage === 'community' && (
              <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <CommunityPage onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentPage === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ContactPage onBack={() => handleNavigate('home')} />
              </motion.div>
            )}
            {currentPage === 'submit' && (
              <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <SubmitStoryPage onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentPage === 'about' && (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <AboutPage onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentPage === 'careers' && (
              <motion.div key="careers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <CareersPage />
              </motion.div>
            )}
            {currentPage === 'podcasts' && (
              <motion.div key="podcasts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <PodcastsPage />
              </motion.div>
            )}
            {currentPage === 'editorials' && (
              <motion.div key="editorials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <EditorialsPage articles={articles} onArticleClick={navigateToArticle} loading={isLoadingArticles} />
              </motion.div>
            )}
            {currentPage === 'factcheck' && (
              <motion.div key="factcheck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <FactCheckPage />
              </motion.div>
            )}
            {currentPage === 'directory' && (
              <motion.div key="directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <BusinessDirectoryPage />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>

        {/* Floating publish button */}
        <AnimatePresence>
          {user && currentPage !== 'live' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowPublish(true)}
              className="fixed bottom-24 right-4 md:bottom-10 md:right-8 z-[90] w-14 h-14 bg-ashanti-gold text-black rounded-full shadow-2xl shadow-ashanti-gold/30 flex items-center justify-center border-2 border-ashanti-gold hover:bg-black hover:text-ashanti-gold transition-colors"
              title="Publish new story">
              <PenSquare size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        <BackToTop />
      </main>

      <Footer onNavigate={handleNavigate} onCategoryClick={handleCategorySelect} />

      {/* ── Global Search overlay ──────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 z-[200] flex flex-col px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-news-card shadow-2xl w-full max-w-2xl mx-auto mt-24 rounded-2xl overflow-hidden border border-news-border">
              <div className="flex items-center border-b border-news-border px-5 py-4">
                <Search size={18} className="text-ashanti-gold shrink-0 mr-4" />
                <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search news, categories, authors…"
                  className="flex-grow text-base font-sans text-news-text bg-transparent focus:outline-none placeholder:text-news-muted" />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="ml-4 p-1.5 text-news-muted hover:text-news-text rounded-full hover:bg-brand-surface transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {searchQuery.trim().length > 1 ? (
                  searchResults.length > 0 ? (
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-news-muted px-3 py-2">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map(article => (
                        <button key={article.id} onClick={() => { navigateToArticle(article); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full text-left flex items-start gap-4 p-3 hover:bg-brand-surface rounded-xl transition-colors group">
                          <img src={article.image} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-ashanti-gold block mb-0.5">{article.category}</span>
                            <span className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-snug line-clamp-2 block text-sm">{article.title}</span>
                            <span className="text-[10px] text-news-muted mt-0.5 block">{article.author}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-6">
                      <p className="text-news-muted font-heading italic text-xl">No results for "{searchQuery}"</p>
                    </div>
                  )
                ) : (
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-news-muted mb-4">Browse Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle'].map(cat => (
                        <button key={cat} onClick={() => { handleCategorySelect(cat); setShowSearch(false); setSearchQuery(''); }}
                          className="px-4 py-2 rounded-full bg-brand-surface text-[10px] font-bold uppercase tracking-wider text-news-muted hover:bg-ashanti-gold hover:text-black transition-all border border-news-border">
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

      {/* ── Publish modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showPublish && user && (
          <PublishModal user={user} defaultCategory={publishDefaultCategory}
            onClose={() => setShowPublish(false)}
            onPublished={() => { loadArticles(); setShowPublish(false); }} />
        )}
      </AnimatePresence>

      {/* ── Login modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-news-card rounded-3xl shadow-2xl border border-news-border overflow-hidden">
              <div className="p-10">
                <div className="mb-8 text-center">
                  <div className="font-heading text-3xl font-black mb-1 tracking-tighter text-news-text">BOSOMTWI <span className="text-ashanti-gold">WEB</span></div>
                  <p className="text-news-muted text-[10px] font-black uppercase tracking-[0.3em]">Journalist Access</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-muted flex items-center gap-2 mb-2"><Mail size={11} />Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full border-b-2 border-news-border bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted"
                      placeholder="you@bosomtwi.web" required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-news-muted flex items-center gap-2 mb-2"><Lock size={11} />Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full border-b-2 border-news-border bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted"
                      placeholder="••••••••" required />
                  </div>
                  {authError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                      <AlertCircle size={13} /><span>{authError}</span>
                    </motion.div>
                  )}
                  <button type="submit" disabled={isAuthenticating}
                    className="w-full bg-ashanti-gold hover:bg-news-text text-black hover:text-ashanti-gold py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group mt-4">
                    <span>{isAuthenticating ? 'Signing in…' : 'Sign In'}</span>
                    {!isAuthenticating && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
