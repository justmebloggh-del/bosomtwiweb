import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, FileText, Settings, Users, BarChart3, Plus, Search,
  Trash2, CheckCircle, Clock, AlertTriangle,
  ExternalLink, TrendingUp, Eye, MessageSquare, Share2, LogOut,
  Globe, Sparkles, Send, Loader2, Image as ImageIcon, Upload, Menu, X, Link
} from 'lucide-react';
import { Article, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const ALL_CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 'Entertainment', 'Health', 'Local', 'International'];

const MOCK_STATS = [
  { label: 'Live Articles', value: '1,280', delta: '+12%', icon: FileText, color: 'text-ashanti-gold', bg: 'bg-gray-100' },
  { label: 'Total Views', value: '45.2k', delta: '+25%', icon: Eye, color: 'text-ashanti-gold', bg: 'bg-gray-100' },
  { label: 'Communitarians', value: '4,890', delta: '+8%', icon: Users, color: 'text-ashanti-gold', bg: 'bg-gray-100' },
  { label: 'Engagements', value: '12.4k', delta: '+15%', icon: MessageSquare, color: 'text-ashanti-gold', bg: 'bg-gray-100' },
];

const ANALYTICS_DATA = [
  { name: 'Mon', views: 4000, posts: 24, engagement: 2400 },
  { name: 'Tue', views: 3000, posts: 13, engagement: 2210 },
  { name: 'Wed', views: 2000, posts: 98, engagement: 2290 },
  { name: 'Thu', views: 2780, posts: 39, engagement: 2000 },
  { name: 'Fri', views: 1890, posts: 48, engagement: 2181 },
  { name: 'Sat', views: 2390, posts: 38, engagement: 2500 },
  { name: 'Sun', views: 3490, posts: 43, engagement: 2100 },
];

const CATEGORY_DATA = [
  { name: 'Politics', value: 400 },
  { name: 'Business', value: 300 },
  { name: 'Sports', value: 300 },
  { name: 'Tech', value: 200 },
];

const COLORS = ['#D4AF37', '#111111', '#080808', '#F27D26'];

function getTabsForRole(role: string) {
  if (role === 'admin') {
    return ['dashboard', 'articles', 'research', 'users', 'analytics', 'settings'];
  }
  if (role === 'editor') {
    return ['articles', 'research', 'analytics'];
  }
  return ['articles', 'research'];
}

