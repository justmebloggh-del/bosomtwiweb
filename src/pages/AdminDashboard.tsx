import React, { useState, useEffect } from 'react';
import PublishModal from '../components/PublishModal';
import { supabase } from '../lib/supabase';
import { User, Article } from '../types';

const TABS = ['Articles', 'Analytics', 'Authors', 'Settings'];

export default function AdminDashboard({ user }: { user: User }) {
  const [tab, setTab] = useState('Articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [authors, setAuthors] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});

  // Author management state
  const [newAuthor, setNewAuthor] = useState({ name: '', email: '', role: 'journalist' });
  const [authorStatus, setAuthorStatus] = useState('');

  // Settings state
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || 'Bosomtwi Web');
  const [themeColor, setThemeColor] = useState(settings.themeColor || '#FFD700');
  const [settingsStatus, setSettingsStatus] = useState('');

  useEffect(() => {
    fetchArticles();
    fetchAuthors();
    fetchAnalytics();
  }, []);

  async function fetchArticles() {
    const { data } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    setArticles(data || []);
  }
  async function fetchAuthors() {
    const { data } = await supabase.from('users').select('*').order('name');
    setAuthors(data || []);
  }
  async function fetchAnalytics() {
    // Fetch all articles for analytics calculations
    const { data } = await supabase.from('articles').select('*');
    if (!data) {
      setAnalytics({});
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate daily stats (last 7 days)
    const dailyStats: any = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = { views: 0, articles: 0 };
    }

    data.forEach((article: any) => {
      const pubDate = new Date(article.published_at);
      const pubDateKey = pubDate.toISOString().split('T')[0];
      if (dailyStats[pubDateKey]) {
        dailyStats[pubDateKey].views += article.views || 0;
        dailyStats[pubDateKey].articles += 1;
      }
    });

    // Weekly stats
    const weeklyViews = data
      .filter((a: any) => new Date(a.published_at) >= sevenDaysAgo)
      .reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const weeklyArticles = data.filter((a: any) => new Date(a.published_at) >= sevenDaysAgo).length;

    // Monthly stats
    const monthlyViews = data
      .filter((a: any) => new Date(a.published_at) >= thirtyDaysAgo)
      .reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const monthlyArticles = data.filter((a: any) => new Date(a.published_at) >= thirtyDaysAgo).length;

    // Total stats
    const totalViews = data.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const topArticle = [...data].sort((a: any, b: any) => (b.views || 0) - (a.views || 0))[0];

    setAnalytics({
      dailyStats,
      weeklyViews,
      weeklyArticles,
      monthlyViews,
      monthlyArticles,
      totalViews,
      totalArticles: data.length,
      topArticleTitle: topArticle?.title || '-',
      topArticleViews: topArticle?.views || 0,
    });
  }

  // Add author (admin only)
  async function handleAddAuthor(e: React.FormEvent) {
    e.preventDefault();
    setAuthorStatus('');
    const { data, error } = await supabase.from('users').insert([
      { name: newAuthor.name, email: newAuthor.email, role: newAuthor.role, created_at: new Date().toISOString() },
    ]);
    if (error) {
      setAuthorStatus('Failed to add author.');
    } else {
      setAuthorStatus('Author added!');
      setNewAuthor({ name: '', email: '', role: 'journalist' });
      fetchAuthors();
    }
  }

  // Save settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsStatus('');
    // Example: Save to a settings table (or local state for demo)
    setSettings({ siteTitle, themeColor });
    setSettingsStatus('Settings saved!');
    // Optionally, update in Supabase if you have a settings table
    // await supabase.from('settings').upsert({ siteTitle, themeColor });
  }

  return (
    <div className="min-h-screen bg-news-bg text-news-text p-0 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full font-bold uppercase text-xs tracking-widest border border-ashanti-gold/30 ${tab === t ? 'bg-ashanti-gold text-black' : 'bg-white text-news-text hover:bg-ashanti-gold/10'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'Articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Articles</h2>
              <button
                className="bg-ashanti-gold text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                onClick={() => { setEditArticle(null); setShowPublish(true); }}
              >
                + Publish New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-xs uppercase tracking-widest">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Author</th>
                    <th className="p-3 text-left">Views</th>
                    <th className="p-3 text-left">Published</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(article => (
                    <tr key={article.id} className="border-b last:border-0">
                      <td className="p-3 font-bold">{article.title}</td>
                      <td className="p-3">{article.category}</td>
                      <td className="p-3">{article.author}</td>
                      <td className="p-3">{article.views ?? 0}</td>
                      <td className="p-3">{new Date(article.published_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button className="text-xs text-ashanti-gold font-bold mr-2" onClick={() => { setEditArticle(article); setShowPublish(true); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Analytics</h2>
            {analytics && Object.keys(analytics).length > 0 ? (
              <div className="space-y-8">
                {/* Top-level stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow border-l-4 border-ashanti-gold">
                    <div className="text-3xl font-black text-ashanti-gold">{analytics.totalViews || 0}</div>
                    <div className="text-xs uppercase mt-2 font-bold text-gray-600">Total Views</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border-l-4 border-ashanti-gold">
                    <div className="text-3xl font-black text-ashanti-gold">{analytics.totalArticles || 0}</div>
                    <div className="text-xs uppercase mt-2 font-bold text-gray-600">Total Articles</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border-l-4 border-ashanti-gold">
                    <div className="text-lg font-black text-ashanti-gold truncate">{analytics.topArticleTitle || '-'}</div>
                    <div className="text-xs uppercase mt-2 font-bold text-gray-600">Top Article</div>
                    <div className="text-sm text-gray-500 mt-1">{analytics.topArticleViews || 0} views</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border-l-4 border-ashanti-gold">
                    <div className="text-lg font-black text-ashanti-gold">{analytics.totalArticles > 0 ? Math.round(analytics.totalViews / analytics.totalArticles) : 0}</div>
                    <div className="text-xs uppercase mt-2 font-bold text-gray-600">Avg Views/Article</div>
                  </div>
                </div>

                {/* Daily Report (Last 7 Days) */}
                <div className="bg-white rounded-xl p-6 shadow">
                  <h3 className="text-lg font-bold mb-4">Daily Report (Last 7 Days)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left font-bold">Date</th>
                          <th className="p-3 text-left font-bold">Articles</th>
                          <th className="p-3 text-left font-bold">Views</th>
                          <th className="p-3 text-left font-bold">Avg Views/Article</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.dailyStats && Object.keys(analytics.dailyStats).map((date: string) => {
                          const stat = analytics.dailyStats[date];
                          return (
                            <tr key={date} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-semibold">{new Date(date).toLocaleDateString()}</td>
                              <td className="p-3">{stat.articles}</td>
                              <td className="p-3 text-ashanti-gold font-bold">{stat.views}</td>
                              <td className="p-3">{stat.articles > 0 ? Math.round(stat.views / stat.articles) : 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Weekly Report */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow">
                    <h3 className="text-lg font-bold mb-4">Weekly Report (Last 7 Days)</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Views</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.weeklyViews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Articles Published</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.weeklyArticles || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Views/Article</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.weeklyArticles > 0 ? Math.round(analytics.weeklyViews / analytics.weeklyArticles) : 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Report */}
                  <div className="bg-white rounded-xl p-6 shadow">
                    <h3 className="text-lg font-bold mb-4">Monthly Report (Last 30 Days)</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Views</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.monthlyViews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Articles Published</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.monthlyArticles || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Views/Article</span>
                        <span className="text-2xl font-black text-ashanti-gold">{analytics.monthlyArticles > 0 ? Math.round(analytics.monthlyViews / analytics.monthlyArticles) : 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : <div className="text-center py-8 text-gray-500">No analytics data available. Check back after articles are published.</div>}
          </div>
        )}

        {tab === 'Authors' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Authors</h2>
            {/* Admins can add authors */}
            {user.role === 'admin' && (
              <form className="bg-white rounded-xl p-5 mb-6 flex flex-col gap-3 border border-brand-secondary/10" onSubmit={handleAddAuthor}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded w-1/3"
                    value={newAuthor.name}
                    onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded w-1/3"
                    value={newAuthor.email}
                    onChange={e => setNewAuthor({ ...newAuthor, email: e.target.value })}
                    required
                  />
                  <select
                    className="border p-2 rounded w-1/4"
                    value={newAuthor.role}
                    onChange={e => setNewAuthor({ ...newAuthor, role: e.target.value })}
                  >
                    <option value="journalist">Journalist</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="bg-ashanti-gold text-black px-4 rounded font-bold">Add</button>
                </div>
                {authorStatus && <div className="text-xs text-green-600 mt-1">{authorStatus}</div>}
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authors.map(author => (
                <div key={author.id} className="bg-white rounded-xl p-5 flex flex-col gap-2 border border-brand-secondary/10">
                  <div className="font-bold text-lg">{author.name}</div>
                  <div className="text-xs uppercase tracking-widest text-news-text/40">{author.role}</div>
                  <div className="text-xs text-news-text/60">{author.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Settings' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <form className="bg-white rounded-xl p-6 flex flex-col gap-4 max-w-lg" onSubmit={handleSaveSettings}>
              <label className="font-bold">Site Title
                <input
                  type="text"
                  className="border p-2 rounded w-full mt-1"
                  value={siteTitle}
                  onChange={e => setSiteTitle(e.target.value)}
                  required
                />
              </label>
              <label className="font-bold">Theme Color
                <input
                  type="color"
                  className="border p-2 rounded w-16 h-10 mt-1"
                  value={themeColor}
                  onChange={e => setThemeColor(e.target.value)}
                />
              </label>
              <button type="submit" className="bg-ashanti-gold text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Save Settings</button>
              {settingsStatus && <div className="text-xs text-green-600 mt-1">{settingsStatus}</div>}
            </form>
          </div>
        )}
      </div>

      {/* Publish/Edit Modal */}
      {showPublish && (
        <PublishModal
          user={user}
          editArticle={editArticle || undefined}
          onClose={() => setShowPublish(false)}
          onPublished={() => { setShowPublish(false); fetchArticles(); }}
        />
      )}
    </div>
  );
}
