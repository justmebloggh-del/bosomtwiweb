import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Megaphone, Briefcase, GraduationCap, Calendar, Heart,
  ArrowRight, BarChart2, Check, MapPin, ExternalLink
} from 'lucide-react';
import KenteBanner from '../components/KenteBanner';

interface CommunityPageProps {
  onNavigate?: (page: string) => void;
}

// ── Mock data ────────────────────────────────────────────────────

const EVENTS = [
  {
    id: 1,
    title: 'Bosomtwe Lake Festival 2025',
    date: '28 June 2025',
    location: 'Lake Bosomtwe, Ashanti',
    category: 'Culture',
    description: 'Annual celebration of the sacred crater lake with music, canoe racing, and traditional ceremonies.',
    image: 'https://images.unsplash.com/photo-1606591198835-36b6b0547da5?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    title: 'Kumasi Tech Summit 2025',
    date: '14 July 2025',
    location: 'KNUST Great Hall, Kumasi',
    category: 'Technology',
    description: 'A gathering of Africa\'s brightest tech minds discussing AI, fintech, and digital innovation.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    title: 'Ashanti Youth Entrepreneurship Expo',
    date: '2 August 2025',
    location: 'Kumasi City Mall, Kumasi',
    category: 'Business',
    description: 'Young entrepreneurs showcase innovative startups and compete for seed funding.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=600',
  },
];

const JOBS = [
  {
    id: 1,
    title: 'Digital Marketing Officer',
    company: 'Ashanti Gold Bank',
    location: 'Kumasi',
    type: 'Full-Time',
    deadline: '30 June 2025',
    category: 'Marketing',
  },
  {
    id: 2,
    title: 'Software Engineer (React)',
    company: 'Kumasi Innovation Hub',
    location: 'Kumasi / Remote',
    type: 'Full-Time',
    deadline: '15 July 2025',
    category: 'Technology',
  },
  {
    id: 3,
    title: 'Community Journalist',
    company: 'Bosomtwi Web',
    location: 'Kumasi',
    type: 'Contract',
    deadline: '25 June 2025',
    category: 'Media',
  },
  {
    id: 4,
    title: 'Agricultural Extension Officer',
    company: 'Ministry of Food & Agriculture',
    location: 'Bosomtwe District',
    type: 'Government',
    deadline: '5 July 2025',
    category: 'Agriculture',
  },
];

const SCHOLARSHIPS = [
  {
    id: 1,
    title: 'Otumfuo Foundation Scholarship 2025',
    funder: 'Manhyia Palace',
    level: 'Undergraduate & Postgraduate',
    deadline: '31 July 2025',
    amount: 'Full tuition + stipend',
    description: 'Merit-based scholarship for academically brilliant students from the Ashanti Region.',
  },
  {
    id: 2,
    title: 'Ghana Education Trust Fund (GETFund)',
    funder: 'Government of Ghana',
    level: 'Undergraduate',
    deadline: '30 June 2025',
    amount: 'GH₵8,000 / year',
    description: 'National scholarship for Ghanaian students demonstrating financial need and academic excellence.',
  },
  {
    id: 3,
    title: 'KNUST Alumni Endowment Fund',
    funder: 'KNUST Alumni Association',
    level: 'Postgraduate',
    deadline: '15 August 2025',
    amount: 'GH₵15,000 total',
    description: 'Supporting KNUST graduate students in STEM, Business, and Social Sciences.',
  },
];

const POLLS = [
  {
    id: 1,
    question: 'Are you satisfied with road infrastructure in the Bosomtwe District?',
    options: [
      { label: 'Very satisfied', pct: 12 },
      { label: 'Somewhat satisfied', pct: 25 },
      { label: 'Not satisfied', pct: 45 },
      { label: 'No opinion', pct: 18 },
    ],
    total: 3_241,
  },
  {
    id: 2,
    question: 'Which issue should the Ashanti Regional Assembly prioritize?',
    options: [
      { label: 'Healthcare improvement', pct: 38 },
      { label: 'Youth employment', pct: 29 },
      { label: 'Road construction', pct: 21 },
      { label: 'Education funding', pct: 12 },
    ],
    total: 2_108,
  },
];

