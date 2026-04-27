import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { Article } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Newspaper, ChevronRight } from 'lucide-react';

export default function Home({ onArticleClick, articles, onCategoryClick, loading }: { 
  onArticleClick: (article: Article) => void, 
  articles: Article[],
  onCategoryClick: (category: string) => void,
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Syncing with newsroom...</p>
        </div>
      </div>
    );
  }

  const mainArticle = articles[0];
  const trendingArticles = articles.slice(0, 5);

  return (
    <div className="bg-news-bg min-h-screen text-news-text font-sans">
      {/* Breaking News Ticker */}
      <div className="h-10 bg-brand-surface text-news-text flex items-center overflow-hidden border-b border-ashanti-gold/10">
        <div className="flex items-center whitespace-nowrap animate-marquee px-6">
          {[1,2,3].map((i) => (
            <span key={i} className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center mr-12 text-red-600">
              <span className="w-2 h-2 bg-red-600 rotate-45 mr-3 animate-pulse"></span>
              Breaking: Lake Bosomtwe Conservation Project Gains Global Recognition • Cocoa Export Revenues Surge by 12% in Ashanti Region • New Tech Hub Opens in Kumasi •
            </span>
          ))}
        </div>
      </div>

      {/* Leaderboard Ad — below ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdBanner size="leaderboard" />
      </div>

      <main className="flex flex-col lg:flex-row border-b border-brand-secondary/20">
        {/* Hero Section with Video */}
        <div className="lg:w-2/3 border-r border-brand-secondary/20 flex flex-col">
          <div className="relative aspect-video bg-black overflow-hidden group">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/STQpAHL5G5g?autoplay=1&mute=1&loop=1&playlist=STQpAHL5G5g&controls=0&modestbranding=1&rel=0" 
              title="Bosomtwi Web Live Hero" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="scale-105 group-hover:scale-100 transition-transform duration-[2000ms]"
            />
            <div className="absolute top-8 left-8 z-10">
              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>
                Live Transmission
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none text-white">
              <span className="text-ashanti-gold text-[12px] font-black uppercase tracking-[0.4em] mb-4 block">Official Feed</span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-2xl">
                The Ashanti Digital News Network.
              </h1>
              <p className="text-white/60 text-lg font-sans max-w-xl line-clamp-2">
                Real-time coverage of cultural heritage, economic progress, and local narratives from the heart of the Ashanti Region.
              </p>
            </div>
          </div>

          {/* Featured Articles Grid Below Hero */}
          <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-brand-secondary/20">
            {articles.slice(0, 2).map(article => (
              <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>

        {/* Trending Sidebar */}
        <div className="lg:w-1/3 flex flex-col bg-brand-surface relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-ashanti-gold opacity-5 blur-3xl"></div>
          <div className="p-8 border-b border-brand-secondary/20 relative z-10">
            <h2 className="text-[12px] uppercase tracking-[0.3em] font-heading font-bold text-ashanti-gold border-l-4 border-ashanti-gold pl-4">The Trending List</h2>
          </div>
          <div className="flex-1 p-8 space-y-10 relative z-10">
            {trendingArticles.map((article, i) => (
              <div 
                key={article.id} 
                onClick={() => onArticleClick(article)}
                className="group cursor-pointer flex flex-col"
              >
                <span className="text-[11px] uppercase font-sans text-news-text/40 mb-2 block font-bold tracking-widest">
                   0{i + 1} • {article.category}
                </span>
                <h3 className="text-2xl font-heading leading-tight text-news-text group-hover:text-ashanti-gold transition-colors">
                  {article.title}
                </h3>
              </div>
            ))}

            {/* Square Ad slot in sidebar */}
            <AdBanner size="square" />

            {/* Sidebar Advertisement */}
            <div className="mt-8 relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-200 aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?q=80&w=2069&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                alt="Ad"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute top-4 right-4">
                <span className="bg-black/40 backdrop-blur-md text-[9px] text-white/60 px-2 py-1 uppercase tracking-widest font-bold rounded">Sponsored</span>
              </div>
              <div className="absolute bottom-0 p-6 w-full">
                <p className="text-ashanti-gold text-[10px] font-bold uppercase tracking-widest mb-2">Heritage Collection</p>
                <h4 className="text-white text-xl font-heading font-black leading-tight mb-4 uppercase">Royal Ashanti Kente Artisans</h4>
                <button className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-ashanti-gold transition-colors">
                  Shop Curated Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Latest Stories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-brand-secondary/20">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
          <div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-news-text tracking-tight">Latest Stories <span className="text-ashanti-gold text-xl block md:inline md:ml-4 tracking-[0.2em] font-normal uppercase">Archive 2026</span></h2>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-4 w-full md:w-auto">
            {['All', 'Manhyia', 'Politics', 'Business', 'Sports'].map(tab => (
              <button 
                key={tab} 
                onClick={() => onCategoryClick(tab === 'All' ? '' : tab)}
                className="text-[11px] uppercase tracking-[0.2em] font-bold text-news-text/60 bg-gray-100 hover:bg-ashanti-gold hover:text-white transition-all whitespace-nowrap px-4 py-2 rounded-full"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* In-feed ad after first row of articles */}
        {articles.length > 3 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <AdBanner size="leaderboard" />
          </div>
        )}

          {articles.map((article) => (
            <div key={article.id} onClick={() => onArticleClick(article)}>
              <ArticleCard article={article} variant="medium" />
            </div>
          ))}
        </div>
      </section>

      {/* News Subscription */}
      <section className="py-20 bg-brand-surface text-news-text border-t border-brand-secondary/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
           <div className="max-w-xl text-center lg:text-left">
             <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4 leading-tight">Join our newsletter community. <span className="text-ashanti-gold">Free briefing.</span></h2>
             <p className="text-news-text/60 text-lg">Daily briefings on Politics, Business, and Culture in Ashanti Region.</p>
           </div>
           <div className="w-full max-w-md flex flex-col sm:flex-row gap-0 rounded-xl overflow-hidden shadow-2xl shadow-brand-primary/10 border border-brand-secondary/30">
             <input type="email" placeholder="Your email address" className="flex-grow bg-white border-brand-secondary/30 border px-8 py-4 text-news-text font-medium placeholder:text-gray-400 focus:outline-none focus:border-ashanti-gold" />
             <button className="bg-ashanti-gold text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-ashanti-gold transition-all text-sm">Subscribe</button>
           </div>
        </div>
      </section>
    </div>
  );
}
