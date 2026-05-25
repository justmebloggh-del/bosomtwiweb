import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldX, AlertTriangle, HelpCircle, Search, ExternalLink, Clock } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';

type Verdict = 'true' | 'false' | 'misleading' | 'unverified';

interface FactCheck {
  id: number;
  claim: string;
  verdict: Verdict;
  summary: string;
  sources: string[];
  author: string;
  date: string;
  category: string;
}

const FACT_CHECKS: FactCheck[] = [
  {
    id: 1, claim: 'The Kumasi Central Market will be relocated by end of 2025', verdict: 'misleading',
    summary: 'The Kumasi Metropolitan Assembly has discussed plans, but no official relocation date has been set. Current proposals are under feasibility review.',
    sources: ['KMA Official Statement, March 2025', 'Daily Graphic, April 2025'], author: 'Abena Osei-Bonsu', date: '2025-05-20', category: 'Local Government',
  },
  {
    id: 2, claim: 'Ghana\'s inflation rate fell below 10% in April 2025', verdict: 'true',
    summary: 'According to the Ghana Statistical Service, the Consumer Price Index shows inflation at 8.4% in April 2025, down from 13.2% in January.',
    sources: ['Ghana Statistical Service Report, May 2025', 'Bank of Ghana Monetary Policy Committee'], author: 'Yaw Mensah', date: '2025-05-18', category: 'Economy',
  },
  {
    id: 3, claim: 'Asante Kotoko was sold to a foreign investor group', verdict: 'false',
    summary: 'No credible source confirms this claim. Asante Kotoko management has officially denied any ownership change discussions with foreign investors.',
    sources: ['Asante Kotoko Official Statement', 'GFA Media Release'], author: 'Kofi Acheampong', date: '2025-05-15', category: 'Sports',
  },
  {
    id: 4, claim: 'A new hospital is being built in Ejisu by the government', verdict: 'unverified',
    summary: 'Reports circulating on social media remain unconfirmed. We have contacted the Ministry of Health and Ejisu Municipal Assembly and await response.',
    sources: ['Awaiting official response'], author: 'Adwoa Frimpong', date: '2025-05-12', category: 'Health',
  },
  {
    id: 5, claim: 'New mining regulations will ban small-scale galamsey by June 2025', verdict: 'misleading',
    summary: 'Regulations passed target illegal operations in protected water bodies, not all small-scale mining. Licensed small-scale miners are not affected.',
    sources: ['Minerals Commission Act 2025 Amendment', 'Environmental Protection Agency Statement'], author: 'Kwame Asante Boateng', date: '2025-05-10', category: 'Environment',
  },
  {
    id: 6, claim: 'A new university campus will open in Kumasi next academic year', verdict: 'unverified',
    summary: 'Plans for a satellite campus have been announced but construction has not begun. An opening next academic year appears highly unlikely.',
    sources: ['KNUST Media Office (no confirmation)'], author: 'Akosua Mensah', date: '2025-05-08', category: 'Education',
  },
];

