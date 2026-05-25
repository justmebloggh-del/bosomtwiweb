import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import KenteBanner from '../components/KenteBanner';

const ROLES = [
  {
    id: 1, title: 'Senior Political Reporter', dept: 'Editorial', type: 'Full-time', location: 'Kumasi, Ghana',
    desc: 'Cover Ashanti Region politics, parliamentary proceedings, and governance accountability with depth and rigor.',
    reqs: ['5+ years political journalism experience', 'Strong contacts within Ashanti Region politics', 'Ability to work under tight deadlines', 'Proficiency in English and Twi'],
  },
  {
    id: 2, title: 'Digital Video Producer', dept: 'Multimedia', type: 'Full-time', location: 'Kumasi, Ghana',
    desc: 'Produce, shoot, and edit video news packages for our YouTube channel and website. Drive our video-first strategy.',
    reqs: ['Proficiency in Adobe Premiere Pro or Final Cut', '3+ years news video production', 'Social media video optimization experience', 'Own transport preferred'],
  },
  {
    id: 3, title: 'Community Correspondent', dept: 'Editorial', type: 'Freelance', location: 'Ashanti Region (Remote)',
    desc: 'Report on community stories from across the Ashanti Region. Work independently and pitch compelling local stories.',
    reqs: ['Proven journalism or community reporting experience', 'Smartphone journalism skills', 'Deep community connections', 'Self-motivated and deadline-driven'],
  },
  {
    id: 4, title: 'Social Media Manager', dept: 'Digital', type: 'Full-time', location: 'Kumasi, Ghana',
    desc: 'Manage and grow Bosomtwi Web\'s presence across Facebook, Instagram, TikTok, X, and YouTube.',
    reqs: ['3+ years social media management', 'Analytics and content scheduling tools', 'Video and graphic design skills', 'News media background a plus'],
  },
  {
    id: 5, title: 'Business & Economy Reporter', dept: 'Editorial', type: 'Full-time', location: 'Kumasi, Ghana',
    desc: 'Cover business news, market trends, and economic developments affecting the Ashanti Region and Ghana.',
    reqs: ['Business journalism or economics background', 'Financial reporting experience', 'Data analysis capabilities', 'Network within local business community'],
  },
  {
    id: 6, title: 'Web Developer (React/TypeScript)', dept: 'Technology', type: 'Contract', location: 'Remote / Kumasi',
    desc: 'Help build and maintain our digital platform. Work on new features, performance improvements, and reader experience.',
    reqs: ['React + TypeScript proficiency', 'TailwindCSS experience', 'Supabase or PostgreSQL experience', 'News media tech understanding'],
  },
];

const DEPT_COLORS: Record<string, string> = {
  Editorial: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  Multimedia: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  Digital: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  Technology: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
};

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'text-ashanti-gold',
  'Freelance': 'text-green-500',
  'Contract': 'text-purple-500',
};

interface ApplyFormProps { role: typeof ROLES[0]; onClose: () => void; }

