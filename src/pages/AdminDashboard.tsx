import { useState, useEffect, useRef } from 'react';
import PublishModal from '../components/PublishModal';
import { supabase } from '../lib/supabase';
import { User, Article } from '../types';
import {
  Eye, FileText, TrendingUp, Calendar, Edit2, Trash2, Info, Globe, Users2,
  MessageSquare, CheckCircle, XCircle, Zap, Loader2, AlertTriangle, Upload, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const TABS = ['Articles', 'Analytics', 'Authors', 'Comments', 'Breaking News', 'TV', 'Podcasts', 'Advertise', 'Settings'] as const;
type Tab = (typeof TABS)[number];

const ALL_CATEGORIES = [
  'All', 'Manhyia', 'News', 'Politics', 'Business', 'Education',
  'Sports', 'Entertainment', 'Lifestyle', 'Technology',
  'International', 'Health', 'Local', 'Editorials', 'Editorials & Opinion',
];

interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  avgViewsPerArticle: number;
  topArticleTitle: string;
  topArticleViews: number;
  categoryBreakdown: Record<string, { articles: number; views: number }>;
  topArticles: any[];
  dailyStats: Record<string, { views: number; articles: number; visits: number }>;
  weeklyViews: number;
  weeklyArticles: number;
  monthlyViews: number;
  monthlyArticles: number;
  totalVisits: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  visitChartData: { date: string; visits: number }[];
}

function resizeImageToBase64(file: File, maxPx = 200): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
    img.src = url;
  });
}

