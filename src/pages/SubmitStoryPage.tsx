import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Check, AlertCircle, Loader2, Image, FileText, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import KenteBanner from '../components/KenteBanner';

interface SubmitStoryPageProps {
  onNavigate?: (page: string) => void;
}

const CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle', 'Health', 'Local', 'International', 'Education', 'Community'];

const GUIDELINES = [
  { Icon: FileText, title: 'Original Content', desc: 'Your story must be original and not published elsewhere.' },
  { Icon: ShieldCheck, title: 'Accuracy First', desc: 'Verify all facts. Provide sources where possible.' },
  { Icon: Image, title: 'Media Welcome', desc: 'Attach photos or video links to make your story compelling.' },
  { Icon: PenLine, title: 'Editorial Review', desc: 'All submissions are reviewed by our editors before publication.' },
];

export default function SubmitStoryPage({ onNavigate }: SubmitStoryPageProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    title: '', category: CATEGORIES[0],
    story: '', image_url: '', source: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.title.trim() || !form.story.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('story_submissions').insert({
        name:      form.name.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || null,
        title:     form.title.trim(),
        category:  form.category,
        story:     form.story.trim(),
        image_url: form.image_url.trim() || null,
        source:    form.source.trim() || null,
      });
      if (error) throw new Error(error.message);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', title: '', category: CATEGORIES[0], story: '', image_url: '', source: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit your story. Please email us at bosomtwiweb@gmail.com');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-news-bg text-news-text">

      <KenteBanner
        title="Submit a Story"
        badge="Citizen Journalism"
        description="Have a community story the world should know about? Share it with us and help shape the news."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: guidelines */}
          <aside className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-news-text mb-5">Submission Guidelines</h2>
              <div className="space-y-4">
                {GUIDELINES.map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 bg-news-card border border-news-border rounded-xl">
                    <div className="w-9 h-9 bg-ashanti-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-ashanti-gold" />
                    </div>
                    <div>
                      <p className="font-bold text-news-text text-sm mb-0.5">{title}</p>
                      <p className="text-news-muted text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-ashanti-green/10 border border-ashanti-green/20 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-2">What happens next?</p>
              <ol className="space-y-2 text-sm text-news-muted">
                {[
                  'We review your submission within 24 hours.',
                  'Our editors may contact you for more details.',
                  'Approved stories are published with your name credited.',
                  'You\'ll receive an email when your story goes live.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-black text-ashanti-gold shrink-0 w-4">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-5 bg-news-card border border-news-border rounded-2xl text-sm text-news-muted">
              <p className="font-bold text-news-text mb-1">Prefer to call?</p>
              <p>Reach our newsroom directly:</p>
              <p className="font-bold text-ashanti-gold mt-1">+233 (0) 241 963 600</p>
            </div>
          </aside>

          {/* Right: form */}
          <div className="lg:col-span-2">
            <div className="bg-news-card border border-news-border rounded-3xl p-8 md:p-10">
              <h2 className="font-heading text-2xl font-bold text-news-text mb-2">Your Story</h2>
              <p className="text-news-muted text-sm mb-8">Fields marked * are required. Your contact info is kept confidential.</p>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Check size={28} className="text-green-500" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-news-text">Story Submitted!</h3>
                    <p className="text-news-muted text-sm max-w-sm">
                      Thank you for contributing to community journalism. Our editors will review your story and be in touch within 24 hours.
                    </p>
                    <button onClick={() => setStatus('idle')}
                      className="mt-4 px-8 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                      Submit Another Story
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Reporter info */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-4">Your Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Full Name *</label>
                          <input type="text" value={form.name} onChange={set('name')} required
                            placeholder="Your name"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Email Address *</label>
                          <input type="email" value={form.email} onChange={set('email')} required
                            placeholder="your@email.com"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Phone (Optional)</label>
                          <input type="tel" value={form.phone} onChange={set('phone')}
                            placeholder="+233 XXX XXX XXX"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Story Category *</label>
                          <select value={form.category} onChange={set('category')}
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Story content */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-4">Story Details</p>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Headline / Story Title *</label>
                          <input type="text" value={form.title} onChange={set('title')} required
                            placeholder="A compelling headline for your story"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Your Story *</label>
                          <textarea value={form.story} onChange={set('story')} required rows={8}
                            placeholder="Tell us everything. Who, what, where, when, why? Include as much detail as possible. Minimum 100 words recommended."
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-4 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted resize-none" />
                          <p className="text-[10px] text-news-muted mt-1">{form.story.trim().split(/\s+/).filter(Boolean).length} words</p>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Photo / Image URL (Optional)</label>
                          <input type="url" value={form.image_url} onChange={set('image_url')}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                          <p className="text-[10px] text-news-muted mt-1">Paste a link to a publicly accessible image you took.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Sources / References (Optional)</label>
                          <input type="text" value={form.source} onChange={set('source')}
                            placeholder="e.g. Eyewitness, official statement, website URL"
                            className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                        </div>
                      </div>
                    </div>

                    {status === 'error' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-start gap-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    <p className="text-[11px] text-news-muted">
                      By submitting you agree to our{' '}
                      <button type="button" onClick={() => onNavigate?.('terms')} className="text-ashanti-gold hover:underline">Terms of Service</button>
                      {' '}and confirm the information is accurate to the best of your knowledge.
                    </p>

                    <button type="submit" disabled={status === 'sending'}
                      className="flex items-center gap-2 px-8 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-news-text hover:text-ashanti-gold transition-all shadow-lg text-[11px] disabled:opacity-50">
                      {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
                      {status === 'sending' ? 'Submitting…' : 'Submit Story'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