const VERDICT_CONFIG: Record<Verdict, { icon: typeof ShieldCheck; label: string; bg: string; text: string; border: string }> = {
  true:       { icon: ShieldCheck,  label: 'True',       bg: 'bg-green-50 dark:bg-green-950/20',  text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  false:      { icon: ShieldX,      label: 'False',      bg: 'bg-red-50 dark:bg-red-950/20',     text: 'text-red-700 dark:text-red-400',     border: 'border-red-200 dark:border-red-800' },
  misleading: { icon: AlertTriangle, label: 'Misleading', bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  unverified: { icon: HelpCircle,   label: 'Unverified', bg: 'bg-gray-50 dark:bg-gray-900/30',   text: 'text-gray-600 dark:text-gray-400',   border: 'border-gray-200 dark:border-gray-700' },
};

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function FactCheckPage() {
  const [filter, setFilter] = useState<Verdict | 'all'>('all');
  const [query, setQuery] = useState('');

  const verdictCounts = (['true', 'false', 'misleading', 'unverified'] as Verdict[]).reduce(
    (acc, v) => ({ ...acc, [v]: FACT_CHECKS.filter(f => f.verdict === v).length }), {} as Record<Verdict, number>
  );

  const filtered = FACT_CHECKS.filter(fc => {
    const matchVerdict = filter === 'all' || fc.verdict === filter;
    const matchQuery = query.length < 2 || fc.claim.toLowerCase().includes(query.toLowerCase()) || fc.category.toLowerCase().includes(query.toLowerCase());
    return matchVerdict && matchQuery;
  });

  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="Fact Check"
        badge="Truth in Journalism"
        description="We investigate viral claims, political statements, and social media rumours so you don't have to."
        count={FACT_CHECKS.length}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {(['true', 'false', 'misleading', 'unverified'] as Verdict[]).map(v => {
            const cfg = VERDICT_CONFIG[v];
            const Icon = cfg.icon;
            return (
              <button key={v} onClick={() => setFilter(filter === v ? 'all' : v)}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${filter === v ? `${cfg.bg} ${cfg.border}` : 'bg-news-card border-news-border hover:border-ashanti-gold/30'}`}>
                <Icon size={20} className={filter === v ? cfg.text : 'text-news-muted'} />
                <span className={`font-black text-2xl mt-1 ${filter === v ? cfg.text : 'text-news-text'}`}>{verdictCounts[v]}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${filter === v ? cfg.text : 'text-news-muted'}`}>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-news-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search claims or categories…"
            className="w-full bg-news-card border border-news-border rounded-xl pl-11 pr-4 py-3 text-sm text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-muted" />
        </div>

        {/* Methodology note */}
        <div className="p-4 bg-ashanti-green/10 border border-ashanti-green/20 rounded-xl mb-8 flex items-start gap-3">
          <ShieldCheck size={16} className="text-ashanti-gold shrink-0 mt-0.5" />
          <p className="text-news-muted text-xs leading-relaxed">
            <strong className="text-news-text">Our methodology:</strong> We verify claims against primary sources, official statements, and documented evidence. We do not publish unverified verdicts without disclosing our reasoning.
          </p>
        </div>

        {/* Fact Checks */}
        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShieldCheck size={36} className="text-news-border mx-auto mb-3" />
              <p className="text-news-muted">No fact checks match your filter.</p>
            </div>
          ) : filtered.map((fc, i) => {
            const cfg = VERDICT_CONFIG[fc.verdict];
            const Icon = cfg.icon;
            return (
              <motion.div key={fc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.text} bg-white/50 dark:bg-black/20`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 ${cfg.text}`}>{cfg.label}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted">{fc.category}</span>
                    </div>
                    <p className="font-heading font-bold text-news-text text-sm mb-3 leading-snug">
                      Claim: "{fc.claim}"
                    </p>
                    <p className="text-news-muted text-sm leading-relaxed mb-4">{fc.summary}</p>
                    {fc.sources.length > 0 && fc.sources[0] !== 'Awaiting official response' && (
                      <div className="space-y-1 mb-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-news-muted mb-1.5">Sources</p>
                        {fc.sources.map(s => (
                          <div key={s} className="flex items-center gap-1.5 text-[10px] text-news-muted">
                            <ExternalLink size={9} className="shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-news-muted">
                      <span>By {fc.author}</span>
                      <span className="flex items-center gap-1"><Clock size={9} />{timeAgo(fc.date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Submit a claim */}
        <div className="mt-12 p-6 bg-news-card border border-news-border rounded-2xl text-center">
          <h3 className="font-heading font-bold text-news-text mb-2">Spot a rumour that needs checking?</h3>
          <p className="text-news-muted text-sm mb-4">Submit a claim and our fact-checking team will investigate.</p>
          <a href="mailto:factcheck@bosomtwi.web"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
            <ShieldCheck size={13} /> Submit a Claim
          </a>
        </div>
      </div>
    </div>
  );
}