export default function AdminDashboard({ onLogout, user }: { onLogout: () => void; user: User }) {
  const allowedTabs = getTabsForRole(user?.role || 'journalist');
  const [activeTab, setActiveTab] = useState(allowedTabs[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [users, setUsers] = useState<User[]>([]);

  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Manhyia',
    image: '',
    videoUrl: '',
    excerpt: '',
    content: '',
    author: user?.name || 'Staff Reporter',
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, categoryFilter]);

  useEffect(() => {
    loadArticles();
    if (user?.role === 'admin') loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      if (SUPABASE_CONFIGURED) {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        setUsers(data as User[] || []);
      } else {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      if (SUPABASE_CONFIGURED) {
        const fileName = `article_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('article-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
        return publicUrl;
      }
      return null;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!newArticle.title || !newArticle.excerpt) {
      setStatusMessage({ text: 'Headline and excerpt are required.', type: 'error' });
      return;
    }

    const token = localStorage.getItem('bosomtwi_token');

    try {
      setStatusMessage({ text: 'Publishing…', type: 'success' });

      let imageUrl = newArticle.image;
      if (imageMode === 'upload' && selectedFile) {
        try {
          const uploaded = await uploadAsset(selectedFile);
          if (uploaded) imageUrl = uploaded;
        } catch {
          setStatusMessage({ text: 'Image upload failed. Use a URL instead or check storage permissions.', type: 'error' });
          return;
        }
      }

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...newArticle,
          image: imageUrl,
          publishedAt: new Date().toISOString(),
          status: 'published',
        }),
      });

      if (res.ok) {
        setStatusMessage({ text: 'Story is now live!', type: 'success' });
        setTimeout(() => {
          loadArticles();
          setShowCreateModal(false);
          setNewArticle({ title: '', category: 'Manhyia', image: '', videoUrl: '', excerpt: '', content: '', author: user?.name || 'Staff Reporter' });
          setSelectedFile(null);
          setStatusMessage({ text: '', type: '' });
        }, 1200);
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Publish failed');
      }
    } catch (error: any) {
      setStatusMessage({ text: error.message || 'Publish failed. Check connectivity.', type: 'error' });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return;
    const token = localStorage.getItem('bosomtwi_token');
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setArticles(articles.filter(a => a.id !== id));
      setStatusMessage({ text: 'Article deleted.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Failed to delete article.', type: 'error' });
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'articles', label: 'Article Manager', icon: FileText },
    { id: 'research', label: 'AI News Research', icon: Globe },
    { id: 'users', label: 'User Registry', icon: Users },
    { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ].filter(n => allowedTabs.includes(n.id));

  const SidebarContent = () => (
    <>
      <div className="p-6 md:p-8 border-b border-white/5">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-ashanti-gold rounded-xl flex items-center justify-center font-black text-black text-xl italic">B</div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Bosomtwi</h1>
        </div>
        <p className="text-[10px] text-ashanti-gold uppercase tracking-[0.3em] font-black pl-0.5">Newsroom Portal</p>
      </div>

      <nav className="flex-grow px-4 pb-8 pt-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            active={activeTab}
            onClick={(id) => { setActiveTab(id); setSidebarOpen(false); }}
          />
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-xl bg-ashanti-gold flex items-center justify-center font-black text-black text-sm">{initial}</div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-white/30 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/5 transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FA] overflow-hidden font-sans text-news-text">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 bg-black text-white flex-col shadow-2xl z-20 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-30"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 bg-black text-white flex flex-col shadow-2xl z-40"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-brand-accent/30 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-news-text"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-base md:text-xl font-black text-news-text capitalize tracking-tight">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-news-text">{user?.name}</span>
              <span className="text-[10px] font-bold text-news-text/40 capitalize">{user?.role}</span>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-ashanti-gold flex items-center justify-center font-black text-black">
              {initial}
            </div>
          </div>
        </header>

        <div className="flex-grow p-4 md:p-8 overflow-y-auto">
          {statusMessage.text && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center space-x-3 ${
                statusMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
              }`}
            >
              {statusMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              <p className="text-sm font-bold flex-grow">{statusMessage.text}</p>
              <button onClick={() => setStatusMessage({ text: '', type: '' })} className="text-xl leading-none">&times;</button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <TabDashboard />}
              {activeTab === 'articles' && (
                <TabArticles
                  articles={filteredArticles}
                  loading={loading}
                  onCreate={() => setShowCreateModal(true)}
                  onDelete={deleteArticle}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />
              )}
              {activeTab === 'research' && <TabResearch />}
              {activeTab === 'users' && <TabUsers users={users} />}
              {activeTab === 'analytics' && <TabAnalytics />}
              {activeTab === 'settings' && <TabSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Publish Article Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 20 }}
              className="bg-white w-full md:max-w-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden my-0 md:my-6"
            >
              <div className="p-6 md:p-8 border-b border-slate-200 flex justify-between items-center bg-black text-white">
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic">Publish New Story</h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Bosomtwi Web · {user?.name}</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Headline + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40 flex items-center">
                      <FileText size={12} className="mr-2" /> Headline *
                    </label>
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                      className="w-full border-b-2 border-slate-200 py-3 font-bold text-lg focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                      placeholder="Enter article headline…"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40 flex items-center">
                      <LayoutDashboard size={12} className="mr-2" /> Category
                    </label>
                    <select
                      value={newArticle.category}
                      onChange={e => setNewArticle({ ...newArticle, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-ashanti-gold appearance-none cursor-pointer"
                    >
                      {ALL_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                {/* Author + Video URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40">Author</label>
                    <input
                      type="text"
                      value={newArticle.author}
                      onChange={e => setNewArticle({ ...newArticle, author: e.target.value })}
                      className="w-full border-b-2 border-slate-200 py-3 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40 flex items-center">
                      <Globe size={12} className="mr-2" /> Video URL (YouTube)
                    </label>
                    <input
                      type="text"
                      value={newArticle.videoUrl}
                      onChange={e => setNewArticle({ ...newArticle, videoUrl: e.target.value })}
                      className="w-full border-b-2 border-slate-200 py-3 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                      placeholder="https://youtube.com/watch?v=…"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40 flex items-center">
                      <ImageIcon size={12} className="mr-2" /> Cover Image
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                      <button
                        onClick={() => setImageMode('url')}
                        className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${imageMode === 'url' ? 'bg-ashanti-gold text-black' : 'text-news-text/40 hover:bg-slate-100'}`}
                      >
                        <Link size={11} /> URL
                      </button>
                      <button
                        onClick={() => setImageMode('upload')}
                        className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${imageMode === 'upload' ? 'bg-ashanti-gold text-black' : 'text-news-text/40 hover:bg-slate-100'}`}
                      >
                        <Upload size={11} /> Upload
                      </button>
                    </div>
                  </div>
                  {imageMode === 'url' ? (
                    <input
                      type="url"
                      value={newArticle.image}
                      onChange={e => setNewArticle({ ...newArticle, image: e.target.value })}
                      className="w-full border-b-2 border-slate-200 py-3 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                      placeholder="https://example.com/image.jpg"
                    />
                  ) : (
                    <div className="relative">
                      <input type="file" id="article-img" className="hidden" onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} accept="image/*" />
                      <label htmlFor="article-img" className="flex items-center justify-between border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-ashanti-gold transition-colors">
                        <span className="text-sm font-bold text-news-text/40 truncate">{selectedFile ? selectedFile.name : 'Choose image file…'}</span>
                        <Upload size={16} className="text-news-text/30 shrink-0 ml-3" />
                      </label>
                      {!SUPABASE_CONFIGURED && (
                        <p className="text-[10px] text-amber-600 font-bold mt-1">Supabase not configured — use URL mode instead.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40">Excerpt / Summary *</label>
                  <textarea
                    rows={3}
                    value={newArticle.excerpt}
                    onChange={e => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300"
                    placeholder="Brief summary shown in article cards…"
                  />
                </div>

                {/* Full Content */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-news-text/40">Full Article Body</label>
                  <textarea
                    rows={10}
                    value={newArticle.content}
                    onChange={e => setNewArticle({ ...newArticle, content: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300"
                    placeholder="Write the full article here. Use double line breaks to separate paragraphs…"
                  />
                </div>

                <button
                  onClick={handlePublish}
                  disabled={uploading}
                  className="w-full bg-ashanti-gold text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {uploading && <Loader2 size={20} className="animate-spin" />}
                  <span>{uploading ? 'Uploading…' : 'Publish Story'}</span>
                  {!uploading && <Share2 size={20} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub Tab Components ---

function TabDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {MOCK_STATS.map(stat => (
          <div key={stat.label} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 group hover:shadow-xl hover:border-ashanti-gold/50 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} opacity-30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700`} />
            <div className="relative z-10">
              <div className={`${stat.bg} ${stat.color} w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-sm`}>
                <stat.icon size={22} />
              </div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30 mb-2">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl md:text-3xl font-black text-news-text">{stat.value}</div>
                <div className="text-[9px] font-black text-green-600 mb-1 flex items-center px-2 py-1 bg-green-50 rounded-lg border border-green-100">
                  <TrendingUp size={10} className="mr-1" /> {stat.delta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-news-text">Traffic Flow</h3>
              <p className="text-xs text-news-text/40 font-bold">Weekly engagement pulse</p>
            </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-black text-news-text mb-2">Popular Categories</h3>
          <p className="text-xs text-news-text/40 font-bold mb-6">Article distribution</p>
          <div className="flex-grow flex items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {CATEGORY_DATA.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={cat.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-black uppercase text-news-text/60">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabArticles({ articles, loading, onCreate, onDelete, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter }: any) {
  return (
    <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 md:p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-grow max-w-full sm:max-w-xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-news-text/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:border-ashanti-gold transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="flex-grow sm:flex-none px-4 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-news-text/60 hover:bg-slate-200 transition-all appearance-none cursor-pointer outline-none border border-slate-200"
          >
            <option value="All">All</option>
            {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button
            onClick={onCreate}
            className="flex items-center justify-center space-x-2 bg-ashanti-gold text-black px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-ashanti-gold/20 hover:scale-105 transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Story</span>
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : articles.map((article: any) => (
          <div key={article.id} className="p-4 flex items-start gap-4">
            <img src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100" alt="" />
            <div className="flex-grow min-w-0">
              <p className="font-bold text-sm text-news-text leading-tight line-clamp-2 mb-1">{article.title}</p>
              <p className="text-[10px] font-bold text-ashanti-gold uppercase tracking-widest">{article.category}</p>
              <p className="text-[10px] text-news-text/40 mt-0.5">{new Date(article.publishedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => onDelete(article.id)} className="p-2 text-news-text/20 hover:text-red-500 transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Story</th>
              <th className="px-6 py-5 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Category</th>
              <th className="px-6 py-5 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Status</th>
              <th className="px-6 py-5 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Date</th>
              <th className="px-8 py-5 text-right text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                </tr>
              ))
            ) : articles.map((article: any) => (
              <tr key={article.id} className="hover:bg-ashanti-gold/[0.04] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 group-hover:border-ashanti-gold/30 transition-colors">
                      <img src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-news-text truncate group-hover:text-ashanti-gold transition-colors">{article.title}</div>
                      <div className="text-[10px] font-bold text-news-text/40 uppercase tracking-widest mt-0.5">{article.author}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-3 py-1.5 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-news-text/50">{article.category}</span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="text-[10px] font-black text-news-text/40 flex items-center uppercase tracking-widest">
                    <Clock size={11} className="mr-1.5" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDelete(article.id)} className="w-9 h-9 border border-slate-200 rounded-xl text-news-text/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {articles.length === 0 && !loading && (
        <div className="py-20 text-center">
          <FileText size={36} className="mx-auto mb-4 text-slate-200" />
          <h4 className="text-lg font-bold text-news-text/30">No articles yet.</h4>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-news-text/20 mt-2">Publish your first story above.</p>
        </div>
      )}
    </div>
  );
}

function TabUsers({ users }: { users: User[] }) {
  return (
    <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-10 border-b border-slate-200">
        <h3 className="text-xl font-black text-news-text mb-1">User Registry</h3>
        <p className="text-xs text-news-text/40 font-bold">Manage editorial permissions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-10">
        {users.map(user => (
          <div key={user.id} className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-200 hover:border-ashanti-gold/40 transition-all group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center font-black text-2xl text-ashanti-gold shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="font-black text-news-text group-hover:text-ashanti-gold transition-colors">{user.name}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-news-text/30 capitalize">{user.role}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-news-text/40">
                <span>Email</span>
                <span className="text-news-text/60 truncate max-w-[130px]">{user.email}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-news-text/40">
                <span>Role</span>
                <span className="px-2 py-0.5 bg-ashanti-gold/10 text-ashanti-gold border border-ashanti-gold/20 rounded-md capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        ))}
        <button className="min-h-[160px] rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3 text-news-text/30 hover:text-ashanti-gold hover:border-ashanti-gold transition-all group">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform"><Plus size={22} /></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add Member</span>
        </button>
      </div>
    </div>
  );
}

function TabAnalytics() {
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-news-text">Audience Growth</h3>
            <p className="text-[10px] text-news-text/40 font-black uppercase tracking-[0.3em] mt-1">Ashanti Region Focus Group</p>
          </div>
        </div>
        <div className="h-64 md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ANALYTICS_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={4} dot={{ r: 5, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="engagement" stroke="#000" strokeWidth={4} dot={{ r: 5, fill: '#000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
          <div><div className="text-[10px] font-black uppercase tracking-widest text-news-text/30 mb-1">Top Referral</div><div className="text-xl font-black text-news-text">Twitter (X) <span className="text-green-500 ml-2 text-xs font-bold">+45%</span></div></div>
          <div><div className="text-[10px] font-black uppercase tracking-widest text-news-text/30 mb-1">Avg. Session</div><div className="text-xl font-black text-news-text">4m 32s <span className="text-green-500 ml-2 text-xs font-bold">+12%</span></div></div>
          <div><div className="text-[10px] font-black uppercase tracking-widest text-news-text/30 mb-1">Bounce Rate</div><div className="text-xl font-black text-news-text">24.5% <span className="text-red-500 ml-2 text-xs font-bold">-5%</span></div></div>
        </div>
      </div>
    </div>
  );
}

function TabSettings() {
  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-news-text mb-8 flex items-center">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mr-3"><Settings size={18} className="text-ashanti-gold" /></div>
          Application Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Publication Name</label>
            <input type="text" defaultValue="Bosomtwi Web" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">HQ Location</label>
            <input type="text" defaultValue="Kumasi, Ashanti, GH" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Tagline</label>
          <input type="text" defaultValue="The heartbeat of the Ashanti Region." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
        </div>
      </section>

      <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-news-text mb-8 flex items-center">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mr-3"><CheckCircle size={18} className="text-ashanti-gold" /></div>
          Integrations
        </h3>
        <div className={`flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-ashanti-gold transition-all group ${!SUPABASE_CONFIGURED ? 'opacity-60' : ''}`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-blue-500 border border-slate-200">S</div>
            <div>
              <div className="font-black text-news-text text-sm">Supabase
                <span className={`text-[9px] font-black uppercase ml-2 px-2 py-0.5 rounded border ${SUPABASE_CONFIGURED ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                  {SUPABASE_CONFIGURED ? 'Connected' : 'Awaiting Config'}
                </span>
              </div>
              <p className="text-xs text-news-text/40 font-bold">App data & storage</p>
            </div>
          </div>
          <ExternalLink size={18} className="text-news-text/20 group-hover:text-ashanti-gold transition-colors" />
        </div>
      </section>

      <button className="w-full py-5 bg-news-text text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-ashanti-gold hover:text-black transition-all shadow-lg">
        Save Settings
      </button>
    </div>
  );
}

function TabResearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const performResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Research this news topic for an article in the Ashanti Region, Ghana: ${query}. Focus on local context, potential impact, and key figures.`,
      });
      setResponse(res.text || 'No research data returned.');
    } catch (error: any) {
      setResponse(`Research failed: ${error.message || 'Check API key configuration.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div className="bg-black p-8 md:p-12 rounded-2xl md:rounded-[3.5rem] shadow-2xl border border-ashanti-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-ashanti-gold opacity-5 blur-[80px] -mr-24 -mt-24 animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-ashanti-gold" size={26} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">AI News Research</h3>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black mt-1">Powered by Gemini AI</p>
            </div>
          </div>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What story are you investigating? (e.g. 'Gold mining impact in Obuasi')"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold text-base md:text-lg focus:outline-none focus:border-ashanti-gold/50 transition-all placeholder:text-white/20 min-h-[140px] md:min-h-[180px] resize-none"
          />
          <button
            onClick={performResearch}
            disabled={loading}
            className="mt-4 w-full md:w-auto bg-ashanti-gold text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-ashanti-gold/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{loading ? 'Researching…' : 'Start Research'}</span>
          </button>
        </div>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <Globe className="text-ashanti-gold" size={18} />
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-news-text/40">Research Report</h4>
            </div>
            <button onClick={() => setResponse(null)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Clear</button>
          </div>
          <div className="text-news-text font-medium text-base leading-relaxed whitespace-pre-wrap">{response}</div>
        </motion.div>
      )}
    </div>
  );
}

function SidebarItem({ id, label, icon: Icon, active, onClick }: { id: string; label: string; icon: any; active: string; onClick: (id: string) => void }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group relative ${
        isActive ? 'bg-ashanti-gold text-black font-black shadow-lg shadow-ashanti-gold/10' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={19} className={isActive ? 'text-black' : 'group-hover:scale-110 transition-transform'} />
      <span className="text-[13px] font-bold tracking-tight">{label}</span>
      {isActive && <motion.div layoutId="active-pill" className="absolute right-4 w-1.5 h-1.5 bg-black rounded-full" />}
    </button>
  );
}
