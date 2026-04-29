import { useState } from 'react';
import { X, FileText, Globe, Share2, Loader2, ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

const ALL_CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle'];

interface PublishModalProps {
  user: User;
  defaultCategory?: string;
  onClose: () => void;
  onPublished: () => void;
}

export default function PublishModal({ user, defaultCategory, onClose, onPublished }: PublishModalProps) {
  const [form, setForm] = useState({
    title: '',
    category: defaultCategory && ALL_CATEGORIES.includes(defaultCategory) ? defaultCategory : ALL_CATEGORIES[0],
    image: '',
    videoUrl: '',
    excerpt: '',
    content: '',
    author: user.name,
  });
  const [status, setStatus] = useState({ text: '', type: '' });
  const [publishing, setPublishing] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handlePublish = async () => {
    if (!form.title.trim() || !form.excerpt.trim()) {
      setStatus({ text: 'Headline and excerpt are required.', type: 'error' });
      return;
    }
    setPublishing(true);
    setStatus({ text: '', type: '' });
    try {
      const slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { error } = await supabase.from('articles').insert({
        id: String(Date.now()),
        title: form.title,
        slug,
        category: form.category,
        author: form.author,
        published_at: new Date().toISOString(),
        excerpt: form.excerpt,
        content: form.content,
        image: form.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
        video_url: form.videoUrl || '',
        status: 'published',
      });
      if (error) throw new Error(error.message);
      setStatus({ text: 'Story is live!', type: 'success' });
      setTimeout(() => { onPublished(); onClose(); }, 900);
    } catch (err: any) {
      setStatus({ text: err.message || 'Publish failed. Check your connection.', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-0 md:p-6">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        className="bg-white w-full md:max-w-2xl md:rounded-[2rem] shadow-2xl overflow-hidden my-0 md:my-6"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-black text-white">
          <div>
            <h2 className="text-xl font-black italic tracking-tight">Publish New Story</h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
              Bosomtwi Web · {user.name} · {user.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {status.text && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
              status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {status.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
              {status.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                <FileText size={11} /> Headline *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className="w-full border-b-2 border-slate-200 py-2.5 font-bold text-base focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                placeholder="Article headline…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:border-ashanti-gold appearance-none cursor-pointer"
              >
                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => set('author', e.target.value)}
                className="w-full border-b-2 border-slate-200 py-2.5 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                <Globe size={11} /> Video URL
              </label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={e => set('videoUrl', e.target.value)}
                className="w-full border-b-2 border-slate-200 py-2.5 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
              <ImageIcon size={11} /> Cover Image URL
            </label>
            <input
              type="url"
              value={form.image}
              onChange={e => set('image', e.target.value)}
              className="w-full border-b-2 border-slate-200 py-2.5 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Excerpt / Summary *</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300"
              placeholder="Brief summary shown in article cards…"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Full Article Body</label>
            <textarea
              rows={9}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300"
              placeholder="Write the full article here. Use blank lines between paragraphs…"
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full bg-ashanti-gold text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {publishing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            <span>{publishing ? 'Publishing…' : 'Publish Story'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
