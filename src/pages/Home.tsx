import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { Article } from '../types';
interface HomeProps {
  onArticleClick: (article: Article) => void;
  articles: Article[];
  onCategoryClick: (category: string) => void;
  loading?: boolean;
}

const FILTER_TABS = ['All', 'Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 'Entertainment', 'Health', 'Local', 'International'];

const BREAKING_NEWS = [
  'Lake Bosomtwe Conservation Project Gains Global Recognition',
  'Cocoa Export Revenues Surge 12% in Ashanti Region',
  'New Tech Hub Opens in Kumasi — 5,000 Engineering Seats Available',
  'Asante Kotoko FC Clinches Ghana Premier League Title',
  'Otumfuo Foundation Launches Record 2,000-Student Scholarship Programme',
  'Ghana Signs Historic Trade Deal with the European Union',
];

export default function Home({ onArticleClick, articles, onCategoryClick, loading }: HomeProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-news-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ashanti-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-news-text/30">Syncing with newsroom...</p>
        </div>
      </div>
    );
  }

  const trendingArticles = articles.slice(0, 5);

  return (
    <div className="bg-news-bg min-h-screen text-news-text">

      {/* Breaking News Ticker */}
      <div className="h-10 bg-brand-surface flex items-center overflow-hidden border-b border-ashanti-gold/10">
        <div className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 h-full flex items-center shrink-0">
          Breaking
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            {[1, 2, 3].map(n =>
              BREAKING_NEWS.map((item, i) => (
                <span key={`${n}-${i}`} className="text-[11px] font-bold uppercase tracking-[0.15em] flex items-center mr-12 text-news-text/80">
                  <span className="w-1.5 h-1.5 bg-red-500 rotate-45 mr-3 inline-block" />
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdBanner size="leaderboard" />
      </div>

      {/* Hero + Sidebar */}
      <main className="flex flex-col lg:flex-row border-b border-brand-secondary/20">

        {/* Hero video + featured articles */}
        <div className="lg:w-2/3 border-r border-brand-secondary/20 flex flex-col">
          <div className="relative aspect-video bg-black overflow-hidden group">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/wHmkUO1mkL0?si=bVrQuMSWbAjRcD1K"
              title="Bosomtwi Web Live Hero"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="scale-105 group-hover:scale-100 transition-transform duration-[2000ms]"
            />
            {/*
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ccqUbUJtgPc?si=mFieoeGcHOMGJe-d"
              title="Other Video (commented out)"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="scale-105 group-hover:scale-100 transition-transform duration-[2000ms]"
            />
            */}
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                Live Transmission
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none text-white">
              <span className="text-ashanti-gold text-[11px] font-black uppercase tracking-[0.4em] mb-3 block">
                
              </span>
              <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-2xl">
                Bosomtwi Web Live
              </h1>
              <p className="text-white/60 text-base max-w-xl line-clamp-2">
                Real-time coverage of cultural heritage, economic progress, and local narratives from the heart of the Ashanti Region.
              </p>
            </div>
          </div>

          {/* Featured Articles */}
          {articles.length > 0 && (
            <div className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-brand-secondary/20">
              {articles.slice(0, 2).map(article => (
                <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div className="lg:w-1/3 flex flex-col bg-brand-surface relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-ashanti-gold opacity-5 blur-3xl pointer-events-none" />
          <div className="px-8 py-6 border-b border-brand-secondary/20">
            <h2 className="text-[11px] uppercase tracking-[0.3em] font-heading font-bold text-ashanti-gold border-l-4 border-ashanti-gold pl-4">
              The Trending List
            </h2>
          </div>
          <div className="flex-1 px-8 py-6 space-y-8">
            {trendingArticles.map((article, i) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group cursor-pointer flex flex-col"
              >
                <span className="text-[10px] uppercase font-black text-news-text/30 mb-1.5 tracking-widest">
                  {String(i + 1).padStart(2, '0')} · {article.category}
                </span>
                <h3 className="text-xl font-heading font-bold leading-snug text-news-text group-hover:text-ashanti-gold transition-colors">
                  {article.title}
                </h3>
              </div>
            ))}

            <AdBanner size="square" />

            {/* Sidebar sponsor card */}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-200 aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?q=80&w=2069&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                alt="Sponsored"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute top-4 right-4">
                <span className="bg-black/40 backdrop-blur-md text-[9px] text-white/60 px-2 py-1 uppercase tracking-widest font-bold rounded">
                  Sponsored
                </span>
              </div>
              <div className="absolute bottom-0 p-5 w-full">
                <p className="text-ashanti-gold text-[10px] font-bold uppercase tracking-widest mb-1">Heritage Collection</p>
                <h4 className="text-white text-lg font-heading font-black leading-tight mb-4 uppercase">
                  Royal Ashanti Kente Artisans
                </h4>
                <button className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-ashanti-gold transition-colors rounded">
                  Shop Curated Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Latest Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-6">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-news-text tracking-tight">
            Latest Stories{' '}
            <span className="text-ashanti-gold text-xl md:ml-4 tracking-[0.2em] font-normal uppercase block md:inline mt-1 md:mt-0">
              Archive {new Date().getFullYear()}
            </span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto shrink-0">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => onCategoryClick(tab === 'All' ? '' : tab)}
                className="text-[10px] uppercase tracking-[0.15em] font-bold text-news-text/60 bg-gray-100 hover:bg-ashanti-gold hover:text-black transition-all whitespace-nowrap px-4 py-2 rounded-full shrink-0"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.flatMap((article, index) => {
            const items = [
              <div key={article.id} onClick={() => onArticleClick(article)} className="cursor-pointer">
                <ArticleCard article={article} variant="medium" />
              </div>,
            ];
            if (index === 2 && articles.length > 3) {
              items.push(
                <div key="in-feed-ad" className="col-span-1 md:col-span-2 lg:col-span-3">
                  <AdBanner size="leaderboard" />
                </div>
              );
            }
            return items;
          })}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-brand-secondary/10 rounded-3xl">
            <p className="text-news-text/30 font-heading italic text-2xl">No stories yet. Check back soon.</p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-brand-surface border-t border-brand-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4 leading-tight">
              Join our newsletter community.{' '}
              <span className="text-ashanti-gold">Free briefing.</span>
            </h2>
            <p className="text-news-text/60 text-lg">
              Daily briefings on Politics, Business, and Culture in Ashanti Region.
            </p>
          </div>
          <div className="w-full max-w-md flex rounded-xl overflow-hidden shadow-2xl shadow-brand-primary/10 border border-brand-secondary/30">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow bg-white border-0 px-8 py-4 text-news-text font-medium placeholder:text-gray-400 focus:outline-none"
            />
            <button className="bg-ashanti-gold text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-news-text hover:text-ashanti-gold transition-all text-sm shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
