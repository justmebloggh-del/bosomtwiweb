import { useState, useEffect, useRef } from 'react';
import { Menu, Search, LogOut, ChevronDown, Radio, TrendingUp, Video, Archive, X, LayoutGrid, Moon, Sun, Tv, ChevronRight, Newspaper, Briefcase, Trophy, Film, Globe, GraduationCap, Heart, ShieldCheck, Mic, Building2, Users, PenLine, Send, Info, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function FacebookIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TikTokIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
    </svg>
  );
}

interface NavbarProps {
  user: any;
  dark: boolean;
  onDarkToggle: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onCategoryClick: (category: string) => void;
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
  onAdminClick?: () => void;
}

const CATEGORIES = [
  { label: 'News',          cat: 'News',          Icon: Newspaper },
  { label: 'Politics',      cat: 'Politics',      Icon: Globe },
  { label: 'Business',      cat: 'Business',      Icon: Briefcase },
  { label: 'Education',     cat: 'Education',     Icon: GraduationCap },
  { label: 'Sports',        cat: 'Sports',        Icon: Trophy },
  { label: 'Entertainment', cat: 'Entertainment', Icon: Film },
  { label: 'Lifestyle',     cat: 'Lifestyle',     Icon: Heart },
  { label: 'Technology',    cat: 'Technology',    Icon: Tv },
  { label: 'International', cat: 'International', Icon: Globe },
];

const QUICK_LINKS = [
  { id: 'trending', label: 'Trending', Icon: TrendingUp },
  { id: 'videos',   label: 'Videos',   Icon: Video },
  { id: 'live',     label: 'Live',     Icon: Radio, live: true },
  { id: 'archives', label: 'Archives', Icon: Archive },
];

const SOCIAL = [
  { Icon: FacebookIcon,  href: 'https://www.facebook.com/share/1B519RZZYj/?mibextid=wwXIfr', label: 'Facebook' },
  { Icon: InstagramIcon, href: 'https://www.instagram.com/bosomtwi_web?igsh=MXZoNXY5MWRmMzV3bQ%3D%3D', label: 'Instagram' },
  { Icon: YoutubeIcon,   href: 'https://youtube.com/@bosomtwi_web_news?si=Q1xhFNZ42xo4uKeM', label: 'YouTube' },
  { Icon: TikTokIcon,    href: 'https://www.tiktok.com/@bosomtwi_web_news', label: 'TikTok' },
];