// ── Sub-components ───────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active ? 'bg-ashanti-gold text-black shadow-md' : 'bg-brand-surface text-news-muted hover:text-ashanti-gold border border-news-border'
      }`}>
      {children}
    </button>
  );
}

function Poll({ poll }: { poll: typeof POLLS[0] }) {
  const [voted, setVoted] = useState<number | null>(null);
  return (
    <div className="bg-news-card border border-news-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={15} className="text-ashanti-gold" />
        <span className="text-[9px] font-black uppercase tracking-widest text-news-muted">Community Poll</span>
      </div>
      <h4 className="font-heading font-bold text-news-text text-lg leading-snug mb-5">{poll.question}</h4>
      <div className="space-y-3">
        {poll.options.map((opt, i) => (
          <button key={i} onClick={() => setVoted(i)} disabled={voted !== null}
            className={`w-full text-left rounded-xl overflow-hidden border transition-all ${voted === i ? 'border-ashanti-gold' : 'border-news-border hover:border-ashanti-gold/40'}`}>
            <div className="flex items-center justify-between px-4 py-2.5 relative">
              {voted !== null && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="h-full bg-ashanti-gold/10 transition-all duration-700" style={{ width: `${opt.pct}%` }} />
                </div>
              )}
              <span className={`relative text-sm font-medium z-10 ${voted === i ? 'text-ashanti-gold font-bold' : 'text-news-text'}`}>{opt.label}</span>
              {voted !== null && <span className="relative z-10 text-[11px] font-black text-ashanti-gold">{opt.pct}%</span>}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-news-muted mt-4">
        {voted !== null ? `${(poll.total + 1).toLocaleString()} votes — thank you!` : `${poll.total.toLocaleString()} votes so far`}
      </p>
    </div>
  );
}

const CAT_COLORS: Record<string, string> = {
  Culture: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Business: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Agriculture: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Government: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// ── Main page ────────────────────────────────────────────────────

type Tab = 'events' | 'jobs' | 'scholarships' | 'polls';

export default function CommunityPage({ onNavigate }: CommunityPageProps) {
  const [tab, setTab] = useState<Tab>('events');

  const TABS: { id: Tab; label: string; Icon: typeof Users }[] = [
    { id: 'events',       label: 'Events',       Icon: Calendar },
    { id: 'jobs',         label: 'Job Board',     Icon: Briefcase },
    { id: 'scholarships', label: 'Scholarships',  Icon: GraduationCap },
    { id: 'polls',        label: 'Polls',         Icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-news-bg text-news-text">

      <KenteBanner
        title="Community Hub"
        badge="Your Community"
        description="Events, jobs, scholarships, polls, and community voices from across the Bosomtwe District and Ashanti Region."
        count={`${EVENTS.length} events · ${JOBS.length} jobs · ${SCHOLARSHIPS.length} scholarships`}
      />

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div className="bg-ashanti-green/10 border-b border-news-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { Icon: Calendar,      label: 'Upcoming Events',   value: `${EVENTS.length}` },
              { Icon: Briefcase,     label: 'Open Positions',    value: `${JOBS.length}` },
              { Icon: GraduationCap, label: 'Scholarships',      value: `${SCHOLARSHIPS.length}` },
              { Icon: Users,         label: 'Community Members', value: '24K+' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ashanti-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-ashanti-gold" />
                </div>
                <div>
                  <div className="font-heading text-2xl font-bold text-news-text leading-none">{value}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-news-muted">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10">
          {TABS.map(({ id, label }) => (
            <TabButton key={id} active={tab === id} onClick={() => setTab(id)}>{label}</TabButton>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Events ────────────────────────────────────────── */}
          {tab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {EVENTS.map(ev => (
                  <div key={ev.id} className="bg-news-card border border-news-border rounded-2xl overflow-hidden hover:border-ashanti-gold/40 hover:shadow-xl transition-all group">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${CAT_COLORS[ev.category] || 'bg-ashanti-gold text-black'}`}>
                        {ev.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-news-text group-hover:text-ashanti-gold transition-colors mb-2 leading-snug">{ev.title}</h3>
                      <p className="text-news-muted text-sm mb-4 line-clamp-2">{ev.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-news-muted font-bold">
                          <Calendar size={12} className="text-ashanti-gold shrink-0" />
                          {ev.date}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-news-muted font-bold">
                          <MapPin size={12} className="text-ashanti-gold shrink-0" />
                          {ev.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-news-muted text-sm">Know of an upcoming event?{' '}
                  <button onClick={() => onNavigate?.('submit')} className="text-ashanti-gold font-bold hover:underline">Submit it here</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Jobs ──────────────────────────────────────────── */}
          {tab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {JOBS.map(job => (
                  <div key={job.id} className="bg-news-card border border-news-border rounded-2xl p-6 hover:border-ashanti-gold/40 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-ashanti-gold/10 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase size={20} className="text-ashanti-gold" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors mb-0.5">{job.title}</h3>
                        <p className="text-sm text-news-muted font-medium">{job.company} · {job.location}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${CAT_COLORS[job.type] || 'bg-brand-surface text-news-muted border border-news-border'}`}>
                            {job.type}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${CAT_COLORS[job.category] || 'bg-brand-surface text-news-muted border border-news-border'}`}>
                            {job.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-2">Deadline</p>
                      <p className="text-sm font-bold text-news-text">{job.deadline}</p>
                      <button className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-ashanti-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all">
                        Apply <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-brand-surface border border-news-border rounded-2xl text-center">
                <Megaphone size={20} className="text-ashanti-gold mx-auto mb-3" />
                <h4 className="font-heading font-bold text-news-text mb-1">Post a Job</h4>
                <p className="text-news-muted text-sm mb-4">Reach 24,000+ professionals in the Ashanti Region.</p>
                <button onClick={() => onNavigate?.('advertise')}
                  className="px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                  Post a Vacancy
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Scholarships ──────────────────────────────────── */}
          {tab === 'scholarships' && (
            <motion.div key="scholarships" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-6">
                {SCHOLARSHIPS.map(sc => (
                  <div key={sc.id} className="bg-news-card border border-news-border rounded-2xl p-6 hover:border-ashanti-gold/40 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-ashanti-gold/10 rounded-xl flex items-center justify-center shrink-0">
                          <GraduationCap size={22} className="text-ashanti-gold" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-news-text group-hover:text-ashanti-gold transition-colors mb-1 leading-snug">{sc.title}</h3>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-news-muted mb-2">{sc.funder}</p>
                          <p className="text-sm text-news-muted leading-relaxed">{sc.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm text-right space-y-2">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-news-muted">Level</p>
                          <p className="font-bold text-news-text">{sc.level}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-news-muted">Award</p>
                          <p className="font-bold text-ashanti-gold">{sc.amount}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-news-muted">Deadline</p>
                          <p className="font-bold text-news-text">{sc.deadline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-news-border flex items-center gap-3">
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-ashanti-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all">
                        Apply Now <ExternalLink size={11} />
                      </button>
                      <span className="text-[10px] text-news-muted">Applications open</span>
                      <Check size={12} className="text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-ashanti-green/10 border border-ashanti-green/20 rounded-2xl">
                <div className="flex items-start gap-4">
                  <Heart size={20} className="text-ashanti-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-news-text mb-1">Know of a Scholarship?</h4>
                    <p className="text-news-muted text-sm">Help fellow Ghanaians by sharing scholarship opportunities you've come across.</p>
                    <button onClick={() => onNavigate?.('submit')}
                      className="mt-3 text-[11px] font-black uppercase tracking-widest text-ashanti-gold hover:text-news-text transition-colors flex items-center gap-1.5">
                      Submit Info <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Polls ─────────────────────────────────────────── */}
          {tab === 'polls' && (
            <motion.div key="polls" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {POLLS.map(poll => <Poll key={poll.id} poll={poll} />)}
              </div>
              <div className="mt-8 p-6 bg-brand-surface border border-news-border rounded-2xl text-center">
                <BarChart2 size={20} className="text-ashanti-gold mx-auto mb-3" />
                <h4 className="font-heading font-bold text-news-text mb-1">Suggest a Poll Topic</h4>
                <p className="text-news-muted text-sm mb-4">What community issue should we poll on next?</p>
                <button onClick={() => onNavigate?.('contact')}
                  className="px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                  Suggest a Topic
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
