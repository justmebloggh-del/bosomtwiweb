import { Article } from '../types';
import { Clock, User as UserIcon, ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'list';
}

export default function ArticleCard({ article, variant = 'medium' }: ArticleCardProps) {
  const isLarge = variant === 'large';
  const isList = variant === 'list';

  if (isLarge) {
    return (
      <motion.div 
        whileHover={{ opacity: 0.95 }}
        className="group relative h-[600px] overflow-hidden cursor-pointer bg-gray-200"
      >
        <img 
          src={article.image} 
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        
        <div className="absolute bottom-0 p-10 lg:p-16 w-full z-20">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-ashanti-gold text-[12px] uppercase font-bold tracking-[0.3em] font-sans">
              Top Story • {article.category}
            </span>
            {(article as any).status === 'published' && (
              <span className="bg-ashanti-gold text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 animate-pulse" />
                WORLD BROADCAST
              </span>
            )}
          </div>
          
          <h2 className="font-heading text-4xl md:text-7xl font-bold leading-[1] tracking-tight mb-8 text-white group-hover:text-ashanti-gold transition-colors">
            {article.title}
          </h2>
          
          <div className="flex items-center space-x-6 text-white/50 text-sm font-sans font-medium">
            <span className="flex items-center"><UserIcon size={14} className="mr-2" /> {article.author}</span>
            <span className="flex items-center"><Clock size={14} className="mr-2" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isList) {
    return (
      <motion.div 
        className="flex space-x-6 items-center group cursor-pointer border-b border-brand-secondary/20 pb-8 last:border-0"
      >
        <div className="w-28 h-28 bg-gray-100 rounded-xl shrink-0 overflow-hidden shadow-sm border border-gray-200">
          <img 
            src={article.image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
            alt={article.title}
          />
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest font-bold text-ashanti-gold mb-2">
            {article.category}
          </div>
          <h3 className="font-heading text-xl font-bold leading-tight text-news-text group-hover:text-ashanti-gold transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center text-[10px] text-news-text/40 font-bold space-x-4 mt-3 uppercase tracking-widest font-sans">
             <span>{article.author}</span>
             <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden border border-brand-secondary/20 hover:border-ashanti-gold/30 hover:shadow-xl transition-all duration-500 group cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        {article.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
            <div className="w-14 h-14 bg-ashanti-gold rounded-full flex items-center justify-center text-black shadow-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Play size={24} fill="currentColor" />
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className="bg-gray-200 text-news-text text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-gray-300 shadow-sm">
            {article.category}
          </span>
          {(article as any).status === 'published' && (
            <span className="bg-ashanti-gold text-black text-[10px] font-black uppercase tracking-widest px-3 py-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <h3 className="font-heading text-2xl font-bold mb-4 leading-tight text-news-text group-hover:text-ashanti-gold transition-colors uppercase tracking-tight">
          {article.title}
        </h3>
        <p className="text-news-text/60 text-[16px] font-sans line-clamp-3 mb-6 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-brand-secondary/10">
          <span className="text-[11px] font-bold text-news-text/30 uppercase tracking-widest font-sans">{article.author}</span>
          <div className="flex items-center text-ashanti-gold text-[10px] font-bold uppercase tracking-widest group-hover:mr-2 transition-all">
            Read More <ArrowUpRight size={14} className="ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