function useDateTime() {
  const [dt, setDt] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setDt(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return dt;
}

export default function Navbar({ user, dark, onDarkToggle, onLogout, onLoginClick, onCategoryClick, onNavigate, onSearchOpen, onAdminClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [navBottom, setNavBottom] = useState(134);
  const navRef = useRef<HTMLElement>(null);
  const dt = useDateTime();

  useEffect(() => {
    const update = () => {
      if (navRef.current) setNavBottom(navRef.current.getBoundingClientRect().bottom);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  const close = () => { setMenuOpen(false); setMoreOpen(false); };

  const dateStr = dt.toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <nav ref={navRef} className="sticky top-0 z-50">

      {/* ── Strip 1: Social + Date + Auth ─────────────────────── */}
      <div className="bg-[#050505] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">

          {/* Social icons */}
          <div className="flex items-center gap-1">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-ashanti-gold transition-all">
                <Icon size={13} />
              </a>
            ))}
            <span className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
            <span className="hidden sm:block text-[10px] text-white/30 font-medium">{dateStr}</span>
          </div>

          {/* Right: quick links + auth */}
          <div className="flex items-center gap-0.5">
            {QUICK_LINKS.map(({ id, label, Icon, live }) => (
              <button key={id} onClick={() => onNavigate(id)}
                className="flex items-center gap-1.5 px-2.5 h-9 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-ashanti-gold transition-all">
                {live && (
                  <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
                <Icon size={11} />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}

            <span className="h-4 w-px bg-white/10 mx-1.5" />

            {user ? (
              <div className="flex items-center gap-1">
                {(user.role === 'journalist' || user.role === 'admin') && (
                  <button onClick={onAdminClick}
                    className="flex items-center gap-1 px-2.5 h-7 text-[9px] font-black uppercase tracking-widest text-ashanti-gold hover:bg-ashanti-gold/10 rounded transition-all">
                    <LayoutGrid size={10} /><span className="hidden sm:inline">Admin</span>
                  </button>
                )}
                <button onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 h-7 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors">
                  <LogOut size={10} /><span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button onClick={onLoginClick}
                className="px-3 h-6 bg-ashanti-gold text-black text-[9px] font-black uppercase tracking-widest rounded hover:bg-white transition-all ml-1">
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Strip 2: Logo + Nav + Search + Toggles ────────────── */}
      <div className="bg-news-bg/98 backdrop-blur-xl border-b border-news-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-[60px] gap-4">

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(true)}
            className="flex md:hidden p-2 text-news-text/50 hover:text-ashanti-gold transition-colors shrink-0 rounded-lg hover:bg-brand-surface">
            <Menu size={22} />
          </button>

          {/* Logo */}
          <button onClick={() => onCategoryClick('')} className="shrink-0 flex items-center group">
            <img src="/logo.png" alt="BOSOMTWIWEB" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center flex-1 h-full overflow-x-auto gap-0">
            {CATEGORIES.slice(0, 7).map(({ label, cat }) => (
              <button key={cat} onClick={() => onCategoryClick(cat)}
                className="text-[10px] uppercase tracking-[0.12em] font-bold text-news-text/55 hover:text-ashanti-gold px-2.5 h-full flex items-center border-b-2 border-transparent hover:border-ashanti-gold transition-all whitespace-nowrap">
                {label}
              </button>
            ))}
            {/* More mega-menu */}
            <div className="relative h-full flex items-center">
              <button onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-bold px-2.5 h-full border-b-2 transition-all ${moreOpen ? 'text-ashanti-gold border-ashanti-gold' : 'text-news-text/55 border-transparent hover:text-ashanti-gold hover:border-ashanti-gold'}`}>
                More <ChevronDown size={11} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setMoreOpen(false)} className="fixed inset-0 z-[49] bg-black/20 backdrop-blur-[2px]" />

                    {/* Mega panel — anchored to nav strip, full viewport width */}
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="fixed left-0 right-0 z-50 bg-news-card border-b border-news-border shadow-2xl"
                      style={{ top: navBottom }}
                    >
                      {/* Gold top accent line */}
                      <div className="h-[2px] bg-gradient-to-r from-ashanti-green via-ashanti-gold to-ashanti-green" />

                      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 grid grid-cols-4 gap-0">

                        {/* ── Col 1: More News Sections ── */}
                        <div className="pr-6 border-r border-news-border">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-ashanti-gold mb-4">More Sections</p>
                          <div className="space-y-0.5">
                            {[
                              { label: 'Technology',    cat: 'Technology',    Icon: Tv,           desc: 'Tech & innovation' },
                              { label: 'International', cat: 'International', Icon: Globe,         desc: 'World news' },
                              { label: 'Education',     cat: 'Education',     Icon: GraduationCap, desc: 'Schools & learning' },
                              { label: 'Health',        cat: 'Health',        Icon: Heart,         desc: 'Wellness & medicine' },
                              { label: 'Local',         cat: 'Local',         Icon: Newspaper,     desc: 'Community news' },
                              { label: 'Lifestyle',     cat: 'Lifestyle',     Icon: Film,          desc: 'Culture & living' },
                            ].map(({ label, cat, Icon, desc }) => (
                              <button key={cat} onClick={() => { onCategoryClick(cat); setMoreOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-brand-surface group transition-all">
                                <div className="w-7 h-7 rounded-lg bg-ashanti-green/10 flex items-center justify-center shrink-0 group-hover:bg-ashanti-gold/10 transition-colors">
                                  <Icon size={13} className="text-ashanti-green group-hover:text-ashanti-gold transition-colors" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-none">{label}</p>
                                  <p className="text-[9px] text-news-muted mt-0.5">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ── Col 2: Special Sections ── */}
                        <div className="px-6 border-r border-news-border">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-ashanti-gold mb-4">Special Sections</p>
                          <div className="space-y-0.5">
                            {[
                              { label: 'Editorials & Opinion', page: 'editorials', Icon: PenLine,    desc: 'Bold commentary & analysis' },
                              { label: 'Fact Check',           page: 'factcheck',  Icon: ShieldCheck, desc: 'Truth vs rumour' },
                              { label: 'Podcasts',             page: 'podcasts',   Icon: Mic,         desc: 'Audio journalism' },
                              { label: 'Business Directory',   page: 'directory',  Icon: Building2,   desc: 'Ashanti businesses' },
                              { label: 'Community Hub',        page: 'community',  Icon: Users,       desc: 'Events, jobs, polls' },
                              { label: 'Submit a Story',       page: 'submit',     Icon: Send,        desc: 'Citizen journalism' },
                            ].map(({ label, page, Icon, desc }) => (
                              <button key={page} onClick={() => { onNavigate(page); setMoreOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-brand-surface group transition-all">
                                <div className="w-7 h-7 rounded-lg bg-ashanti-gold/10 flex items-center justify-center shrink-0 group-hover:bg-ashanti-gold/20 transition-colors">
                                  <Icon size={13} className="text-ashanti-gold" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-none">{label}</p>
                                  <p className="text-[9px] text-news-muted mt-0.5">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ── Col 3: Company ── */}
                        <div className="px-6 border-r border-news-border">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-ashanti-gold mb-4">Company</p>
                          <div className="space-y-0.5">
                            {[
                              { label: 'About Us',      page: 'about',     Icon: Info,    desc: 'Our mission & team' },
                              { label: 'Careers',       page: 'careers',   Icon: Briefcase, desc: 'Join our newsroom' },
                              { label: 'Advertise',     page: 'advertise', Icon: TrendingUp, desc: 'Reach 1M+ readers' },
                              { label: 'Contact Us',    page: 'contact',   Icon: Phone,   desc: 'Get in touch' },
                            ].map(({ label, page, Icon, desc }) => (
                              <button key={page} onClick={() => { onNavigate(page); setMoreOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-brand-surface group transition-all">
                                <div className="w-7 h-7 rounded-lg bg-ashanti-green/10 flex items-center justify-center shrink-0 group-hover:bg-ashanti-green/20 transition-colors">
                                  <Icon size={13} className="text-ashanti-green group-hover:text-ashanti-gold transition-colors" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-news-text group-hover:text-ashanti-gold transition-colors leading-none">{label}</p>
                                  <p className="text-[9px] text-news-muted mt-0.5">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Social row */}
                          <div className="mt-5 pt-4 border-t border-news-border">
                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-news-muted mb-3">Follow Us</p>
                            <div className="flex gap-2">
                              {SOCIAL.map(({ Icon, href, label }) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                                  className="w-8 h-8 rounded-lg border border-news-border flex items-center justify-center text-news-muted hover:bg-ashanti-gold hover:border-ashanti-gold hover:text-black transition-all">
                                  <Icon size={13} />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* ── Col 4: Featured CTA ── */}
                        <div className="pl-6 flex flex-col gap-4">
                          {/* Live TV */}
                          <button onClick={() => { onNavigate('live'); setMoreOpen(false); }}
                            className="group relative overflow-hidden rounded-2xl bg-ashanti-green p-5 text-left kente-pattern-bg">
                            <div className="flex items-center gap-2 mb-2">
                              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-red-400 rounded-full" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Live Now</span>
                            </div>
                            <p className="font-heading font-black text-white text-base leading-tight mb-1">Watch Live TV</p>
                            <p className="text-white/50 text-[10px]">Stream breaking news 24/7</p>
                            <div className="mt-3 flex items-center gap-1 text-ashanti-gold text-[10px] font-black uppercase tracking-widest">
                              Watch Now <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>

                          {/* Trending */}
                          <button onClick={() => { onNavigate('trending'); setMoreOpen(false); }}
                            className="group rounded-2xl border border-news-border bg-brand-surface p-4 text-left hover:border-ashanti-gold transition-all">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp size={13} className="text-ashanti-gold" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold">Trending</span>
                            </div>
                            <p className="font-bold text-news-text text-sm leading-tight mb-1">What's Hot Right Now</p>
                            <p className="text-news-muted text-[10px]">Most-read stories today</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-news-muted group-hover:text-ashanti-gold transition-colors">
                              See Trending <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>

                          {/* Podcasts */}
                          <button onClick={() => { onNavigate('podcasts'); setMoreOpen(false); }}
                            className="group rounded-2xl border border-news-border bg-brand-surface p-4 text-left hover:border-ashanti-gold transition-all">
                            <div className="flex items-center gap-2 mb-2">
                              <Mic size={13} className="text-ashanti-gold" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-ashanti-gold">Audio</span>
                            </div>
                            <p className="font-bold text-news-text text-sm leading-tight mb-1">Bosomtwi Podcasts</p>
                            <p className="text-news-muted text-[10px]">Listen on the go</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-news-muted group-hover:text-ashanti-gold transition-colors">
                              Listen Now <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        </div>

                      </div>

                      {/* Bottom strip */}
                      <div className="border-t border-news-border bg-brand-surface px-6 lg:px-8 py-2.5 flex items-center justify-between">
                        <p className="text-[9px] text-news-muted uppercase tracking-widest font-bold">Bosomtwi Web · YOUR VOICE. OUR MISSION.</p>
                        <button onClick={() => setMoreOpen(false)}
                          className="text-[9px] font-bold text-news-muted hover:text-ashanti-gold transition-colors uppercase tracking-widest flex items-center gap-1">
                          Close <X size={10} />
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            {/* Search */}
            <button onClick={onSearchOpen} aria-label="Search"
              className="p-2 text-news-text/40 hover:text-ashanti-gold transition-colors rounded-lg hover:bg-brand-surface">
              <Search size={18} />
            </button>

            {/* Dark mode toggle */}
            <button onClick={onDarkToggle} aria-label="Toggle theme"
              className="p-2 text-news-text/40 hover:text-ashanti-gold transition-colors rounded-lg hover:bg-brand-surface">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* LIVE TV button */}
            <button onClick={() => onNavigate('live')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-red-600/20 ml-1">
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full" />
              Live TV
            </button>
          </div>
        </div>
      </div>

      {/* ── Strip 3: Secondary nav ────────────────────────────── */}
      <div className="bg-[#050505] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-7 gap-6">
          {[
            { label: 'Editorials',    page: 'editorials' },
            { label: 'Fact Check',    page: 'factcheck' },
            { label: 'Podcasts',      page: 'podcasts' },
            { label: 'Business Directory', page: 'directory' },
            { label: 'Submit a Story', page: 'submit' },
            { label: 'Community',     page: 'community' },
            { label: 'About Us',      page: 'about' },
          ].map(({ label, page }) => (
            <button key={label} onClick={() => onNavigate(page)}
              className="text-[9px] uppercase tracking-widest font-bold text-white/50 hover:text-ashanti-gold transition-colors whitespace-nowrap">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close} className="fixed inset-0 z-[59] bg-black/60 backdrop-blur-sm md:hidden" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-[60] w-[85vw] max-w-sm bg-news-bg flex flex-col shadow-2xl md:hidden">

              <div className="flex items-center justify-between px-5 py-4 border-b border-news-border bg-brand-surface">
                <img src="/logo.png" alt="BOSOMTWIWEB" className="h-9 w-auto object-contain" />
                <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full bg-news-border/50 text-news-text/60 hover:text-news-text">
                  <X size={16} />
                </button>
              </div>

              {/* Live TV + Dark mode row */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-news-border">
                <button onClick={() => { onNavigate('live'); close(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-white rounded-full" />
                  Watch Live
                </button>
                <button onClick={onDarkToggle}
                  className="w-11 h-10 flex items-center justify-center rounded-xl border border-news-border text-news-text/50 hover:text-ashanti-gold">
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-4">
                {/* Quick sections */}
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-ashanti-gold mb-2 px-1">Quick Access</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {QUICK_LINKS.map(({ id, label, Icon, live }) => (
                    <button key={id} onClick={() => { onNavigate(id); close(); }}
                      className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-bold text-news-text/60 hover:text-ashanti-gold bg-brand-surface hover:bg-brand-surface/80 transition-colors">
                      <Icon size={15} />
                      <span>{label}</span>
                      {live && <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-2 h-2 bg-red-500 rounded-full ml-auto" />}
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/30 mb-2 px-1">News Sections</p>
                <div className="flex flex-col gap-0.5 mb-6">
                  {CATEGORIES.map(({ label, cat }) => (
                    <button key={cat} onClick={() => { onCategoryClick(cat); close(); }}
                      className="flex items-center justify-between py-3 px-2 text-[17px] font-heading font-bold uppercase tracking-tight text-news-text hover:text-ashanti-gold group transition-colors">
                      <span>{label}</span>
                      <ChevronRight size={14} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Company */}
                <div className="border-t border-news-border pt-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/20 mb-2 px-1">Company</p>
                  {[
                    { label: 'About Us',          page: 'about' },
                    { label: 'Careers',           page: 'careers' },
                    { label: 'Editorials',        page: 'editorials' },
                    { label: 'Fact Check',        page: 'factcheck' },
                    { label: 'Podcasts',          page: 'podcasts' },
                    { label: 'Business Directory',page: 'directory' },
                    { label: 'Advertise With Us', page: 'advertise' },
                    { label: 'Contact Us',        page: 'contact' },
                    { label: 'Privacy Policy',    page: 'privacy' },
                    { label: 'Terms of Service',  page: 'terms' },
                  ].map(({ label, page }) => (
                    <button key={page} onClick={() => { onNavigate(page); close(); }}
                      className="block w-full text-left py-2.5 px-2 text-sm font-bold uppercase tracking-widest text-news-text/30 hover:text-ashanti-gold transition-colors">
                      {label}
                    </button>
                  ))}
                </div>

                {/* Social links */}
                <div className="border-t border-news-border pt-4 mt-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/20 mb-3 px-1">Follow Us</p>
                  <div className="flex gap-2">
                    {SOCIAL.map(({ Icon, href, label }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl border border-news-border flex items-center justify-center text-news-text/40 hover:bg-ashanti-gold hover:border-ashanti-gold hover:text-black transition-all">
                        <Icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {!user && (
                <div className="p-4 border-t border-news-border">
                  <button onClick={() => { onLoginClick(); close(); }}
                    className="w-full py-3.5 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-news-text hover:text-ashanti-gold transition-all text-sm">
                    Journalist Login
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