function ApplyForm({ role, onClose }: ApplyFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cover: '', portfolio: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');
    try {
      const { error } = await supabase.from('career_applications').insert({
        role_title: role.title,
        department: role.dept,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        cover_letter: form.cover.trim(),
        portfolio_url: form.portfolio.trim() || null,
      });
      if (error) throw new Error(error.message);
      setStatus('success');
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to submit. Email us at careers@bosomtwi.web');
      setStatus('error');
    }
  };

  const inputClass = 'w-full bg-brand-surface border border-news-border rounded-xl px-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted';
  const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-news-muted mb-2';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-xl bg-news-card border border-news-border rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-news-border">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-1">Applying for</p>
          <h3 className="font-heading text-xl font-black text-news-text">{role.title}</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center">
                <Check size={24} className="text-green-500" />
              </div>
              <h4 className="font-heading text-lg font-bold text-news-text">Application Received!</h4>
              <p className="text-news-muted text-sm max-w-xs">Thank you for applying. We'll be in touch within 5 business days.</p>
              <button onClick={onClose} className="mt-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px]">Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className={labelClass}>Full Name *</label><input type="text" value={form.name} onChange={set('name')} required placeholder="Your name" className={inputClass} /></div>
                <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" className={inputClass} /></div>
                <div><label className={labelClass}>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+233 XXX XXX XXX" className={inputClass} /></div>
                <div><label className={labelClass}>Portfolio / LinkedIn</label><input type="url" value={form.portfolio} onChange={set('portfolio')} placeholder="https://..." className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Cover Letter *</label>
                <textarea value={form.cover} onChange={set('cover')} required rows={5}
                  placeholder="Tell us why you're the right person for this role..."
                  className={`${inputClass} resize-none`} />
              </div>
              {status === 'error' && (
                <div className="flex items-start gap-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errMsg}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 px-5 py-3 bg-news-card border border-news-border text-news-text font-black uppercase tracking-widest rounded-xl text-[11px] hover:border-ashanti-gold transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={status === 'sending'}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all disabled:opacity-50">
                  {status === 'sending' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {status === 'sending' ? 'Sending…' : 'Apply Now'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CareersPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [applying, setApplying] = useState<typeof ROLES[0] | null>(null);

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="Careers at Bosomtwi Web"
        badge="Join Our Team"
        description="Help us tell the stories that matter. We're looking for passionate journalists, creatives, and technologists."
        count={`${ROLES.length} open roles`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="mb-10 p-6 bg-ashanti-green/10 border border-ashanti-green/20 rounded-2xl">
          <h2 className="font-heading font-bold text-news-text mb-2">Why Work With Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { title: 'Impactful Work', desc: 'Your journalism reaches over a million readers monthly.' },
              { title: 'Growth Culture', desc: 'Training, mentorship, and career development built in.' },
              { title: 'Flexible Options', desc: 'Remote and hybrid roles available for most positions.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 bg-news-card border border-news-border rounded-xl">
                <p className="font-bold text-news-text text-sm mb-1">{title}</p>
                <p className="text-news-muted text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-6">Open Positions ({ROLES.length})</p>

        <div className="space-y-4">
          {ROLES.map(role => (
            <motion.div key={role.id} layout className="bg-news-card border border-news-border rounded-2xl overflow-hidden hover:border-ashanti-gold/30 transition-all">
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => setExpanded(expanded === role.id ? null : role.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${DEPT_COLORS[role.dept] ?? ''}`}>{role.dept}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${TYPE_COLORS[role.type] ?? 'text-news-muted'}`}>{role.type}</span>
                  </div>
                  <h3 className="font-heading font-bold text-news-text">{role.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-news-muted"><MapPin size={10} />{role.location}</span>
                    <span className="flex items-center gap-1 text-[10px] text-news-muted"><Clock size={10} />{role.type}</span>
                  </div>
                </div>
                {expanded === role.id ? <ChevronUp size={18} className="text-news-muted shrink-0" /> : <ChevronDown size={18} className="text-news-muted shrink-0" />}
              </button>

              <AnimatePresence>
                {expanded === role.id && (
                  <motion.div key="details" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-news-border">
                    <div className="p-5 space-y-4">
                      <p className="text-news-muted text-sm leading-relaxed">{role.desc}</p>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-3">Requirements</p>
                        <ul className="space-y-1.5">
                          {role.reqs.map(r => (
                            <li key={r} className="flex items-start gap-2 text-sm text-news-muted">
                              <Briefcase size={12} className="text-ashanti-gold shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button onClick={() => setApplying(role)}
                        className="flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                        <Send size={12} /> Apply for This Role
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-news-card border border-news-border rounded-2xl text-center">
          <p className="font-bold text-news-text mb-1">Don't see a matching role?</p>
          <p className="text-news-muted text-sm mb-4">Send a speculative application — we're always looking for exceptional talent.</p>
          <a href="mailto:careers@bosomtwi.web"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ashanti-gold/10 border border-ashanti-gold/30 text-ashanti-gold font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-ashanti-gold hover:text-black transition-all">
            <Send size={12} /> careers@bosomtwi.web
          </a>
        </div>
      </div>

      <AnimatePresence>
        {applying && <ApplyForm role={applying} onClose={() => setApplying(null)} />}
      </AnimatePresence>
    </div>
  );
}
