import { useState } from 'react';
import { Menu, Search, LogOut, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
  onCategoryClick: (category: string) => void;
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
}

const CATEGORIES = [
  'Manhyia', 'Politics', 'Business', 'Sports', 'Technology',
  'Entertainment', 'Health', 'Local', 'International',
];

export default function Navbar({ user, onLogout, onLoginClick, onAdminClick, onCategoryClick, onNavigate, onSearchOpen }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-news-bg/95 backdrop-blur-md border-b border-brand-secondary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex md:hidden p-2 text-news-text/60 hover:text-news-text transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => onCategoryClick('')}
          >
            <img
              src="/logo.png"
              alt="Bosomtwi Web"
              className="h-14 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Desktop category nav */}
          <div className="hidden md:flex items-center h-full flex-1 justify-center gap-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryClick(cat)}
                className="text-[10px] uppercase tracking-widest font-black text-news-text/70 hover:text-ashanti-gold h-full px-2 flex items-center border-b-2 border-transparent hover:border-ashanti-gold transition-all"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSearchOpen}
              className="p-2 text-news-text/40 hover:text-ashanti-gold transition-colors rounded-lg"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-3 pr-1 py-1 bg-brand-surface rounded-full border border-brand-secondary/20 hover:border-ashanti-gold transition-all"
                >
                  <span className="text-[11px] font-bold text-news-text hidden sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-ashanti-gold flex items-center justify-center text-black text-xs font-black shadow">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown size={13} className={`text-news-text/30 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-brand-secondary/20 py-2 z-50"
                    >
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setIsUserMenuOpen(false); onAdminClick(); }}
                          className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-news-text/70 hover:bg-brand-surface transition-colors flex items-center gap-2"
                        >
                          <Shield size={13} /><span>Admin Dashboard</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-ashanti-gold hover:bg-brand-surface transition-colors flex items-center gap-2"
                      >
                        <LogOut size={13} /><span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-5 py-2.5 bg-ashanti-gold text-black text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-news-text hover:text-ashanti-gold transition-all shadow-md hover:scale-105"
              >
                Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-[60] w-80 bg-news-bg flex flex-col shadow-2xl md:hidden"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-secondary/20 bg-brand-surface">
                <img src="/logo.png" alt="Bosomtwi Web" className="h-10 w-auto object-contain" />
                <button onClick={closeMenu} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-news-text/60 hover:text-news-text text-lg font-bold">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-6">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-ashanti-gold mb-5">Sections</p>
                <div className="flex flex-col gap-1 mb-10">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onCategoryClick(cat); closeMenu(); }}
                      className="flex items-center justify-between py-3 text-xl font-heading font-black uppercase tracking-tight text-news-text hover:text-ashanti-gold text-left group transition-colors"
                    >
                      <span>{cat}</span>
                      <ChevronRight size={16} className="text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                <div className="border-t border-brand-secondary/10 pt-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-news-text/30 mb-4">Company</p>
                  {[
                    { label: 'Privacy Policy', page: 'privacy' },
                    { label: 'Terms of Service', page: 'terms' },
                    { label: 'Advertise With Us', page: 'advertise' },
                  ].map(({ label, page }) => (
                    <button
                      key={page}
                      onClick={() => { onNavigate(page); closeMenu(); }}
                      className="block w-full text-left py-2.5 text-sm font-bold uppercase tracking-widest text-news-text/40 hover:text-ashanti-gold transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="p-6 border-t border-brand-secondary/20">
                  <button
                    onClick={() => { onLoginClick(); closeMenu(); }}
                    className="w-full py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl hover:bg-news-text hover:text-ashanti-gold transition-all"
                  >
                    Admin Access
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