export default function AdminDashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>('Articles');
  const [articles, setArticles] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Articles tab
  const [showPublish, setShowPublish] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [articleCatFilter, setArticleCatFilter] = useState('All');

  // Settings — author management
  const [editingAuthor, setEditingAuthor] = useState<any | null>(null);
  const [editAuthorForm, setEditAuthorForm] = useState({ name: '', role: '' });
  const [deletingAuthorId, setDeletingAuthorId] = useState<string | null>(null);
  const [authorStatus, setAuthorStatus] = useState('');
  const [addAuthorForm, setAddAuthorForm] = useState({ name: '', email: '', role: 'journalist' });
  const [addAuthorSaving, setAddAuthorSaving] = useState(false);

  // Ads — edit in-place
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [editAdForm, setEditAdForm] = useState({ brand: '', tagline: '', cta_text: '', cta_url: '', logo: '', accent_color: '', placement: '', package_tier: '' });
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

  // Settings — general
  const [siteTitle, setSiteTitle] = useState('Bosomtwi Web');
  const [settingsStatus, setSettingsStatus] = useState('');

  // TV tab
  const [liveTvUrl, setLiveTvUrl] = useState('');
  const [bosomtwiTvUrl, setBosomtwiTvUrl] = useState('');
  const [tvStatus, setTvStatus] = useState('');
  const [tvSaving, setTvSaving] = useState(false);

  // Comments tab
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Breaking News tab
  const [breakingText, setBreakingText] = useState('');
  const [breakingActive, setBreakingActive] = useState(false);
  const [breakingLoading, setBreakingLoading] = useState(false);
  const [breakingStatus, setBreakingStatus] = useState('');

  // Podcasts tab
  const [podcastForm, setPodcastForm] = useState({ title: '', description: '', episode: '', category: 'General' });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [podcastUploading, setPodcastUploading] = useState(false);
  const [podcastStatus, setPodcastStatus] = useState('');

  // Advertise tab
  const [adEnquiries, setAdEnquiries] = useState<any[]>([]);
  const [adLoading, setAdLoading] = useState(false);
  const [liveAds, setLiveAds] = useState<any[]>([]);
  const [newAdForm, setNewAdForm] = useState({ brand: '', tagline: '', cta_text: 'Learn More', cta_url: '', logo: '📢', accent_color: '#E09E2B', placement: 'leaderboard', package_tier: 'Bronze' });
  const [adSubmitting, setAdSubmitting] = useState(false);
  const [adFormStatus, setAdFormStatus] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [adPackages, setAdPackages] = useState([
    { name: 'Bronze',           price: 'GH₵500',   period: '/month',   popular: false },
    { name: 'Silver',           price: 'GH₵1,500', period: '/month',   popular: false },
    { name: 'Gold',             price: 'GH₵3,500', period: '/month',   popular: true  },
    { name: 'Sponsored Content',price: 'GH₵800',   period: '/article', popular: false },
  ]);

  useEffect(() => {
    fetchArticles();
    fetchAuthors();
    fetchAnalytics();
    fetchComments();
    fetchBreakingNews();
    fetchAdEnquiries();
    fetchLiveAds();
    fetchTvUrls();
  }, []);

  async function fetchTvUrls() {
    const { data } = await supabase.from('site_config').select('key,value').in('key', ['live_tv_url', 'bosomtwi_tv_url']);
    if (data) {
      data.forEach(row => {
        if (row.key === 'live_tv_url') setLiveTvUrl(row.value);
        if (row.key === 'bosomtwi_tv_url') setBosomtwiTvUrl(row.value);
      });
    }
  }

  async function saveTvUrls(live: string, bosomtwi: string) {
    setTvSaving(true); setTvStatus('');
    const rows = [
      { key: 'live_tv_url',     value: live.trim()     || 'https://www.youtube.com/embed/ArF_tiH8A5s' },
      { key: 'bosomtwi_tv_url', value: bosomtwi.trim() || 'https://www.youtube.com/embed/ArF_tiH8A5s' },
    ];
    const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' });
    setTvSaving(false);
    if (error) { setTvStatus('Error: ' + error.message); }
    else { setTvStatus('✓ TV URLs updated — live for all visitors!'); setTimeout(() => setTvStatus(''), 4000); }
  }

  async function fetchAdEnquiries() {
    setAdLoading(true);
    const { data } = await supabase
      .from('ad_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    setAdEnquiries(data || []);
    setAdLoading(false);
  }

  async function fetchLiveAds() {
    const { data } = await supabase.from('live_ads').select('*').order('created_at', { ascending: false });
    setLiveAds(data || []);
  }

  async function toggleAdActive(id: string, active: boolean) {
    await supabase.from('live_ads').update({ active }).eq('id', id);
    setLiveAds(prev => prev.map(a => a.id === id ? { ...a, active } : a));
  }

  async function deleteAd(id: string) {
    await supabase.from('live_ads').delete().eq('id', id);
    setLiveAds(prev => prev.filter(a => a.id !== id));
  }

  async function updateAdStatus(id: string, status: string) {
    await supabase.from('ad_enquiries').update({ status }).eq('id', id);
    setAdEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }

  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    setArticles(data || []);
  }

  async function fetchAuthors() {
    const { data } = await supabase.from('users').select('*').order('name');
    setAuthors(data || []);
  }

  async function fetchAnalytics() {
    const [{ data }, { data: visitRows }] = await Promise.all([
      supabase.from('articles').select('*'),
      // No limit — fetch all rows so totalVisits is truly all-time
      supabase.from('site_visits').select('*').order('visit_date', { ascending: false }),
    ]);
    if (!data) { setAnalytics(null); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 30);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayKey = today.toISOString().split('T')[0];

    // Daily slots for last 7 days
    const dailyStats: Record<string, { views: number; articles: number; visits: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      dailyStats[d.toISOString().split('T')[0]] = { views: 0, articles: 0, visits: 0 };
    }

    // Merge article data into daily slots
    const categoryBreakdown: Record<string, { articles: number; views: number }> = {};
    data.forEach((a: any) => {
      const pubKey = new Date(a.published_at).toISOString().split('T')[0];
      if (dailyStats[pubKey]) {
        dailyStats[pubKey].views += a.views || 0;
        dailyStats[pubKey].articles += 1;
      }
      const cat = a.category || 'Unknown';
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { articles: 0, views: 0 };
      categoryBreakdown[cat].articles += 1;
      categoryBreakdown[cat].views += a.views || 0;
    });

    const visits = (visitRows || []) as { visit_date: string; visit_count: number }[];

    // Merge visit data into daily slots
    visits.forEach(v => {
      if (dailyStats[v.visit_date]) dailyStats[v.visit_date].visits = Number(v.visit_count);
    });

    // Aggregate totals across ALL rows (not capped at 30)
    const totalVisits = visits.reduce((s, v) => s + Number(v.visit_count), 0);
    const todayVisits = visits.find(v => v.visit_date === todayKey)?.visit_count ?? 0;
    const weeklyVisits = visits
      .filter(v => new Date(v.visit_date + 'T12:00:00') >= sevenDaysAgo)
      .reduce((s, v) => s + Number(v.visit_count), 0);
    const monthlyVisits = visits
      .filter(v => new Date(v.visit_date + 'T12:00:00') >= firstOfMonth)
      .reduce((s, v) => s + Number(v.visit_count), 0);

    // 30-day chart data (oldest → newest for left-to-right display)
    const visitChartData = visits
      .slice(0, 30)
      .reverse()
      .map(v => ({
        date: new Date(v.visit_date + 'T12:00:00').toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short',
        }),
        visits: Number(v.visit_count),
      }));

    const totalViews = data.reduce((s: number, a: any) => s + (a.views || 0), 0);
    const sorted = [...data].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    const topArticle = sorted[0];
    const weekly = data.filter((a: any) => new Date(a.published_at) >= sevenDaysAgo);
    const monthly = data.filter((a: any) => new Date(a.published_at) >= thirtyDaysAgo);

    setAnalytics({
      totalViews,
      totalArticles: data.length,
      avgViewsPerArticle: data.length > 0 ? Math.round(totalViews / data.length) : 0,
      topArticleTitle: topArticle?.title || '—',
      topArticleViews: topArticle?.views || 0,
      categoryBreakdown,
      topArticles: sorted.slice(0, 5),
      dailyStats,
      weeklyViews: weekly.reduce((s: number, a: any) => s + (a.views || 0), 0),
      weeklyArticles: weekly.length,
      monthlyViews: monthly.reduce((s: number, a: any) => s + (a.views || 0), 0),
      monthlyArticles: monthly.length,
      totalVisits,
      todayVisits: Number(todayVisits),
      weeklyVisits,
      monthlyVisits,
      visitChartData,
    });
  }

  async function fetchComments() {
    setCommentsLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    setComments(data || []);
    setCommentsLoading(false);
  }

  function fetchBreakingNews() {
    try {
      const saved = localStorage.getItem('bw_breaking');
      if (saved) {
        const { text, active } = JSON.parse(saved);
        setBreakingText(text || '');
        setBreakingActive(active ?? false);
      }
    } catch { /* */ }
  }

  async function handleCommentAction(id: string, action: 'approve' | 'reject') {
    await supabase.from('comments').update({ status: action === 'approve' ? 'approved' : 'rejected' }).eq('id', id);
    fetchComments();
  }

  async function handleDeleteComment(id: string) {
    await supabase.from('comments').delete().eq('id', id);
    fetchComments();
  }

  function handleSaveBreakingNews(e: { preventDefault(): void }) {
    e.preventDefault();
    setBreakingLoading(true);
    setBreakingStatus('');
    try {
      localStorage.setItem('bw_breaking', JSON.stringify({ text: breakingText.trim(), active: breakingActive }));
      setBreakingStatus('✓ Breaking news updated!');
    } catch {
      setBreakingStatus('Failed to save.');
    }
    setBreakingLoading(false);
    setTimeout(() => setBreakingStatus(''), 3000);
  }

  function handleClearBreakingNews() {
    setBreakingText('');
    setBreakingActive(false);
    localStorage.removeItem('bw_breaking');
    setBreakingStatus('Breaking news cleared.');
    setTimeout(() => setBreakingStatus(''), 3000);
  }

  async function handleDeleteArticle(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (!error) { setDeletingArticleId(null); fetchArticles(); fetchAnalytics(); }
  }

  async function handleSaveAuthor() {
    if (!editingAuthor) return;
    const { error } = await supabase
      .from('users')
      .update({ name: editAuthorForm.name, role: editAuthorForm.role })
      .eq('id', editingAuthor.id);
    if (error) {
      setAuthorStatus('Failed to update author.');
    } else {
      setAuthorStatus('Author updated.');
      setEditingAuthor(null);
      fetchAuthors();
      setTimeout(() => setAuthorStatus(''), 3000);
    }
  }

  async function handleDeleteAuthor(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      setAuthorStatus('Failed to remove author.');
    } else {
      setAuthorStatus('Author removed.');
      setDeletingAuthorId(null);
      fetchAuthors();
      setTimeout(() => setAuthorStatus(''), 3000);
    }
  }

  async function handleAddAuthor() {
    if (!addAuthorForm.name.trim() || !addAuthorForm.email.trim()) return;
    setAddAuthorSaving(true);
    const { error } = await supabase.from('users').insert({
      id:    crypto.randomUUID(),
      name:  addAuthorForm.name.trim(),
      email: addAuthorForm.email.trim().toLowerCase(),
      role:  addAuthorForm.role,
    });
    setAddAuthorSaving(false);
    if (error) {
      setAuthorStatus('Failed to add: ' + error.message);
    } else {
      setAuthorStatus('✓ Author added. They must sign in once to activate their account.');
      setAddAuthorForm({ name: '', email: '', role: 'journalist' });
      fetchAuthors();
      setTimeout(() => setAuthorStatus(''), 6000);
    }
  }

  async function saveEditAd() {
    if (!editingAd) return;
    const { error } = await supabase.from('live_ads').update({
      brand:        editAdForm.brand.trim(),
      tagline:      editAdForm.tagline.trim(),
      cta_text:     editAdForm.cta_text.trim() || 'Learn More',
      cta_url:      editAdForm.cta_url.trim() || '#',
      logo:         editAdForm.logo.trim() || '📢',
      accent_color: editAdForm.accent_color,
      placement:    editAdForm.placement,
      package_tier: editAdForm.package_tier,
    }).eq('id', editingAd.id);
    if (!error) { setEditingAd(null); fetchLiveAds(); }
  }

  // Article count per author name (for Authors tab)
  const articleCountByAuthor = articles.reduce((acc: Record<string, number>, a: any) => {
    acc[a.author] = (acc[a.author] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-brand-surface text-news-text">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="bg-ashanti-green sticky top-0 z-10">
        <div className="kente-stripe" />
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-black leading-tight text-white tracking-tight">
                Newsroom <span className="text-ashanti-gold">Dashboard</span>
              </h1>
              <p className="text-xs text-white/50 mt-0.5 uppercase tracking-widest font-bold">{user.name} · {user.role}</p>
            </div>
            <nav className="flex gap-1 flex-wrap">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                    tab === t
                      ? 'bg-ashanti-gold text-black shadow-lg shadow-ashanti-gold/20'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* ── Articles ───────────────────────────────────────── */}
        {tab === 'Articles' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                All Articles{' '}
                <span className="text-news-muted font-normal text-sm">({articles.length})</span>
              </h2>
              <button
                className="bg-ashanti-gold text-black px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow"
                onClick={() => { setEditArticle(null); setShowPublish(true); }}
              >
                + New Article
              </button>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-1.5 flex-wrap mb-5">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setArticleCatFilter(cat)}
                  className={`text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full transition-all ${
                    articleCatFilter === cat
                      ? 'bg-ashanti-gold text-black shadow'
                      : 'bg-brand-surface text-news-muted border border-news-border hover:border-ashanti-gold hover:text-ashanti-gold'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-news-card rounded-2xl overflow-hidden shadow-sm border border-news-border">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-brand-surface border-b border-news-border">
                      {['Title', 'Category', 'Author', 'Views', 'Published', 'Actions'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs uppercase tracking-widest text-news-muted font-bold ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {articles.filter(a => articleCatFilter === 'All' || a.category === articleCatFilter).map(article => (
                      <tr key={article.id} className="border-b border-news-border hover:bg-brand-surface transition-colors">
                        <td className="px-4 py-3 font-semibold max-w-[240px] truncate">{article.title}</td>
                        <td className="px-4 py-3">
                          <span className="bg-ashanti-gold/10 text-ashanti-gold text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-news-muted text-xs">{article.author}</td>
                        <td className="px-4 py-3 font-mono text-sm">{article.views ?? 0}</td>
                        <td className="px-4 py-3 text-news-muted text-xs">
                          {new Date(article.published_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {deletingArticleId === article.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-red-400 font-bold">Delete?</span>
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-red-600"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingArticleId(null)}
                                className="text-xs bg-brand-surface text-news-muted px-2 py-1 rounded-lg font-bold hover:bg-news-border transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                className="text-xs text-ashanti-gold font-bold hover:underline"
                                onClick={() => { setEditArticle(article as Article); setShowPublish(true); }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-xs text-red-400 font-bold hover:text-red-500"
                                onClick={() => setDeletingArticleId(article.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-news-muted text-sm">
                          No articles yet. Publish your first story.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics ──────────────────────────────────────── */}
        {tab === 'Analytics' && (
          <div className="space-y-6">
            {!analytics ? (
              <div className="text-center py-16 text-news-muted text-sm">Loading analytics…</div>
            ) : (
              <>
                {/* Content stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye },
                    { label: 'Total Articles', value: analytics.totalArticles, icon: FileText },
                    { label: 'Avg Views / Article', value: analytics.avgViewsPerArticle, icon: TrendingUp },
                    { label: 'This Month', value: `${analytics.monthlyArticles} articles`, icon: Calendar },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-news-card rounded-2xl p-5 shadow-sm border border-news-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-news-muted font-bold">{label}</span>
                        <Icon size={13} className="text-ashanti-gold" />
                      </div>
                      <div className="text-2xl font-black text-news-text">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Site visit cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Visitors', value: analytics.totalVisits.toLocaleString(), icon: Globe, sub: 'all time' },
                    { label: "Today's Visitors", value: analytics.todayVisits.toLocaleString(), icon: Users2, sub: 'today' },
                    { label: 'This Week', value: analytics.weeklyVisits.toLocaleString(), icon: TrendingUp, sub: 'last 7 days' },
                    { label: 'This Month', value: analytics.monthlyVisits.toLocaleString(), icon: Calendar, sub: 'current month' },
                  ].map(({ label, value, icon: Icon, sub }) => (
                    <div key={label} className="bg-ashanti-gold/5 border border-ashanti-gold/20 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-news-muted font-bold">{label}</span>
                        <Icon size={13} className="text-ashanti-gold" />
                      </div>
                      <div className="text-2xl font-black text-news-text">{value}</div>
                      <div className="text-[11px] text-news-muted mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Visitor trend chart */}
                {analytics.visitChartData.length > 0 && (
                  <div className="bg-news-card rounded-2xl p-6 shadow-sm border border-news-border">
                    <h3 className="text-xs font-black uppercase tracking-widest text-news-muted mb-5">
                      Visitor Trend — Last 30 Days
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analytics.visitChartData} barSize={10} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14301C" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: '#7DA88A' }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#7DA88A' }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #14301C', background: '#0A1A0D', color: '#EDF5EF' }}
                          cursor={{ fill: 'rgba(224,158,43,0.08)' }}
                          formatter={(v: number) => [v.toLocaleString(), 'Visitors']}
                        />
                        <Bar dataKey="visits" fill="#E09E2B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Category breakdown */}
                <div className="bg-news-card rounded-2xl p-6 shadow-sm border border-news-border">
                  <h3 className="text-xs font-black uppercase tracking-widest text-news-muted mb-5">
                    Category Breakdown
                  </h3>
                  <div className="space-y-3">
                    {(Object.entries(analytics.categoryBreakdown) as Array<[string, { articles: number; views: number }]>)
                      .sort(([, a], [, b]) => b.articles - a.articles)
                      .map(([cat, stats]) => {
                        const max = Math.max(
                          ...(Object.values(analytics.categoryBreakdown) as Array<{ articles: number; views: number }>).map(s => s.articles),
                          1
                        );
                        const pct = (stats.articles / max) * 100;
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <div className="w-28 text-xs font-bold text-news-muted truncate shrink-0">{cat}</div>
                            <div className="flex-1 bg-news-border rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-ashanti-gold rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-news-muted w-24 text-right shrink-0">
                              {stats.articles} art · {stats.views} views
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Top articles + period summaries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 5 articles */}
                  <div className="bg-news-card rounded-2xl p-6 shadow-sm border border-news-border">
                    <h3 className="text-xs font-black uppercase tracking-widest text-news-muted mb-5">Top Articles</h3>
                    <div className="space-y-4">
                      {analytics.topArticles.map((a: any, i: number) => (
                        <div key={a.id} className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              i === 0 ? 'bg-ashanti-gold text-black' : 'bg-brand-surface text-news-muted'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{a.title}</div>
                            <div className="text-[11px] text-news-muted">{a.category}</div>
                          </div>
                          <span className="text-sm font-black text-ashanti-gold shrink-0">
                            {(a.views || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {analytics.topArticles.length === 0 && (
                        <p className="text-sm text-news-muted text-center py-4">No articles yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Weekly + Monthly */}
                  <div className="space-y-4">
                    {[
                      { label: 'Last 7 Days', views: analytics.weeklyViews, count: analytics.weeklyArticles },
                      { label: 'Last 30 Days', views: analytics.monthlyViews, count: analytics.monthlyArticles },
                    ].map(({ label, views, count }) => (
                      <div key={label} className="bg-news-card rounded-2xl p-6 shadow-sm border border-news-border">
                        <h3 className="text-xs font-black uppercase tracking-widest text-news-muted mb-4">{label}</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { stat: views.toLocaleString(), sub: 'Views' },
                            { stat: count, sub: 'Articles' },
                            { stat: count > 0 ? Math.round(views / count) : 0, sub: 'Avg Views' },
                          ].map(({ stat, sub }) => (
                            <div key={sub}>
                              <div className="text-xl font-black text-ashanti-gold">{stat}</div>
                              <div className="text-[11px] text-news-muted mt-0.5">{sub}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily breakdown table */}
                <div className="bg-news-card rounded-2xl p-6 shadow-sm border border-news-border">
                  <h3 className="text-xs font-black uppercase tracking-widest text-news-muted mb-4">
                    Daily Breakdown — Last 7 Days
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-news-border">
                          {['Date', 'Articles Published', 'Views', 'Site Visits', 'Avg Views'].map(h => (
                            <th key={h} className="py-2 pr-6 text-left text-[11px] uppercase tracking-widest text-news-muted font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(Object.entries(analytics.dailyStats) as Array<[string, { views: number; articles: number; visits: number }]>).map(([date, stat]) => (
                          <tr key={date} className="border-b border-news-border hover:bg-brand-surface transition-colors">
                            <td className="py-2.5 pr-6 font-semibold text-sm">
                              {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
                                weekday: 'short', day: 'numeric', month: 'short',
                              })}
                            </td>
                            <td className="py-2.5 pr-6">{stat.articles}</td>
                            <td className="py-2.5 pr-6 font-bold text-ashanti-gold">{stat.views}</td>
                            <td className="py-2.5 pr-6 font-bold text-ashanti-gold/70">{stat.visits}</td>
                            <td className="py-2.5 text-news-muted">
                              {stat.articles > 0 ? Math.round(stat.views / stat.articles) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Authors ────────────────────────────────────────── */}
        {tab === 'Authors' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                Authors{' '}
                <span className="text-news-muted font-normal text-sm">({authors.length})</span>
              </h2>
              <span className="text-xs text-news-muted bg-news-card border border-news-border px-3 py-1.5 rounded-xl">
                Manage authors in Settings
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {authors.map(author => (
                <div key={author.id} className="bg-news-card rounded-2xl p-5 border border-news-border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-ashanti-gold/15 flex items-center justify-center text-sm font-black text-ashanti-gold shrink-0">
                      {(author.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{author.name}</div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          author.role === 'admin'
                            ? 'bg-ashanti-green text-white'
                            : 'bg-brand-surface text-news-muted'
                        }`}
                      >
                        {author.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-news-muted truncate">{author.email}</div>
                  <div className="mt-3 pt-3 border-t border-news-border flex items-center justify-between">
                    <span className="text-xs text-news-muted">Articles published</span>
                    <span className="text-sm font-black text-ashanti-gold">
                      {articleCountByAuthor[author.name] || 0}
                    </span>
                  </div>
                </div>
              ))}
              {authors.length === 0 && (
                <div className="col-span-full text-center py-12 text-news-muted text-sm bg-news-card rounded-2xl border border-news-border">
                  No authors found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Comments ───────────────────────────────────────── */}
        {tab === 'Comments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                Comments{' '}
                <span className="text-news-muted font-normal text-sm">({comments.length})</span>
              </h2>
              <button onClick={fetchComments} className="text-xs text-news-muted hover:text-ashanti-gold transition-colors font-bold uppercase tracking-widest">
                Refresh
              </button>
            </div>
            {commentsLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-news-muted">
                <Loader2 size={18} className="animate-spin text-ashanti-gold" />
                <span className="text-sm">Loading comments…</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16 bg-news-card rounded-2xl border border-news-border">
                <MessageSquare size={32} className="text-news-border mx-auto mb-3" />
                <p className="text-news-muted text-sm">No comments to moderate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c: any) => {
                  const isApproved = c.status === 'approved';
                  const isRejected = c.status === 'rejected';
                  return (
                    <div key={c.id} className={`bg-news-card rounded-2xl border shadow-sm overflow-hidden ${isRejected ? 'border-red-900/40 opacity-60' : isApproved ? 'border-green-900/40' : 'border-news-border'}`}>
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-sm">{c.author_name || 'Anonymous'}</span>
                              {c.author_email && <span className="text-xs text-news-muted">{c.author_email}</span>}
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                isApproved ? 'bg-green-900/30 text-green-400' :
                                isRejected ? 'bg-red-900/30 text-red-400' :
                                'bg-ashanti-gold/10 text-ashanti-gold'
                              }`}>
                                {c.status || 'Pending'}
                              </span>
                            </div>
                            {c.article_title && (
                              <p className="text-[10px] text-news-muted mb-2">On: <span className="font-semibold text-news-text">{c.article_title}</span></p>
                            )}
                            <p className="text-sm text-news-text leading-relaxed">{c.body || c.content || c.comment}</p>
                            <p className="text-[10px] text-news-muted mt-2">
                              {c.created_at ? new Date(c.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isApproved && (
                              <button onClick={() => handleCommentAction(c.id, 'approve')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-900/20 text-green-400 rounded-xl text-[11px] font-bold hover:bg-green-900/40 transition-colors border border-green-900/40">
                                <CheckCircle size={12} /> Approve
                              </button>
                            )}
                            {!isRejected && (
                              <button onClick={() => handleCommentAction(c.id, 'reject')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-ashanti-gold/10 text-ashanti-gold rounded-xl text-[11px] font-bold hover:bg-ashanti-gold/20 transition-colors border border-ashanti-gold/20">
                                <AlertTriangle size={12} /> Reject
                              </button>
                            )}
                            <button onClick={() => handleDeleteComment(c.id)}
                              className="p-1.5 rounded-xl hover:bg-red-900/20 text-news-muted hover:text-red-400 transition-colors border border-transparent hover:border-red-900/30">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Breaking News ───────────────────────────────────── */}
        {tab === 'Breaking News' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold">Breaking News Ticker</h2>
              {breakingActive && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  <Zap size={9} /> Live
                </span>
              )}
            </div>

            <div className="bg-news-card rounded-2xl border border-news-border shadow-sm p-6 mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-news-muted mb-4">Current Status</p>
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${breakingActive && breakingText ? 'bg-red-900/20 border-red-900/40' : 'bg-brand-surface border-news-border'}`}>
                <Zap size={16} className={breakingActive && breakingText ? 'text-red-400 shrink-0 mt-0.5' : 'text-news-muted shrink-0 mt-0.5'} />
                <div>
                  <p className="text-xs font-bold text-news-muted mb-1">{breakingActive && breakingText ? 'LIVE — Showing to all readers' : 'Inactive — Not showing'}</p>
                  <p className="text-sm text-news-text">{breakingText || <span className="text-news-muted italic">No breaking news set</span>}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBreakingNews} className="bg-news-card rounded-2xl border border-news-border shadow-sm p-6 space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-news-muted font-bold block mb-1.5">Breaking News Text</label>
                <textarea
                  value={breakingText}
                  onChange={e => setBreakingText(e.target.value)}
                  rows={3}
                  placeholder="Enter breaking news headline…"
                  className="w-full border border-news-border rounded-xl px-4 py-3 text-sm font-semibold bg-brand-surface text-news-text placeholder:text-news-muted focus:outline-none focus:border-ashanti-gold transition-colors resize-none"
                />
                <p className="text-[10px] text-news-muted mt-1">{breakingText.length} characters</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setBreakingActive(a => !a)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${breakingActive ? 'bg-red-500' : 'bg-news-border'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${breakingActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-bold text-news-text">{breakingActive ? 'Active — Showing to readers' : 'Inactive'}</span>
              </div>
              {breakingStatus && (
                <p className={`text-xs font-bold ${breakingStatus.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                  {breakingStatus}
                </p>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={breakingLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-ashanti-gold text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                  {breakingLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                  {breakingLoading ? 'Saving…' : 'Save & Publish'}
                </button>
                <button type="button" onClick={handleClearBreakingNews}
                  className="flex items-center gap-2 px-5 py-2 bg-brand-surface text-news-muted font-black text-xs uppercase tracking-widest rounded-xl hover:bg-news-border transition-colors border border-news-border">
                  <XCircle size={13} /> Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TV ─────────────────────────────────────────────── */}
        {tab === 'TV' && (
          <div className="max-w-2xl space-y-8">
            <div className="bg-news-card rounded-2xl border border-news-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-news-border flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-black">TV</span>
                </div>
                <div>
                  <h2 className="font-bold text-base">TV Stream URLs</h2>
                  <p className="text-xs text-news-muted mt-0.5">Paste any YouTube link. Changes go live for all visitors instantly.</p>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={e => { e.preventDefault(); saveTvUrls(liveTvUrl, bosomtwiTvUrl); }} className="space-y-6">

                  {/* Live TV */}
                  <div className="bg-brand-surface rounded-xl p-5 border border-news-border space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                      <h3 className="text-sm font-black text-news-text">Live TV Page</h3>
                    </div>
                    <p className="text-[10px] text-news-muted">Shown on the full-screen <strong>/live</strong> page player.</p>
                    <input
                      type="text"
                      value={liveTvUrl}
                      onChange={e => setLiveTvUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…"
                      className="w-full border border-news-border rounded-xl px-4 py-3 text-sm font-medium bg-white text-news-text focus:outline-none focus:border-ashanti-gold transition-colors"
                    />
                    {liveTvUrl && (
                      <p className="text-[10px] text-green-600 font-bold">✓ URL set</p>
                    )}
                  </div>

                  {/* Bosomtwi TV */}
                  <div className="bg-brand-surface rounded-xl p-5 border border-news-border space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-ashanti-green text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Bosomtwi TV</span>
                      <h3 className="text-sm font-black text-news-text">Homepage Embed</h3>
                    </div>
                    <p className="text-[10px] text-news-muted">Shown in the <strong>BOSOMTWIWEB TV</strong> block on the homepage.</p>
                    <input
                      type="text"
                      value={bosomtwiTvUrl}
                      onChange={e => setBosomtwiTvUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…"
                      className="w-full border border-news-border rounded-xl px-4 py-3 text-sm font-medium bg-white text-news-text focus:outline-none focus:border-ashanti-gold transition-colors"
                    />
                    {bosomtwiTvUrl && (
                      <p className="text-[10px] text-green-600 font-bold">✓ URL set</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={tvSaving}
                      className="bg-ashanti-gold text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                      {tvSaving && <Loader2 size={13} className="animate-spin" />}
                      {tvSaving ? 'Saving…' : 'Save & Publish'}
                    </button>
                    {tvStatus && <p className={`text-xs font-bold ${tvStatus.startsWith('✓') ? 'text-green-500' : 'text-red-400'}`}>{tvStatus}</p>}
                  </div>
                  <p className="text-[10px] text-news-muted">Accepts YouTube watch URLs, short URLs (youtu.be), or embed URLs.</p>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Podcasts ───────────────────────────────────────── */}
        {tab === 'Podcasts' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Upload Podcast</h2>
              {podcastStatus && (
                <p className={`text-xs font-bold uppercase tracking-widest ${podcastStatus.startsWith('✓') ? 'text-green-500' : 'text-red-400'}`}>
                  {podcastStatus}
                </p>
              )}
            </div>

            <form className="bg-news-card border border-news-border rounded-2xl p-6 space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!podcastForm.title.trim()) return;
                setPodcastUploading(true);
                setPodcastStatus('');
                try {
                  const uploads: { type: string; path: string }[] = [];
                  for (const [key, file] of [['audio', audioFile], ['video', videoFile]] as [string, File | null][]) {
                    if (!file) continue;
                    const ext = file.name.split('.').pop();
                    const path = `podcasts/${Date.now()}-${key}.${ext}`;
                    const { error } = await supabase.storage.from('podcasts').upload(path, file, { upsert: true });
                    if (error) throw new Error(`${key} upload failed: ${error.message}`);
                    uploads.push({ type: key, path });
                  }
                  await supabase.from('podcasts').insert({
                    title:       podcastForm.title.trim(),
                    description: podcastForm.description.trim() || null,
                    episode:     podcastForm.episode.trim() || null,
                    category:    podcastForm.category,
                    audio_path:  uploads.find(u => u.type === 'audio')?.path ?? null,
                    video_path:  uploads.find(u => u.type === 'video')?.path ?? null,
                    author:      user.name,
                    created_at:  new Date().toISOString(),
                  });
                  setPodcastStatus('✓ Podcast uploaded successfully');
                  setPodcastForm({ title: '', description: '', episode: '', category: 'General' });
                  setAudioFile(null);
                  setVideoFile(null);
                } catch (err: any) {
                  setPodcastStatus(err.message || 'Upload failed');
                } finally {
                  setPodcastUploading(false);
                }
              }}>

              {/* Title + Episode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Episode Title *</label>
                  <input type="text" required value={podcastForm.title}
                    onChange={e => setPodcastForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. The Future of Bosomtwe District"
                    className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Episode #</label>
                  <input type="text" value={podcastForm.episode}
                    onChange={e => setPodcastForm(f => ({ ...f, episode: e.target.value }))}
                    placeholder="e.g. EP. 12"
                    className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Category</label>
                <select value={podcastForm.category}
                  onChange={e => setPodcastForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors">
                  {['General', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Health', 'Education', 'Community'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Description</label>
                <textarea rows={3} value={podcastForm.description}
                  onChange={e => setPodcastForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief summary of this episode…"
                  className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors resize-none" />
              </div>

              {/* Audio upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Audio File (MP3 / WAV)</label>
                <label className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${audioFile ? 'border-ashanti-gold bg-ashanti-gold/5' : 'border-news-border hover:border-ashanti-gold hover:bg-ashanti-gold/5'}`}>
                  <Loader2 size={16} className={`shrink-0 ${audioFile ? 'text-ashanti-gold' : 'text-news-muted'}`} />
                  <span className={`text-sm font-medium truncate ${audioFile ? 'text-ashanti-gold' : 'text-news-muted'}`}>
                    {audioFile ? audioFile.name : 'Click to select audio file'}
                  </span>
                  <input type="file" accept="audio/*" className="hidden"
                    onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              {/* Video upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Video File (MP4) — Optional</label>
                <label className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${videoFile ? 'border-ashanti-gold bg-ashanti-gold/5' : 'border-news-border hover:border-ashanti-gold hover:bg-ashanti-gold/5'}`}>
                  <Loader2 size={16} className={`shrink-0 ${videoFile ? 'text-ashanti-gold' : 'text-news-muted'}`} />
                  <span className={`text-sm font-medium truncate ${videoFile ? 'text-ashanti-gold' : 'text-news-muted'}`}>
                    {videoFile ? videoFile.name : 'Click to select video file'}
                  </span>
                  <input type="file" accept="video/*" className="hidden"
                    onChange={e => setVideoFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <button type="submit" disabled={podcastUploading}
                className="flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-xs hover:bg-news-text hover:text-ashanti-gold transition-all disabled:opacity-50 shadow">
                {podcastUploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : '↑ Upload Podcast'}
              </button>
            </form>
          </div>
        )}

        {/* ── Advertise ──────────────────────────────────────── */}
        {tab === 'Advertise' && (
          <div className="space-y-10">

            {/* ── Post a Live Ad ─────────────────────────────── */}
            <div>
              <h2 className="text-lg font-bold mb-5">Post a Live Ad</h2>
              <form className="bg-news-card border border-news-border rounded-2xl p-6 space-y-5"
                onSubmit={async e => {
                  e.preventDefault();
                  if (!newAdForm.brand.trim()) return;
                  setAdSubmitting(true); setAdFormStatus('');
                  const { error } = await supabase.from('live_ads').insert({
                    brand:        newAdForm.brand.trim(),
                    tagline:      newAdForm.tagline.trim(),
                    cta_text:     newAdForm.cta_text.trim() || 'Learn More',
                    cta_url:      newAdForm.cta_url.trim() || '#',
                    logo:         newAdForm.logo.trim() || '📢',
                    accent_color: newAdForm.accent_color,
                    placement:    newAdForm.placement,
                    package_tier: newAdForm.package_tier,
                    active:       true,
                    created_at:   new Date().toISOString(),
                  });
                  setAdSubmitting(false);
                  if (error) { setAdFormStatus('Error: ' + error.message); }
                  else {
                    setAdFormStatus('✓ Ad posted and live!');
                    setNewAdForm({ brand: '', tagline: '', cta_text: 'Learn More', cta_url: '', logo: '📢', accent_color: '#E09E2B', placement: 'leaderboard', package_tier: 'Bronze' });
                    setLogoFile(null); setLogoPreview('');
                    if (logoFileRef.current) logoFileRef.current.value = '';
                    fetchLiveAds();
                    setTimeout(() => setAdFormStatus(''), 3000);
                  }
                }}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Brand / Company *</label>
                    <input required value={newAdForm.brand} onChange={e => setNewAdForm(f => ({ ...f, brand: e.target.value }))}
                      placeholder="e.g. Kumasi City Mall"
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Tagline</label>
                    <input value={newAdForm.tagline} onChange={e => setNewAdForm(f => ({ ...f, tagline: e.target.value }))}
                      placeholder="e.g. Shop Premium. Live Royal."
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">CTA Button Text</label>
                    <input value={newAdForm.cta_text} onChange={e => setNewAdForm(f => ({ ...f, cta_text: e.target.value }))}
                      placeholder="e.g. Visit Now"
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">CTA Link (URL)</label>
                    <input type="url" value={newAdForm.cta_url} onChange={e => setNewAdForm(f => ({ ...f, cta_url: e.target.value }))}
                      placeholder="https://advertiser-website.com"
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Logo — Image or Emoji</label>
                    <input ref={logoFileRef} type="file" accept="image/*" id="ad-logo-input" className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                        const b64 = await resizeImageToBase64(file);
                        if (b64) setNewAdForm(f => ({ ...f, logo: b64 }));
                      }} />
                    {logoPreview ? (
                      <div className="flex items-center gap-3 p-2 bg-brand-surface border border-news-border rounded-xl">
                        <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-lg object-contain border border-news-border bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-news-text truncate">{logoFile?.name}</p>
                          <p className="text-[10px] text-news-muted">Logo image selected</p>
                        </div>
                        <button type="button"
                          onClick={() => { setLogoFile(null); setLogoPreview(''); setNewAdForm(f => ({ ...f, logo: '📢' })); if (logoFileRef.current) logoFileRef.current.value = ''; }}
                          className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label htmlFor="ad-logo-input"
                          className="flex items-center gap-2 w-full px-4 py-2.5 bg-brand-surface border border-dashed border-news-border rounded-xl cursor-pointer hover:border-ashanti-gold hover:bg-ashanti-gold/5 transition-all group text-sm text-news-muted">
                          <Upload size={14} className="group-hover:text-ashanti-gold transition-colors shrink-0" />
                          <span className="group-hover:text-ashanti-gold transition-colors text-[11px] font-bold uppercase tracking-widest">Upload image logo</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-news-muted uppercase tracking-widest font-bold">or emoji:</span>
                          <input value={newAdForm.logo} onChange={e => setNewAdForm(f => ({ ...f, logo: e.target.value }))}
                            placeholder="📢"
                            className="flex-1 bg-brand-surface border border-news-border rounded-xl px-3 py-2 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Accent Colour</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={newAdForm.accent_color} onChange={e => setNewAdForm(f => ({ ...f, accent_color: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-news-border cursor-pointer bg-brand-surface" />
                      <span className="text-sm text-news-muted font-mono">{newAdForm.accent_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Placement</label>
                    <select value={newAdForm.placement} onChange={e => setNewAdForm(f => ({ ...f, placement: e.target.value }))}
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors">
                      <option value="leaderboard">Leaderboard (Homepage top)</option>
                      <option value="rectangle">Rectangle (Sidebar)</option>
                      <option value="square">Square (Sidebar)</option>
                      <option value="wide">Wide Banner</option>
                      <option value="all">All placements</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-1.5">Package Tier</label>
                    <select value={newAdForm.package_tier} onChange={e => setNewAdForm(f => ({ ...f, package_tier: e.target.value }))}
                      className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-2.5 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors">
                      {adPackages.map(p => <option key={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Live preview */}
                {newAdForm.brand && (
                  <div className="rounded-xl overflow-hidden border border-news-border">
                    <p className="text-[9px] font-black uppercase tracking-widest text-news-muted px-4 py-2 bg-brand-surface border-b border-news-border">Preview</p>
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50">
                      <div className="flex items-center gap-4">
                        {logoPreview
                          ? <img src={logoPreview} alt="logo" className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white" />
                          : <span className="text-3xl">{newAdForm.logo || '📢'}</span>}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sponsored</p>
                          <p className="font-heading font-black text-gray-800">{newAdForm.brand}</p>
                          <p className="text-sm text-gray-500 italic">{newAdForm.tagline}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest text-white"
                        style={{ backgroundColor: newAdForm.accent_color }}>
                        {newAdForm.cta_text || 'Learn More'}
                      </span>
                    </div>
                  </div>
                )}

                {adFormStatus && <p className={`text-xs font-bold ${adFormStatus.startsWith('✓') ? 'text-green-500' : 'text-red-400'}`}>{adFormStatus}</p>}

                <button type="submit" disabled={adSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-xs hover:bg-news-text hover:text-ashanti-gold transition-all disabled:opacity-50 shadow">
                  {adSubmitting ? <><Loader2 size={13} className="animate-spin" /> Posting…</> : '↑ Post Ad Live'}
                </button>
              </form>

              {/* Live ads list */}
              {liveAds.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-bold text-news-text mb-3">Posted Ads ({liveAds.length})</h3>
                  {liveAds.map(ad => (
                    <div key={ad.id} className="bg-news-card border border-news-border rounded-2xl overflow-hidden">
                      {/* Row */}
                      <div className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {ad.logo?.startsWith('data:') || ad.logo?.startsWith('http')
                            ? <img src={ad.logo} alt="" className="w-9 h-9 rounded-lg object-contain border border-news-border bg-white shrink-0" />
                            : <span className="text-xl shrink-0">{ad.logo || '📢'}</span>}
                          <div className="min-w-0">
                            <p className="font-bold text-news-text text-sm truncate">{ad.brand}</p>
                            <p className="text-[10px] text-news-muted">{ad.placement} · {ad.package_tier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {ad.active ? 'Live' : 'Paused'}
                          </span>
                          {/* Edit */}
                          <button
                            onClick={() => { setEditingAd(editingAd?.id === ad.id ? null : ad); setEditAdForm({ brand: ad.brand, tagline: ad.tagline || '', cta_text: ad.cta_text || 'Learn More', cta_url: ad.cta_url || '', logo: ad.logo || '📢', accent_color: ad.accent_color || '#E09E2B', placement: ad.placement || 'leaderboard', package_tier: ad.package_tier || 'Bronze' }); setDeletingAdId(null); }}
                            className={`p-1.5 rounded-lg transition-colors ${editingAd?.id === ad.id ? 'bg-ashanti-gold/20 text-ashanti-gold' : 'hover:bg-brand-surface text-news-muted hover:text-news-text'}`}
                            title="Edit ad"
                          >
                            <Edit2 size={14} />
                          </button>
                          {/* Pause / Resume */}
                          <button
                            onClick={() => toggleAdActive(ad.id, !ad.active)}
                            className="p-1.5 rounded-lg hover:bg-brand-surface text-news-muted hover:text-ashanti-gold transition-colors"
                            title={ad.active ? 'Pause ad' : 'Resume ad'}
                          >
                            {ad.active
                              ? <span className="text-[9px] font-black uppercase tracking-widest">Pause</span>
                              : <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Resume</span>}
                          </button>
                          {/* Delete */}
                          {deletingAdId === ad.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-red-400 font-bold">Delete?</span>
                              <button onClick={() => { deleteAd(ad.id); setDeletingAdId(null); }} className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">Yes</button>
                              <button onClick={() => setDeletingAdId(null)} className="px-2 py-1 text-[10px] font-bold text-news-muted bg-brand-surface rounded-lg">No</button>
                            </div>
                          ) : (
                            <button onClick={() => { setDeletingAdId(ad.id); setEditingAd(null); }} className="p-1.5 rounded-lg hover:bg-red-50 text-news-muted hover:text-red-500 transition-colors" title="Delete ad">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {editingAd?.id === ad.id && (
                        <div className="border-t border-news-border bg-brand-surface px-5 py-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Brand</label>
                              <input value={editAdForm.brand} onChange={e => setEditAdForm(f => ({ ...f, brand: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Tagline</label>
                              <input value={editAdForm.tagline} onChange={e => setEditAdForm(f => ({ ...f, tagline: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">CTA Text</label>
                              <input value={editAdForm.cta_text} onChange={e => setEditAdForm(f => ({ ...f, cta_text: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">CTA URL</label>
                              <input value={editAdForm.cta_url} onChange={e => setEditAdForm(f => ({ ...f, cta_url: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Logo (emoji or URL)</label>
                              <input value={editAdForm.logo} onChange={e => setEditAdForm(f => ({ ...f, logo: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Accent Colour</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={editAdForm.accent_color} onChange={e => setEditAdForm(f => ({ ...f, accent_color: e.target.value }))}
                                  className="w-9 h-9 rounded-lg border border-news-border cursor-pointer bg-white" />
                                <span className="text-xs text-news-muted font-mono">{editAdForm.accent_color}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Placement</label>
                              <select value={editAdForm.placement} onChange={e => setEditAdForm(f => ({ ...f, placement: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold">
                                <option value="leaderboard">Leaderboard</option>
                                <option value="rectangle">Rectangle</option>
                                <option value="square">Square</option>
                                <option value="wide">Wide Banner</option>
                                <option value="all">All placements</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1">Package Tier</label>
                              <select value={editAdForm.package_tier} onChange={e => setEditAdForm(f => ({ ...f, package_tier: e.target.value }))}
                                className="w-full border border-news-border rounded-xl px-3 py-2 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold">
                                {adPackages.map(p => <option key={p.name}>{p.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button onClick={() => setEditingAd(null)}
                              className="px-4 py-1.5 text-xs font-bold text-news-muted bg-news-card border border-news-border rounded-xl hover:bg-brand-surface transition-colors">Cancel</button>
                            <button onClick={saveEditAd}
                              className="px-4 py-1.5 text-xs font-bold text-black bg-ashanti-gold rounded-xl hover:opacity-90 transition-opacity">Save Changes</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package management */}
            <div>
              <h2 className="text-lg font-bold mb-5">Ad Packages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adPackages.map((pkg, i) => (
                  <div key={pkg.name} className="bg-news-card border border-news-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-news-text">{pkg.name}</span>
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-news-muted cursor-pointer">
                        <input type="checkbox" checked={pkg.popular}
                          onChange={e => setAdPackages(prev => prev.map((p, j) => j === i ? { ...p, popular: e.target.checked } : p))}
                          className="accent-ashanti-gold" />
                        Popular
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-news-muted mb-1">Price</label>
                        <input type="text" value={pkg.price}
                          onChange={e => setAdPackages(prev => prev.map((p, j) => j === i ? { ...p, price: e.target.value } : p))}
                          className="w-full bg-brand-surface border border-news-border rounded-lg px-3 py-2 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                      </div>
                      <div className="w-32">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-news-muted mb-1">Period</label>
                        <input type="text" value={pkg.period}
                          onChange={e => setAdPackages(prev => prev.map((p, j) => j === i ? { ...p, period: e.target.value } : p))}
                          className="w-full bg-brand-surface border border-news-border rounded-lg px-3 py-2 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-news-muted mt-3">Changes update the public Advertise page immediately on next load.</p>
            </div>

            {/* Enquiries table */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">
                  Ad Enquiries{' '}
                  <span className="text-news-muted font-normal text-sm">({adEnquiries.length})</span>
                </h2>
                <button onClick={fetchAdEnquiries}
                  className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold hover:text-news-text transition-colors">
                  ↻ Refresh
                </button>
              </div>

              {adLoading ? (
                <div className="flex items-center gap-2 py-10 justify-center text-news-muted text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading enquiries…
                </div>
              ) : adEnquiries.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-news-border rounded-2xl text-news-muted text-sm">
                  No enquiries yet. They'll appear here once advertisers submit the form.
                </div>
              ) : (
                <div className="bg-news-card rounded-2xl overflow-hidden border border-news-border">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-brand-surface border-b border-news-border">
                          {['Name', 'Email', 'Company', 'Package', 'Date', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-xs uppercase tracking-widest text-news-muted font-bold text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {adEnquiries.map(enq => (
                          <tr key={enq.id} className="border-b border-news-border hover:bg-brand-surface transition-colors">
                            <td className="px-4 py-3 font-semibold">{enq.name}</td>
                            <td className="px-4 py-3 text-news-muted text-xs">{enq.email}</td>
                            <td className="px-4 py-3 text-news-muted text-xs">{enq.company}</td>
                            <td className="px-4 py-3">
                              {enq.package && (
                                <span className="bg-ashanti-gold/10 text-ashanti-gold text-[11px] font-bold px-2 py-0.5 rounded-full">
                                  {enq.package}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-news-muted text-xs">
                              {enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                enq.status === 'active'    ? 'bg-green-100 text-green-700' :
                                enq.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                enq.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                                'bg-ashanti-gold/10 text-ashanti-gold'
                              }`}>{enq.status || 'new'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={enq.status || 'new'}
                                onChange={e => updateAdStatus(enq.id, e.target.value)}
                                className="text-[10px] font-bold bg-brand-surface border border-news-border rounded-lg px-2 py-1 text-news-text focus:outline-none focus:border-ashanti-gold transition-colors">
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Enquiries', value: adEnquiries.length },
                { label: 'New',       value: adEnquiries.filter(e => !e.status || e.status === 'new').length },
                { label: 'Active',    value: adEnquiries.filter(e => e.status === 'active').length },
                { label: 'Completed', value: adEnquiries.filter(e => e.status === 'completed').length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-news-card border border-news-border rounded-2xl p-5 text-center">
                  <div className="font-heading text-3xl font-black text-ashanti-gold">{value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-news-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Settings ───────────────────────────────────────── */}
        {tab === 'Settings' && (
          <div className="space-y-8">

            {/* ── Authors management ─────────────────────────── */}
            <section className="bg-news-card rounded-2xl border border-news-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-news-border">
                <h2 className="font-bold text-base">Author Management</h2>
                <p className="text-xs text-news-muted mt-0.5">Add new authors, edit name or role, or remove access.</p>
              </div>

              <div className="px-6 pt-5 pb-2 space-y-4">
                {/* Add Author form */}
                <div className="bg-brand-surface border border-news-border rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-4">Add New Author</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1.5">Full Name *</label>
                      <input type="text" value={addAuthorForm.name}
                        onChange={e => setAddAuthorForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Kwame Mensah"
                        className="w-full border border-news-border rounded-xl px-3 py-2.5 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1.5">Email Address *</label>
                      <input type="email" value={addAuthorForm.email}
                        onChange={e => setAddAuthorForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="author@email.com"
                        className="w-full border border-news-border rounded-xl px-3 py-2.5 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-news-muted block mb-1.5">Role</label>
                      <select value={addAuthorForm.role}
                        onChange={e => setAddAuthorForm(f => ({ ...f, role: e.target.value }))}
                        className="w-full border border-news-border rounded-xl px-3 py-2.5 text-sm bg-white text-news-text focus:outline-none focus:border-ashanti-gold appearance-none cursor-pointer">
                        <option value="journalist">Journalist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={handleAddAuthor}
                      disabled={addAuthorSaving || !addAuthorForm.name.trim() || !addAuthorForm.email.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-ashanti-gold text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
                      {addAuthorSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                      Add Author
                    </button>
                    <p className="text-[10px] text-news-muted max-w-xs text-right">Author must sign in once with this email to activate their account.</p>
                  </div>
                </div>

                {authorStatus && (
                  <div className={`text-xs font-bold rounded-xl px-4 py-2.5 ${authorStatus.startsWith('✓') ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-500 bg-red-50 border border-red-200'}`}>
                    {authorStatus}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3">
                {authors.map(author => (
                  <div key={author.id} className="border border-news-border rounded-xl overflow-hidden">
                    {editingAuthor?.id === author.id ? (
                      /* Inline edit */
                      <div className="p-4 bg-brand-surface space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-news-muted font-bold block mb-1.5">
                              Name
                            </label>
                            <input
                              type="text"
                              className="w-full border border-news-border rounded-xl px-3 py-2 text-sm font-semibold bg-news-card text-news-text focus:outline-none focus:border-ashanti-gold transition-colors"
                              value={editAuthorForm.name}
                              onChange={e => setEditAuthorForm(f => ({ ...f, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-news-muted font-bold block mb-1.5">
                              Role
                            </label>
                            <select
                              className="w-full border border-news-border rounded-xl px-3 py-2 text-sm font-semibold bg-news-card text-news-text focus:outline-none focus:border-ashanti-gold appearance-none cursor-pointer"
                              value={editAuthorForm.role}
                              onChange={e => setEditAuthorForm(f => ({ ...f, role: e.target.value }))}
                            >
                              <option value="journalist">Journalist</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingAuthor(null)}
                            className="px-4 py-1.5 text-xs font-bold text-news-muted bg-news-card border border-news-border rounded-xl hover:bg-brand-surface transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveAuthor}
                            className="px-4 py-1.5 text-xs font-bold text-black bg-ashanti-gold rounded-xl hover:opacity-90 transition-opacity"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal row */
                      <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-ashanti-gold/15 flex items-center justify-center text-xs font-black text-ashanti-gold shrink-0">
                            {(author.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{author.name}</div>
                            <div className="text-xs text-news-muted truncate">{author.email}</div>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                              author.role === 'admin'
                                ? 'bg-ashanti-green text-white'
                                : 'bg-brand-surface text-news-muted'
                            }`}
                          >
                            {author.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {deletingAuthorId === author.id ? (
                            <>
                              <span className="text-xs text-red-400 font-bold mr-1">Remove?</span>
                              <button
                                onClick={() => handleDeleteAuthor(author.id)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingAuthorId(null)}
                                className="px-2.5 py-1 text-xs font-bold text-news-muted bg-brand-surface rounded-lg hover:bg-news-border transition-colors"
                              >
                                No
                              </button>
                            </>
                          ) : (
                            user.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingAuthor(author);
                                    setEditAuthorForm({ name: author.name || '', role: author.role });
                                    setAuthorStatus('');
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-brand-surface text-news-muted hover:text-news-text transition-colors"
                                  title="Edit author"
                                >
                                  <Edit2 size={14} />
                                </button>
                                {author.id !== user.id && (
                                  <button
                                    onClick={() => { setDeletingAuthorId(author.id); setAuthorStatus(''); }}
                                    className="p-1.5 rounded-lg hover:bg-red-900/20 text-news-muted hover:text-red-400 transition-colors"
                                    title="Remove author"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {authors.length === 0 && (
                  <div className="text-center py-8 text-news-muted text-sm">No authors found.</div>
                )}
              </div>
            </section>

            {/* ── General settings ───────────────────────────── */}
            <section className="bg-news-card rounded-2xl border border-news-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-news-border">
                <h2 className="font-bold text-base">General</h2>
                <p className="text-xs text-news-muted mt-0.5">Site-wide configuration.</p>
              </div>
              <div className="p-6">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setSettingsStatus('Settings saved!');
                    setTimeout(() => setSettingsStatus(''), 3000);
                  }}
                  className="max-w-sm space-y-5"
                >
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-news-muted font-bold block mb-1.5">
                      Site Title
                    </label>
                    <input
                      type="text"
                      className="w-full border border-news-border rounded-xl px-4 py-2.5 text-sm font-semibold bg-brand-surface text-news-text focus:outline-none focus:border-ashanti-gold transition-colors"
                      value={siteTitle}
                      onChange={e => setSiteTitle(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-ashanti-gold text-black px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Save
                  </button>
                  {settingsStatus && (
                    <p className="text-xs font-bold text-green-400">{settingsStatus}</p>
                  )}
                </form>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Publish / Edit modal */}
      {showPublish && (
        <PublishModal
          user={user}
          editArticle={editArticle || undefined}
          onClose={() => setShowPublish(false)}
          onPublished={() => { setShowPublish(false); fetchArticles(); fetchAnalytics(); }}
        />
      )}
    </div>
  );
}
