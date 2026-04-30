import { useState } from 'react';
import { X, FileText, Globe, Share2, Loader2, ImageIcon, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

const ALL_CATEGORIES = [
  'Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment',
  'Technology', 'Lifestyle', 'International',
];

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
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [status, setStatus] = useState({ text: '', type: '' });
  const [publishing, setPublishing] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(data.path);
      set('image', publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed — check storage bucket exists.');
    } finally {
      setUploading(false);
    }
  };

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
        <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-black text-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg md:text-xl font-black italic tracking-tight">Publish New Story</h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
              {user.name} · {user.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-5">
          {status.text && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
              status.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {status.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
              {status.text}
            </div>
          )}

          {/* Headline + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* Author + Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* Cover Image — URL or Upload */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
              <ImageIcon size={11} /> Cover Image
            </label>

            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 text-[10px] font-black uppercase tracking-widest">
              <button
                type="button"
                onClick={() => { setImageMode('url'); setUploadError(''); }}
                className={`flex-1 py-2.5 transition-colors ${imageMode === 'url' ? 'bg-black text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => { setImageMode('upload'); setUploadError(''); }}
                className={`flex-1 py-2.5 transition-colors ${imageMode === 'upload' ? 'bg-black text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                Upload File
              </button>
            </div>

            {imageMode === 'url' ? (
              <input
                type="url"
                value={form.image}
                onChange={e => set('image', e.target.value)}
                className="w-full border-b-2 border-slate-200 py-2.5 font-bold text-sm focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-slate-300"
                placeholder="https://example.com/photo.jpg"
              />
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-ashanti-gold transition-colors bg-slate-50 relative overflow-hidden">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-ashanti-gold" />
                  ) : form.image && imageMode === 'upload' ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <img src={form.image} alt="preview" className="h-16 object-contain rounded-lg" />
                      <span className="text-[10px] text-green-600 font-bold">✓ Uploaded — tap to replace</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-300 mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-400">Tap to choose image (max 5 MB)</span>
                      <span className="text-[10px] text-slate-300 mt-0.5">JPG, PNG, WEBP</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {uploadError && (
                  <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} /> {uploadError}
                  </p>
                )}
              </div>
            )}

            {/* Image preview (both modes) */}
            {form.image && !uploading && (
              <div className="relative">
                <img
                  src={form.image}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-xl border border-slate-100"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => set('image', '')}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Excerpt */}
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

          {/* Full body */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Full Article Body</label>
            <textarea
              rows={8}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300"
              placeholder="Write the full article here. Use blank lines between paragraphs…"
            />
          </div>

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishing || uploading}
            className="w-full bg-ashanti-gold text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm md:text-base"
          >
            {publishing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            <span>{publishing ? 'Publishing…' : 'Publish Story'}</span>
          </button>

          {/* Bottom safe-area spacer for mobile */}
          <div className="h-4 md:h-0" />
        </div>
      </motion.div>
    </div>
  );
}
