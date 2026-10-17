import React, { useState, useRef } from 'react';
import { X, FileText, Globe, Share2, Loader2, ImageIcon, AlertTriangle, CheckCircle, Upload, PenLine, Bold, Italic, Image, Play, Link2, Paperclip } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Article } from '../types';
import { supabase } from '../lib/supabase';

const ALL_CATEGORIES = [
  'Manhyia', 'News', 'Politics', 'Business', 'Education',
  'Sports', 'Entertainment', 'Lifestyle', 'Technology',
  'International', 'Health', 'Local', 'Editorials', 'Editorials & Opinion',
];


interface PublishModalProps {
  user: User;
  defaultCategory?: string;
  editArticle?: Article;        // when provided → edit mode
  onClose: () => void;
  onPublished: () => void;
}

export default function PublishModal({ user, defaultCategory, editArticle, onClose, onPublished }: PublishModalProps) {
  const isEdit = !!editArticle;

  const [form, setForm] = useState({
    title:    isEdit ? editArticle.title    : '',
    slug:     isEdit ? editArticle.slug     : '',
    category: isEdit
      ? editArticle.category
      : (defaultCategory && ALL_CATEGORIES.includes(defaultCategory) ? defaultCategory : ALL_CATEGORIES[0]),
    image:    isEdit ? editArticle.image    : '',
    videoUrl: isEdit ? (editArticle.videoUrl ?? '') : '',
    excerpt:  isEdit ? editArticle.excerpt  : '',
    content:  isEdit ? (editArticle.content ?? '') : '',
    author:   isEdit ? editArticle.author   : user.name,
  });

  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [status, setStatus]         = useState({ text: '', type: '' });
  const [saving, setSaving]         = useState(false);

  // Draft / schedule — scheduledAt uses the <input type="datetime-local">
  // format (no timezone suffix); converted to an ISO string on save.
  // This save only marks the article a draft with a target time; the
  // actual flip to 'published' happens separately via a pg_cron job
  // (see supabase/scheduled_publish.sql) that runs every minute inside
  // Postgres, not from any code path in this file.
  const toLocalInputValue = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [scheduledAt, setScheduledAt] = useState(
    isEdit ? toLocalInputValue((editArticle as any).scheduledAt) : ''
  );
  const currentStatus = isEdit ? (editArticle as any).status || 'published' : 'published';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5 MB.'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
      set('image', publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed — check storage bucket exists.');
    } finally {
      setUploading(false);
    }
  };

  const [slugError, setSlugError] = useState('');

  const handleSave = async (action: 'draft' | 'publish') => {
    if (!form.title.trim() || !form.excerpt.trim()) {
      setStatus({ text: 'Headline and excerpt are required.', type: 'error' });
      return;
    }
    setSaving(true);
    setStatus({ text: '', type: '' });
    setSlugError('');
    try {
      const slug = (form.slug || form.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Uniqueness check — slugs are the public URL, so a silent collision
      // means one of two articles becomes unreachable.
      let dupe = supabase.from('articles').select('id').eq('slug', slug);
      if (isEdit) dupe = dupe.neq('id', editArticle.id);
      const { data: existing } = await dupe.limit(1);
      if (existing && existing.length > 0) {
        setSlugError(`That slug is already used by another article. Edit the slug field above.`);
        setSaving(false);
        return;
      }

      const isScheduled = action === 'publish' && scheduledAt && new Date(scheduledAt) > new Date();
      const finalStatus = action === 'draft' ? 'draft' : isScheduled ? 'draft' : 'published';
      const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;

      const payload = {
        title:        form.title,
        slug,
        category:     form.category,
        author:       form.author,
        excerpt:      form.excerpt,
        content:      form.content || '',
        image:        form.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
        video_url:    form.videoUrl || '',
        status:       finalStatus,
        scheduled_at: scheduledIso,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', editArticle.id);
        if (error) throw new Error(error.message);
        setStatus({ text: 'Article updated!', type: 'success' });
      } else {
        const { error } = await supabase.from('articles').insert({
          id: String(Date.now()),
          published_at: new Date().toISOString(),
          ...payload,
        });
        if (error) throw new Error(error.message);
        setStatus({
          text: finalStatus === 'draft' ? (isScheduled ? 'Draft saved — scheduled, publish it yourself when ready.' : 'Draft saved!') : 'Story is live!',
          type: 'success',
        });
      }

      setTimeout(() => { onPublished(); onClose(); }, 900);
    } catch (err: any) {
      setStatus({ text: err.message || 'Save failed. Check your connection.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Add these handlers above the return statement
  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setStatus({ text: 'Image must be under 10 MB.', type: 'error' }); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `body-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
      set('content', form.content + `\n[image]${publicUrl}[/image]\n`);
    } catch (err: any) {
      setStatus({ text: err.message || 'Upload failed — check storage bucket exists.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleBodyVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setStatus({ text: 'Video must be under 50 MB.', type: 'error' }); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const path = `body-video-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
      set('content', form.content + `\n[video]${publicUrl}[/video]\n`);
    } catch (err: any) {
      setStatus({ text: err.message || 'Upload failed — check storage bucket exists.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!DOCUMENT_EXTENSIONS.includes(ext)) {
      setStatus({ text: 'Only PDF, Word, Excel, and PowerPoint files are supported.', type: 'error' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) { setStatus({ text: 'Document must be under 20 MB.', type: 'error' }); return; }
    setUploading(true);
    try {
      const path = `doc-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-documents')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('article-documents').getPublicUrl(data.path);
      // name/size are encoded alongside the URL (pipe-delimited — none of
      // the three can contain a literal "|") so the rendered attachment
      // card can show the original filename and size without a second
      // request; ArticleView.tsx's renderBody() parses this back apart.
      set('content', form.content + `\n[file]${publicUrl}|${file.name.replace(/\|/g, '-')}|${file.size}[/file]\n`);
    } catch (err: any) {
      setStatus({ text: err.message || 'Upload failed — check storage bucket exists.', type: 'error' });
    } finally {
      setUploading(false);
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
        <div className={`p-5 md:p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 text-white ${isEdit ? 'bg-[#1a0a35]' : 'bg-black'}`}>
          <div>
            <h2 className="text-lg md:text-xl font-black italic tracking-tight flex items-center gap-2">
              {isEdit ? <PenLine size={18} /> : <Share2 size={18} />}
              {isEdit ? 'Edit Article' : 'Publish New Story'}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
              {user.name} · {user.role}{isEdit ? ' · editing' : ''}
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
          {slugError && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle size={15} /> {slugError}
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

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">
              URL Slug {!isEdit && <span className="text-slate-300">(auto-filled from headline — edit if you need to)</span>}
            </label>
            <input
              type="text"
              value={form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
              onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              className="w-full border-b-2 border-slate-200 py-2.5 font-mono text-sm focus:outline-none focus:border-ashanti-gold transition-all"
              placeholder="auto-generated-from-headline"
            />
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

          {/* Full body - Rich Text Editor */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Full Article Body</label>
            
            {/* Text Formatting Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selected = form.content.substring(start, end);
                    const before = form.content.substring(0, start);
                    const after = form.content.substring(end);
                    set('content', before + `**${selected}**` + after);
                  }
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Bold"
              >
                <Bold size={14} /> Bold
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selected = form.content.substring(start, end);
                    const before = form.content.substring(0, start);
                    const after = form.content.substring(end);
                    set('content', before + `_${selected}_` + after);
                  }
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Italic"
              >
                <Italic size={14} /> Italic
              </button>

              <select
                onChange={(e) => {
                  if (e.target.value !== 'default') {
                    const textarea = textareaRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selected = form.content.substring(start, end);
                      const before = form.content.substring(0, start);
                      const after = form.content.substring(end);
                      set('content', before + `[size:${e.target.value}]${selected}[/size]` + after);
                      e.target.value = 'default';
                    }
                  }
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
              >
                <option value="default">Text Size</option>
                <option value="sm">Small</option>
                <option value="base">Normal</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const imageUrl = prompt('Enter image URL:');
                  if (imageUrl) {
                    set('content', form.content + `\n[image]${imageUrl}[/image]\n`);
                  }
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Insert Image"
              >
                <Image size={14} /> Image
              </button>

              <button
                type="button"
                onClick={() => {
                  const videoUrl = prompt('Enter video URL (YouTube or other):');
                  if (videoUrl) {
                    set('content', form.content + `\n[video]${videoUrl}[/video]\n`);
                  }
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Insert Video"
              >
                <Play size={14} /> Video
              </button>

              <label className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="Upload Image">
                <Image size={14} /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleBodyImageUpload} disabled={uploading} />
              </label>
              <label className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="Upload Video">
                <Play size={14} /> Upload Video
                <input type="file" accept="video/*" className="hidden" onChange={handleBodyVideoUpload} disabled={uploading} />
              </label>

              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter the URL to link to:');
                  if (!url) return;
                  const textarea = textareaRef.current;
                  const start = textarea?.selectionStart ?? form.content.length;
                  const end = textarea?.selectionEnd ?? form.content.length;
                  const selected = form.content.substring(start, end) || prompt('Link text to display:', url) || url;
                  const before = form.content.substring(0, start);
                  const after = form.content.substring(end);
                  set('content', before + `[link:${url}]${selected}[/link]` + after);
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Insert Link — select text first to link it, or leave nothing selected to pick link text"
              >
                <Link2 size={14} /> Link
              </button>

              <label className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="Attach PDF, Word, Excel, or PowerPoint file">
                <Paperclip size={14} /> Attach Document
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleDocumentUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Content Textarea */}
            <textarea
              ref={textareaRef}
              rows={9}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm leading-relaxed focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-slate-300 font-mono"
              placeholder="Write the full article here. Use **bold** for bold, _italic_ for italics. Insert [image]URL[/image] or [video]URL[/video] to embed media…"
            />

            {/* Formatting Tips */}
            <p className="text-[10px] text-slate-500">
              💡 Tips: Use <span className="font-mono bg-slate-100 px-1">**text**</span> for bold, <span className="font-mono bg-slate-100 px-1">_text_</span> for italic, or use the toolbar above to insert links or attach PDF/Word/Excel/PowerPoint files readers can download.
            </p>

            {/* Embedded media previews */}
            {(() => {
              const images = [...(form.content.matchAll(/\[image\](https?:\/\/[^\]]+)\[\/image\]/g))].map(m => m[1]);
              const videos = [...(form.content.matchAll(/\[video\](https?:\/\/[^\]]+)\[\/video\]/g))].map(m => m[1]);
              if (images.length === 0 && videos.length === 0) return null;
              return (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Embedded media ({images.length + videos.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {images.map((src, i) => (
                      <div key={`pi${i}`} className="relative group">
                        <img
                          src={src}
                          alt=""
                          className="h-20 w-28 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => set('content', form.content.replace(`[image]${src}[/image]`, ''))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black hidden group-hover:flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {videos.map((src, i) => (
                      <div key={`pv${i}`} className="relative group h-20 w-28 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                        <video src={src} className="h-full w-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={20} className="text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => set('content', form.content.replace(`[video]${src}[/video]`, ''))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black hidden group-hover:flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Attached document previews */}
            {(() => {
              const files = [...(form.content.matchAll(/\[file\]([^|]+)\|([^|]*)\|(\d*)\[\/file\]/g))]
                .map(m => ({ raw: m[0], url: m[1], name: m[2] || 'Document', size: Number(m[3]) || 0 }));
              if (files.length === 0) return null;
              return (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Attached documents ({files.length})
                  </p>
                  <div className="space-y-1.5">
                    {files.map((f, i) => (
                      <div key={`pf${i}`} className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-xs font-bold text-slate-700 truncate flex items-center gap-1.5 min-w-0">
                          <FileText size={13} className="shrink-0" />
                          <span className="truncate">{f.name}</span>
                          {f.size > 0 && <span className="text-slate-400 font-normal shrink-0">({Math.max(1, Math.round(f.size / 1024))} KB)</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => set('content', form.content.replace(f.raw, ''))}
                          className="text-red-500 hover:text-red-600 text-sm font-black shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Schedule (optional) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">
              Schedule for later (optional) — publishes automatically once the time passes, usually within a minute
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full border-b-2 border-slate-200 py-2.5 text-sm focus:outline-none focus:border-ashanti-gold transition-all"
            />
          </div>

          {currentStatus === 'draft' && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">This article is currently a draft — not visible on the public site.</p>
          )}

          {/* Save Draft / Publish buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving || uploading}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] border-2 border-slate-200 text-slate-500 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('publish')}
              disabled={saving || uploading}
              className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm md:text-base ${
                isEdit
                  ? 'bg-[#1a0a35] text-white hover:bg-black'
                  : 'bg-ashanti-gold text-black'
              }`}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : isEdit ? <PenLine size={18} /> : <Share2 size={18} />}
              <span>
                {saving
                  ? (isEdit ? 'Saving…' : 'Publishing…')
                  : scheduledAt && new Date(scheduledAt) > new Date()
                    ? 'Schedule'
                    : (isEdit ? 'Publish Changes' : 'Publish Story')}
              </span>
            </button>
          </div>

          <div className="h-4 md:h-0" />
        </div>
      </motion.div>
    </div>
  );
}
