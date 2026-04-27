import { useState } from 'react';
import { Menu, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
}

export default function Navbar({ user, onLogout, onLoginClick, onAdminClick, onCategoryClick }: NavbarProps & { onCategoryClick: (category: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const categories = [
    'Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 
    'Entertainment', 'Health', 'Local', 'International'
  ];

  return (
    <nav className="sticky top-0 z-50 bg-news-bg/95 backdrop-blur-md border-b border-brand-secondary/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-news-text"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onCategoryClick('')}>
            <img src="/logo.png" alt="Bosomtwi Web Logo" className="h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center h-full">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => onCategoryClick(cat)}
                className="text-[11px] uppercase tracking-widest font-black text-news-text/80 hover:text-ashanti-gold transition-all h-full flex items-center border-b-2 border-transparent hover:border-ashanti-gold cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & User */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-news-text/40 hover:text-ashanti-gold transition-colors">
              <Search size={18} />
            </button>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 pl-3 bg-brand-surface rounded-full border border-brand-secondary/20 hover:border-ashanti-gold transition-all group"
                >
                  <span className="text-[11px] font-bold pr-1 text-news-text">{user.name.split(' ')[0]}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-black text-xs font-bold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown size={14} className={`text-news-text/30 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-brand-secondary/20 py-2 z-50 overflow-hidden"
                    >
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => { setIsUserMenuOpen(false); onAdminClick(); }}
                          className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-news-text/70 hover:bg-brand-surface transition-colors flex items-center space-x-2"
                        >
                          <User size={14} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                      <button 
                        onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ashanti-gold hover:bg-brand-surface transition-colors flex items-center space-x-2"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-6 py-2.5 bg-ashanti-gold text-black text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-ashanti-gold transition-all shadow-md transform hover:scale-105"
              >
                Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-news-bg backdrop-blur-xl md:hidden flex flex-col"
          >
            <div className="p-8 border-b border-brand-secondary/20 flex justify-between items-center bg-brand-surface">
              <img src="/logo.png" alt="Bosomtwi Web Logo" className="h-10 w-auto object-contain" />
              <button onClick={() => setIsMenuOpen(false)} className="text-news-text text-4xl leading-none">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 bg-news-bg">
              <div className="flex flex-col space-y-8">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => { onCategoryClick(cat); setIsMenuOpen(false); }}
                    className="text-2xl font-heading font-black uppercase tracking-tight text-news-text text-left hover:text-ashanti-gold flex items-center justify-between group"
                  >
                    <span>{cat}</span>
                    <ChevronDown size={20} className="-rotate-90 text-news-text/20 group-hover:text-ashanti-gold group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
