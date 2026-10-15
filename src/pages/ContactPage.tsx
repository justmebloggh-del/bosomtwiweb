import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, Check, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import KenteBanner from '../components/KenteBanner';

function FacebookIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function InstagramIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
}

const SUBJECTS = ['General Inquiry', 'News Tip', 'Advertising', 'Partnership', 'Press Release', 'Complaint / Correction', 'Technical Issue', 'Other'];

export default function ContactPage({ onBack }: { onBack?: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name:    form.name.trim(),
        email:   form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      if (error) throw new Error(error.message);
      setStatus('success');
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please email us directly.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-news-bg text-news-text">

      <KenteBanner
        title="Contact Us"
        badge="Get In Touch"
        description="Have a news tip, partnership inquiry, or question? Our team responds within 24 hours."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: contact info */}
          <aside className="lg:col-span-1 space-y-8">

            {/* Office info cards */}
            {[
              {
                Icon: MapPin,
                title: 'Newsroom',
                lines: ['Kumasi, Ashanti Region', 'Ghana, West Africa'],
              },
              {
                Icon: Phone,
                title: 'Newsroom Hotline',
                lines: ['+233 (0) 241 963 600'],
              },
              {
                Icon: Mail,
                title: 'Editorial Email',
                lines: ['bosomtwiweb@gmail.com'],
              },
              {
                Icon: Clock,
                title: 'Editorial Hours',
                lines: ['Monday – Friday: 6 AM – 11 PM', 'Saturday – Sunday: 7 AM – 9 PM'],
              },
            ].map(({ Icon, title, lines }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-news-card border border-news-border rounded-2xl">
                <div className="w-10 h-10 bg-ashanti-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-ashanti-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-news-muted mb-1">{title}</p>
                  {lines.map(l => (
                    <p key={l} className="text-sm font-medium text-news-text">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="p-5 bg-news-card border border-news-border rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-news-muted mb-4">Follow Us</p>
              <div className="space-y-3">
                {[
                  { Icon: FacebookIcon, label: 'Bosomtwi Web Portal', href: 'https://www.facebook.com/share/1B519RZZYj/' },
                  { Icon: InstagramIcon, label: '@bosomtwi_web', href: 'https://www.instagram.com/bosomtwi_web' },
                ].map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-news-muted hover:text-ashanti-gold transition-colors group">
                    <span className="w-8 h-8 rounded-lg border border-news-border group-hover:border-ashanti-gold group-hover:bg-ashanti-gold/10 flex items-center justify-center transition-all">
                      <Icon />
                    </span>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: form */}
          <div className="lg:col-span-2">
            <div className="bg-news-card border border-news-border rounded-3xl p-8 md:p-10">
              <h2 className="font-heading text-2xl font-bold text-news-text mb-2">Send Us a Message</h2>
              <p className="text-news-muted text-sm mb-8">All fields marked * are required. We do not share your information.</p>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Check size={28} className="text-green-500" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-news-text">Message Sent!</h3>
                    <p className="text-news-muted text-sm max-w-sm">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button onClick={() => setStatus('idle')}
                      className="mt-4 px-8 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Full Name *</label>
                        <input type="text" value={form.name} onChange={set('name')} required
                          placeholder="e.g. Kwame Asante"
                          className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Email Address *</label>
                        <input type="email" value={form.email} onChange={set('email')} required
                          placeholder="you@example.com"
                          className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Subject *</label>
                      <select value={form.subject} onChange={set('subject')}
                        className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2">Message *</label>
                      <textarea value={form.message} onChange={set('message')} required rows={6}
                        placeholder="Tell us how we can help…"
                        className="w-full bg-brand-surface border border-news-border rounded-xl px-4 py-4 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted resize-none" />
                    </div>

                    {status === 'error' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-start gap-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <button type="submit" disabled={status === 'sending'}
                        className="flex items-center gap-2 px-8 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-news-text hover:text-ashanti-gold transition-all shadow-lg text-[11px] disabled:opacity-50">
                        {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {status === 'sending' ? 'Sending…' : 'Send Message'}
                      </button>
                      {onBack && (
                        <button type="button" onClick={onBack}
                          className="text-[11px] font-bold uppercase tracking-widest text-news-muted hover:text-news-text transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
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
