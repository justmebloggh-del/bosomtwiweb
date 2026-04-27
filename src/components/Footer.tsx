import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-brand-surface text-news-text pt-20 pb-10 border-t border-brand-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center mb-6 w-fit group">
              <img src="/logo.png" alt="Bosomtwi Web Logo" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
            </a>
            <p className="text-news-text/40 max-w-md mb-8 leading-relaxed font-sans text-lg italic">
              The premier destination for news, analysis, and culture in the Ashanti Region and beyond.
              We are committed to delivering the truth with integrity and passion.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full border border-brand-secondary/20 flex items-center justify-center hover:bg-ashanti-gold hover:border-ashanti-gold transition-all group">
                  <Icon size={18} className="text-news-text group-hover:text-black group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-ashanti-gold">Sections</h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-news-text/40">
              <li><a href="#" className="hover:text-ashanti-gold transition-colors">Politics</a></li>
              <li><a href="#" className="hover:text-ashanti-gold transition-colors">Business</a></li>
              <li><a href="#" className="hover:text-ashanti-gold transition-colors">Sports</a></li>
              <li><a href="#" className="hover:text-ashanti-gold transition-colors">Technology</a></li>
              <li><a href="#" className="hover:text-ashanti-gold transition-colors">Entertainment</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-ashanti-gold">Newsletter</h3>
            <p className="text-xs text-news-text/40 mb-4 italic">Stay updated with the latest headlines delivered to your inbox.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white border border-brand-secondary/20 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-ashanti-gold text-news-text transition-colors pr-12 shadow-sm"
              />
              <button className="absolute right-2 top-2 w-8 h-8 bg-ashanti-gold rounded flex items-center justify-center hover:bg-black hover:text-ashanti-gold transition-colors text-black">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-secondary/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-news-text/20 font-bold">
          <p>© 2026 Bosomtwi Web Media. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-ashanti-gold transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-ashanti-gold transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate && onNavigate('advertise')} className="hover:text-ashanti-gold transition-colors">Advertise</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
