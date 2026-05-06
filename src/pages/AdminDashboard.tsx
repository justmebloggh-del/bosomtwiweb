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
    // Example: fetch views, top articles, etc.
    const { data } = await supabase.rpc('get_article_analytics');
    setAnalytics(data || {});
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
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow">
                  <div className="text-3xl font-black text-ashanti-gold">{analytics.total_views ?? 0}</div>
                  <div className="text-xs uppercase mt-2 font-bold">Total Views</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                  <div className="text-3xl font-black text-ashanti-gold">{analytics.total_articles ?? 0}</div>
                  <div className="text-xs uppercase mt-2 font-bold">Total Articles</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                  <div className="text-3xl font-black text-ashanti-gold">{analytics.top_article_title ?? '-'}</div>
                  <div className="text-xs uppercase mt-2 font-bold">Top Article</div>
                </div>
              </div>
            ) : <div>Loading analytics…</div>}
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
