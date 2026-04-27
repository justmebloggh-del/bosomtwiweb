import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Settings, Users, BarChart3, Plus, Search, 
  MoreVertical, Edit, Trash2, CheckCircle, Clock, AlertTriangle, 
  ExternalLink, TrendingUp, Eye, MessageSquare, Share2, LogOut, ChevronRight,
  Globe, Sparkles, Send, Loader2, Image as ImageIcon, Upload
} from 'lucide-react';
import { Article, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

// --- Mock Data ---
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

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Users State
  const [users, setUsers] = useState<User[]>([]);

  // Form State
  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Manhyia',
    image: '',
    videoUrl: '',
    excerpt: '',
    author: 'Admin User'
  });

  // Derived State: Filtered Articles
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
    loadUsers();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Also generate a preview if needed, but for now just set the file
    }
  };

  const uploadAsset = async (file: File) => {
    setUploading(true);
    try {
      if (SUPABASE_CONFIGURED) {
        const fileName = `article_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('article-images')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(data.path);
          
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
      setStatusMessage({ text: 'Title and Excerpt are required for global broadcast', type: 'error' });
      return;
    }

    try {
      setStatusMessage({ text: 'Establishing global connection...', type: 'success' });
      
      let imageUrl = newArticle.image;
      if (selectedFile) {
        try {
          const uploadedUrl = await uploadAsset(selectedFile);
          if (uploadedUrl) imageUrl = uploadedUrl;
        } catch (err) {
          setStatusMessage({ text: 'Media upload failed. Check cloud storage permissions.', type: 'error' });
          return;
        }
      }

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newArticle,
          image: imageUrl,
          publishedAt: new Date().toISOString(),
          status: 'published'
        })
      });
      if (res.ok) {
        setStatusMessage({ text: 'Success! Your story is now live for the world to see.', type: 'success' });
      }
      setTimeout(() => {
        loadArticles();
        setShowCreateModal(false);
        setNewArticle({ 
          title: '', 
          category: 'Manhyia', 
          image: '', 
          videoUrl: '', 
          excerpt: '', 
          author: 'Admin User' 
        });
        setSelectedFile(null);
      }, 1000);
    } catch (error: any) {
      console.error('Publish failed:', error);
      setStatusMessage({ text: error.message || 'Broadcast failed. Check world-wide connectivity.', type: 'error' });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      setArticles(articles.filter(a => a.id !== id));
      setStatusMessage({ text: 'Article removed from archive', type: 'success' });
    } catch (error) {
      console.error('Delete failed:', error);
      setStatusMessage({ text: 'Failed to delete article', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-news-text">
      {/* Sidebar */}
      <aside className="w-72 bg-black text-white flex flex-col shadow-2xl z-20 border-r border-white/5">
        <div className="p-8 border-b border-white/5">
           <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-ashanti-gold rounded-xl flex items-center justify-center font-black text-black text-xl italic">B</div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Bosomtwi</h1>
           </div>
           <p className="text-[10px] text-ashanti-gold uppercase tracking-[0.3em] font-black pl-0.5">Command Control v2.0</p>
        </div>

        <nav className="flex-grow px-4 pb-8 space-y-1 overflow-y-auto">
          <SidebarItem id="dashboard" label="Overview" icon={LayoutDashboard} active={activeTab} onClick={setActiveTab} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Newsroom (Sanity)</div>
          <SidebarItem id="articles" label="Article Manager" icon={FileText} active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="research" label="AI News Research" icon={Globe} active={activeTab} onClick={setActiveTab} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">App Backend (Supabase)</div>
          <SidebarItem id="users" label="User Registry" icon={Users} active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="analytics" label="Deep Analytics" icon={BarChart3} active={activeTab} onClick={setActiveTab} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Config</div>
          <SidebarItem id="settings" label="Global Settings" icon={Settings} active={activeTab} onClick={setActiveTab} />
        </nav>

        <div className="p-6 border-t border-white/5">
           <button 
             onClick={onLogout}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/5 transition-all group"
           >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-slate-50">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-brand-accent/30 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
           <div className="flex items-center space-x-4">
              <h2 className="text-xl font-black text-news-text capitalize tracking-tight flex items-center">
                 {activeTab.replace('-', ' ')}
                 {SANITY_CONFIGURED && activeTab === 'articles' && (
                    <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded flex items-center border border-green-200">
                       <CheckCircle size={10} className="mr-1" /> Sanity Linked
                    </span>
                 )}
              </h2>
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end">
                 <span className="text-sm font-black text-news-text">Admin User</span>
                 <span className="text-[10px] font-bold text-news-text/40">Super Administrator</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-ashanti-gold/10 border-2 border-ashanti-gold/20 p-1">
                 <div className="w-full h-full rounded-xl bg-ashanti-gold flex items-center justify-center font-black text-black">A</div>
              </div>
           </div>
        </header>

        <div className="flex-grow p-10 overflow-y-auto">
           {statusMessage.text && (
             <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className={`mb-8 p-4 rounded-2xl border flex items-center space-x-3 ${
                 statusMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
               }`}
             >
                {statusMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <p className="text-sm font-bold">{statusMessage.text}</p>
                <button onClick={() => setStatusMessage({ text: '', type: '' })} className="ml-auto text-xl">&times;</button>
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

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-secondary/80 backdrop-blur-lg">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
           >
              <div className="p-8 border-b border-brand-accent/50 flex justify-between items-center text-white bg-brand-secondary relative">
                 <div className="absolute top-0 right-0 w-32 h-full bg-brand-primary/10 skew-x-12 transform translate-x-16"></div>
                 <div className="z-10">
                    <h2 className="text-2xl font-serif font-black italic">Curate the Chronicle</h2>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Bosomtwi Web Publishing Engine</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">&times;</button>
              </div>
              
              <div className="p-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] uppercase tracking-widest font-black text-brand-secondary/40 flex items-center">
                          <FileText size={12} className="mr-2" /> Headline
                       </label>
                       <input 
                         type="text" 
                         value={newArticle.title}
                         onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                         className="w-full border-b-2 border-brand-accent py-3 font-serif text-2xl focus:outline-none focus:border-brand-primary transition-all placeholder:text-brand-accent" 
                         placeholder="The Golden Stool Speaks..." 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] uppercase tracking-widest font-black text-brand-secondary/40 flex items-center">
                          <LayoutDashboard size={12} className="mr-2" /> Category
                       </label>
                       <select 
                         value={newArticle.category}
                         onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                         className="w-full bg-[#F9FAFB] border border-brand-accent rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                       >
                          <option>Manhyia</option>
                          <option>International</option>
                          <option>Politics</option>
                          <option>Business</option>
                          <option>Sports</option>
                          <option>Technology</option>
                       </select>
                    </div>
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] uppercase tracking-widest font-black text-brand-secondary/40 flex items-center">
                          <ImageIcon size={12} className="mr-2" /> Cover Image Asset
                       </label>
                       <div className="relative group">
                          <input 
                            type="file" 
                            id="article-image"
                            className="hidden" 
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                          <label 
                            htmlFor="article-image"
                            className="w-full flex items-center justify-between border-b-2 border-brand-accent py-3 font-sans text-sm cursor-pointer group-hover:border-brand-primary transition-all overflow-hidden"
                          >
                             <span className="text-news-text font-bold truncate">
                                {selectedFile ? selectedFile.name : (newArticle.image || 'Select Image File...')}
                             </span>
                             <div className="flex items-center space-x-2 bg-ashanti-gold/10 px-3 py-1 rounded-lg text-ashanti-gold group-hover:bg-ashanti-gold group-hover:text-black transition-all">
                                <Upload size={14} />
                             </div>
                          </label>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] uppercase tracking-widest font-black text-brand-secondary/40 flex items-center">
                          <Globe size={12} className="mr-2" /> Video URL (YouTube)
                       </label>
                       <input 
                         type="text" 
                         value={newArticle.videoUrl}
                         onChange={(e) => setNewArticle({...newArticle, videoUrl: e.target.value})}
                         className="w-full border-b-2 border-brand-accent py-3 font-serif text-lg focus:outline-none focus:border-brand-primary transition-all placeholder:text-brand-accent font-sans" 
                         placeholder="https://youtube.com/watch?v=..." 
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-secondary/40 flex items-center">
                       <BarChart3 size={12} className="mr-2" /> Story Abstract (Excerpt)
                    </label>
                    <textarea 
                      rows={4} 
                      value={newArticle.excerpt}
                      onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                      className="w-full bg-[#F9FAFB] border border-brand-accent rounded-2xl p-6 text-sm italic font-serif leading-relaxed focus:outline-none focus:border-brand-primary transition-all" 
                      placeholder="Brief your audience on this unfolding narrative..."
                    />
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={handlePublish}
                      className="w-full bg-brand-primary text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-4"
                    >
                       {uploading && <Loader2 size={24} className="animate-spin mr-2" />}
                       <span>{uploading ? 'Curating Global Output...' : 'Publish To World'}</span>
                       {!uploading && <Share2 size={24} />}
                    </button>
                    <p className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-brand-secondary/20">Approved by the Editorial Board • Ashanti Region</p>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

// --- Sub Tab Components ---

function TabDashboard() {
  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_STATS.map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 group hover:shadow-xl hover:border-ashanti-gold/50 transition-all duration-500 relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} opacity-30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`}></div>
               <div className="relative z-10">
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                    <stat.icon size={26} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30 mb-2">{stat.label}</div>
                  <div className="flex items-end justify-between">
                     <div className="text-3xl font-black text-news-text">{stat.value}</div>
                     <div className="text-[10px] font-black text-green-600 mb-1 flex items-center px-2 py-1 bg-green-50 rounded-lg border border-green-100">
                        <TrendingUp size={12} className="mr-1" /> {stat.delta}
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-lg font-black text-news-text">Traffic Flow</h3>
                   <p className="text-xs text-news-text/40 font-bold">Weekly engagement pulse</p>
                </div>
                <select className="bg-slate-100 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-news-text/60 cursor-pointer">
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                </select>
             </div>
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                         <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} 
                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col">
             <h3 className="text-lg font-black text-news-text mb-2">Popular Categories</h3>
             <p className="text-xs text-news-text/40 font-bold mb-8">Article distribution</p>
             <div className="flex-grow flex items-center justify-center">
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={CATEGORY_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {CATEGORY_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mt-6">
                {CATEGORY_DATA.map((cat, i) => (
                   <div key={cat.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
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
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/50">
        <div className="relative flex-grow max-w-xl w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-news-text/30" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the archive..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-ashanti-gold transition-all"
          />
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-grow md:flex-none px-6 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-news-text/60 hover:bg-slate-200 transition-all appearance-none cursor-pointer outline-none border border-slate-200"
          >
            <option value="All">All Tiers</option>
            <option value="Manhyia">Manhyia</option>
            <option value="International">International</option>
            <option value="Politics">Politics</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="Tech">Technology</option>
          </select>
          <button 
            onClick={onCreate}
            className="flex-grow md:flex-none flex items-center justify-center space-x-2 bg-ashanti-gold text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-ashanti-gold/20 hover:scale-105 transition-all"
          >
            <Plus size={16} />
            <span>Curate Story</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
             <tr className="bg-slate-50">
               <th className="px-10 py-6 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Narrative</th>
               <th className="px-8 py-6 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Vertical</th>
               <th className="px-8 py-6 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Status</th>
               <th className="px-8 py-6 text-left text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Timestamp</th>
               <th className="px-10 py-6 text-right text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Management</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1,2,3,4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-10 py-8"><div className="h-12 bg-gray-50 rounded-2xl w-full"></div></td>
                </tr>
              ))
            ) : articles.map((article: any) => (
              <tr key={article.id} className="hover:bg-ashanti-gold/[0.04] transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 group-hover:border-ashanti-gold/30 transition-colors shadow-sm">
                      <img src={article.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-news-text truncate group-hover:text-ashanti-gold transition-colors cursor-pointer leading-tight mb-1">
                         {article.title}
                      </div>
                      <div className="flex items-center space-x-3">
                         <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-news-text/40">
                            {article.author?.charAt(0)}
                         </div>
                         <span className="text-[10px] font-bold text-news-text/40 uppercase tracking-widest leading-none">Record by {article.author}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <span className="px-4 py-2 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-news-text/50 group-hover:border-ashanti-gold/30 group-hover:text-ashanti-gold transition-all">
                    {article.category}
                  </span>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Distribution</span>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="text-[10px] font-black text-news-text/40 flex items-center uppercase tracking-widest">
                     <Clock size={12} className="mr-2" />
                     {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="w-10 h-10 border border-slate-200 rounded-xl text-news-text/40 hover:text-ashanti-gold hover:border-ashanti-gold hover:bg-ashanti-gold/5 flex items-center justify-center transition-all shadow-sm"><Edit size={16} /></button>
                     <button onClick={() => onDelete(article.id)} className="w-10 h-10 border border-slate-200 rounded-xl text-news-text/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {articles.length === 0 && !loading && (
        <div className="py-24 text-center">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FileText size={32} />
           </div>
           <h4 className="text-xl font-bold text-news-text/30">The archives are empty.</h4>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-news-text/20 mt-2">Begin your chronicle by curating a story.</p>
        </div>
      )}
    </div>
  );
}

function TabUsers({ users }: { users: User[] }) {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
       <div className="p-10 border-b border-slate-200">
          <h3 className="text-xl font-black text-news-text mb-2">User Registry</h3>
          <p className="text-xs text-news-text/40 font-bold">Manage administrative and editorial permissions</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10">
          {users.map(user => (
            <div key={user.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 hover:border-ashanti-gold/40 transition-all group relative overflow-hidden">
               <div className="absolute top-6 right-6">
                  <button className="text-news-text/20 hover:text-ashanti-gold transition-colors"><MoreVertical size={18} /></button>
               </div>
               <div className="flex items-center space-x-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center font-black text-2xl text-ashanti-gold shadow-lg shadow-black/20 group-hover:scale-110 transition-transform border border-ashanti-gold/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                     <div className="text-lg font-black text-news-text tracking-tight group-hover:text-ashanti-gold transition-colors">{user.name}</div>
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-news-text/30">{user.role}</div>
                  </div>
               </div>
               <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-news-text/40">
                     <span>Contact</span>
                     <span className="text-news-text/60 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-news-text/40">
                     <span>Privilege</span>
                     <span className="px-2 py-0.5 bg-ashanti-gold/10 text-ashanti-gold border border-ashanti-gold/20 rounded-md font-black">{user.role}</span>
                  </div>
               </div>
               <button className="w-full mt-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-ashanti-gold hover:border-black transition-all shadow-sm font-bold">
                  Update Ledger
               </button>
            </div>
          ))}
          <button className="aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4 text-news-text/30 hover:text-ashanti-gold hover:border-ashanti-gold hover:bg-ashanti-gold/[0.02] transition-all group">
             <div className="w-14 h-14 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform"><Plus size={24} /></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Induct Member</span>
          </button>
       </div>
    </div>
  );
}

function TabAnalytics() {
  return (
    <div className="space-y-10 pb-20">
       <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-12">
             <div>
                <h3 className="text-2xl font-black text-news-text">Historical Audience Growth</h3>
                <p className="text-[10px] text-news-text/40 font-black uppercase tracking-[0.3em] mt-2">Ashanti Region Focus Group</p>
             </div>
             <div className="flex space-x-3">
                <button className="px-6 py-3 bg-black text-ashanti-gold rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 border border-ashanti-gold/20">Real-time Stream</button>
                <button className="px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-news-text/60">Export Records</button>
             </div>
          </div>
          <div className="h-[400px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ANALYTICS_DATA}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: '20px' }}
                     labelStyle={{ fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '10px' }}
                   />
                   <Line type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={5} dot={{ r: 6, fill: "#D4AF37", strokeWidth: 3, stroke: "#fff" }} activeDot={{ r: 10 }} />
                   <Line type="monotone" dataKey="engagement" stroke="#000000" strokeWidth={5} dot={{ r: 6, fill: "#000000", strokeWidth: 3, stroke: "#fff" }} activeDot={{ r: 10 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100">
             <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Top Referral</div>
                <div className="text-xl font-black text-news-text">Twitter (X) <span className="text-green-500 ml-2 text-xs font-bold">+45%</span></div>
             </div>
             <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Avg. Session</div>
                <div className="text-xl font-black text-news-text">4m 32s <span className="text-green-500 ml-2 text-xs font-bold">+12%</span></div>
             </div>
             <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Bounce Rate</div>
                <div className="text-xl font-black text-news-text">24.5% <span className="text-red-500 ml-2 text-xs font-bold">-5%</span></div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
             <h3 className="text-xl font-black text-news-text mb-8">Performance By Category</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ANALYTICS_DATA.slice(0, 5)}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                      <Bar dataKey="posts" fill="#D4AF37" radius={[10, 10, 0, 0]} />
                      <Tooltip cursor={{fill: '#f9fafb'}} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-black p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-ashanti-gold/10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-ashanti-gold opacity-10 blur-3xl"></div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                   <BarChart3 className="text-ashanti-gold" size={28} />
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">Insight Generator</h3>
                <p className="text-white/60 text-sm mt-4 font-bold leading-relaxed italic">Our algorithmic engine suggests that publishing Manhyia related content on Tuesday mornings increases resident engagement by 34%.</p>
             </div>
             <button className="mt-12 w-full py-5 bg-ashanti-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-ashanti-gold/40 border border-black/10">Initialize Deep Scan</button>
          </div>
       </div>
    </div>
  );
}

function TabSettings() {
  return (
    <div className="max-w-4xl space-y-8 pb-20">
       <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-news-text mb-10 flex items-center">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                <Settings size={20} className="text-ashanti-gold" />
             </div>
             Application Foundation
          </h3>
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Publication Name</label>
                   <input type="text" defaultValue="Bosomtwi Web" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Command HQ Location</label>
                   <input type="text" defaultValue="Kumasi, Ashanti, GH" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Global Motto (Legacy)</label>
                <input type="text" defaultValue="The heartbeat of the Ashanti Region." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm focus:border-ashanti-gold outline-none" />
             </div>
          </div>
       </section>

       <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-news-text mb-10 flex items-center">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle size={20} className="text-ashanti-gold" />
             </div>
             External Systems Integration
          </h3>
          <div className="space-y-6">
             <a 
                href="http://localhost:3333" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200 group hover:border-ashanti-gold transition-all"
             >
                <div className="flex items-center space-x-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm font-black text-red-500 border border-slate-200 group-hover:scale-110 transition-transform">S</div>
                   <div>
                      <div className="text-lg font-black text-news-text">Sanity Studio <span className="text-[9px] font-black uppercase text-green-500 ml-2 px-2 py-0.5 bg-green-50 rounded border border-green-100">Connected</span></div>
                      <p className="text-xs text-news-text/40 font-bold">Content Pipeline</p>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-news-text/20 group-hover:text-ashanti-gold group-hover:border-ashanti-gold transition-all">
                  <ExternalLink size={18} />
                </div>
             </a>
             <div className={`flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200 group hover:border-ashanti-gold transition-all ${!SUPABASE_CONFIGURED && 'opacity-50 grayscale'}`}>
                <div className="flex items-center space-x-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm font-black text-blue-500 border border-slate-200 group-hover:scale-110 transition-transform">S</div>
                   <div>
                      <div className="text-lg font-black text-news-text">Supabase Backend <span className={`text-[9px] font-black uppercase ml-2 px-2 py-0.5 rounded border ${SUPABASE_CONFIGURED ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {SUPABASE_CONFIGURED ? 'Connected' : 'Awaiting Config'}
                      </span></div>
                      <p className="text-xs text-news-text/40 font-bold">App data & Authentication</p>
                   </div>
                </div>
                {SUPABASE_CONFIGURED ? (
                   <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-news-text/20 hover:text-ashanti-gold hover:border-ashanti-gold transition-all"><ExternalLink size={18} /></button>
                ) : (
                   <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-news-text/20 hover:text-ashanti-gold hover:border-ashanti-gold transition-all"><Plus size={18} /></button>
                )}
             </div>
          </div>
       </section>

       <div className="pt-6">
          <button className="w-full py-6 bg-news-text text-white font-black uppercase tracking-[0.4em] rounded-[2rem] hover:bg-ashanti-gold hover:text-black transition-all shadow-xl hover:-translate-y-1">
             Sync Global Parameters
          </button>
       </div>
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in environment');
      }
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const res = await ai.models.generateContent({
        model,
        contents: `Research this news topic for an article in the Ashanti Region: ${query}. Focus on local context, potential impact, and key figures. Use real-time data where available.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setResponse(res.text || 'No research data found.');
    } catch (error: any) {
      console.error('Research failed:', error);
      setResponse(`Command Research failed: ${error.message || 'Ensure API keys are configured.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
       <div className="bg-black p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-ashanti-gold/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-ashanti-gold opacity-5 blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
          <div className="relative z-10">
             <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
                   <Sparkles className="text-ashanti-gold" size={30} />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white leading-tight">AI Newsroom Intel</h3>
                   <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black mt-2">Grounding: Google Search Enabled</p>
                </div>
             </div>

             <div className="relative group">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What story are we investigating today? (e.g. 'Gold mining impact in Obuasi')"
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 text-white font-bold text-xl focus:outline-none focus:border-ashanti-gold/50 transition-all placeholder:text-white/10 min-h-[200px]"
                />
                <button 
                  onClick={performResearch}
                  disabled={loading}
                  className="absolute bottom-10 right-10 bg-ashanti-gold text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-ashanti-gold/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 disabled:opacity-50 disabled:grayscale"
                >
                   {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                   <span>{loading ? 'Analyzing...' : 'Command Research'}</span>
                </button>
             </div>
          </div>
       </div>

       {response && (
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm"
         >
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
               <div className="flex items-center space-x-3">
                  <Globe className="text-ashanti-gold" size={20} />
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-news-text/30">Research Intelligence Report</h4>
               </div>
               <button onClick={() => setResponse(null)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline transition-all">Clear Briefing</button>
            </div>
            <div className="prose prose-slate max-w-none">
               <div className="text-news-text font-medium text-lg leading-relaxed whitespace-pre-wrap">
                  {response}
               </div>
            </div>
            <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-between">
               <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Intelligence grounded by Google Search</p>
               <button className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold hover:underline">Download Dossier</button>
            </div>
         </motion.div>
       )}
    </div>
  );
}

// --- Sidebar Helper ---
function SidebarItem({ id, label, icon: Icon, active, onClick }: { id: string, label: string, icon: any, active: string, onClick: (id: string) => void }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group relative ${
        isActive 
        ? 'bg-ashanti-gold text-black font-black shadow-lg shadow-ashanti-gold/10' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} className={`${isActive ? 'text-black' : 'group-hover:scale-110 transition-transform'}`} />
      <span className="text-[13px] font-bold tracking-tight">{label}</span>
      {isActive && (
         <motion.div layoutId="active-pill" className="absolute right-4 w-1.5 h-1.5 bg-black rounded-full" />
      )}
    </button>
  );
}

