import { useState } from 'react';
import { Menu, Search, LogOut, ChevronRight, Radio, TrendingUp, Video, Archive, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
  onCategoryClick: (category: string) => void;
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
}

const CATEGORIES = ['Manhyia', 'Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'Lifestyle'];

const SECTIONS = [
  { id: 'trending', label: 'Trending', Icon: TrendingUp },
  { id: 'videos',   label: 'Videos',   Icon: Video },
  { id: 'live',     label: 'Live',     Icon: Radio, live: true },
  { id: 'archives', label: 'Archives', Icon: Archive },
];

export default function Navbar({ user, onLogout, onLoginClick, onCategoryClick, onNavigate, onSearchOpen }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50">

      {/* ── Top strip: sections + auth ─────────────────────────── */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">

          <div className="flex items-center gap-0">
            {SECTIONS.map(({ id, label, Icon, live }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex items-center gap-1.5 px-3 h-9 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-ashanti-gold hover:bg-white/5 transition-all"
              >
                {live && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full"
                  />
                )}
                <Icon size={11} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white/40 hidden sm:block">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 h-9 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
                >
                  <LogOut size={11} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 h-7 bg-ashanti-gold text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-white transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main bar: logo + categories + search ──────────────── */}
      <div className="bg-news-bg/96 backdrop-blur-md border-b border-brand-secondary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex md:hidden p-2 text-news-text/60 hover:text-news-text transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <button
            onClick={() => onCategoryClick('')}
            className="shrink-0 flex items-center group"
          >
            <img
              src="/logo.png"
              alt="Bosomtwi Web"
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </button>

          {/* Desktop categories */}
          <div className="hidden md:flex items-center flex-1 justify-center gap-0 h-full overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryClick(cat)}
                className="text-[10px] uppercase tracking-widest font-black text-news-text/60 hover:text-ashanti-gold px-2.5 h-full flex items-center border-b-2 border-transparent hover:border-ashanti-gold transition-all whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <button
            onClick={onSearchOpen}
            aria-label="Search"
            className="ml-auto shrink-0 p-2 text-news-text/40 hover:text-ashanti-gold transition-colors rounded-lg"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[59] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-[60] w-80 bg-news-bg flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-secondary/20 bg-brand-surface">
                <img src="/logo.png" alt="Bosomtwi Web" className="h-9 w-auto object-contain" />
                <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-news-text/60 hover:text-news-text">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-5">

                {/* Sections */}
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-ashanti-gold mb-3">Quick Access</p>
                <div className="flex flex-col gap-1 mb-8">
                  {SECTIONS.map(({ id, label, Icon, live }) => (
                    <button
                      key={id}
                      onClick={() => { onNavigate(id); close(); }}
                      className="flex items-center justify-between py-3 px-3 rounded-xl text-sm font-bold text-news-text/60 hover:text-ashanti-gold hover:bg-brand-surface transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{label}</span>
                        {live && (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                          />
                        )}
                      </div>
                      <ChevronRight size={14} className="text-news-text/20" />
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/30 mb-3">Sections</p>
                <div className="flex flex-col gap-0.5 mb-8">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onCategoryClick(cat); close(); }}
                      className="flex items-center justify-between py-3.5 text-xl font-heading font-black uppercase tracking-tight text-news-text hover:text-ashanti-gold text-left group transition-colors"
                    >
                      <span>{cat}</span>
                      <ChevronRight size={15} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Company links */}
                <div className="border-t border-brand-secondary/10 pt-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/20 mb-3">Company</p>
                  {[
                    { label: 'Privacy Policy', page: 'privacy' },
                    { label: 'Terms of Service', page: 'terms' },
                    { label: 'Advertise With Us', page: 'advertise' },
                  ].map(({ label, page }) => (
                    <button
                      key={page}
                      onClick={() => { onNavigate(page); close(); }}
                      className="block w-full text-left py-2.5 text-sm font-bold uppercase tracking-widest text-news-text/30 hover:text-ashanti-gold transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="p-5 border-t border-brand-secondary/20">
                  <button
                    onClick={() => { onLoginClick(); close(); }}
                    className="w-full py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-news-text hover:text-ashanti-gold transition-all"
                  >
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
