import { motion } from 'motion/react';
import { Award, Users, Globe, Radio, Target, Eye, Heart, ChevronRight, Download } from 'lucide-react';
import KenteBanner from '../components/KenteBanner';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
}

const TEAM = [
  { name: 'Kwame Asante Boateng', role: 'Editor-in-Chief', bio: 'Veteran journalist with 20+ years covering Ashanti Region politics and governance.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Akosua Mensah', role: 'Managing Editor', bio: 'Award-winning investigative journalist specialising in business and economic affairs.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { name: 'Kofi Acheampong', role: 'Head of Digital', bio: 'Digital media strategist driving Bosomtwi Web\'s online presence and growth.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { name: 'Abena Osei-Bonsu', role: 'Senior Reporter', bio: 'Covering Manhyia Palace and traditional governance for over a decade.', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop' },
  { name: 'Yaw Darko', role: 'Sports Editor', bio: 'Passionate sports journalist covering Asante Kotoko, local and international football.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { name: 'Adwoa Frimpong', role: 'Community Reporter', bio: 'Grassroots journalist connecting communities across Ashanti Region.', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
];

const MILESTONES = [
  { year: '2009', title: 'Founded', desc: 'Bosomtwi Web launched as a community news blog serving the Ashanti Region.' },
  { year: '2013', title: 'Digital Expansion', desc: 'Launched fully redesigned web platform with breaking news and multimedia.' },
  { year: '2016', title: 'Manhyia Bureau', desc: 'Opened dedicated bureau at Manhyia, becoming the official voice of palace news.' },
  { year: '2019', title: '1 Million Readers', desc: 'Reached 1 million monthly unique readers across Ghana and the diaspora.' },
  { year: '2022', title: 'Live TV Launch', desc: 'Launched Bosomtwi Web Live, streaming news 24/7 on YouTube and the web.' },
  { year: '2024', title: 'Premium Platform', desc: 'Rebuilt as a premium African digital media house with new editorial standards.' },
];

const VALUES = [
  { Icon: Target, title: 'Accuracy', desc: 'We verify every fact before publishing. Truth is non-negotiable.' },
  { Icon: Eye, title: 'Transparency', desc: 'We disclose our methods, sources, and corrections openly.' },
  { Icon: Heart, title: 'Community', desc: 'We exist to serve and amplify the voices of Ashanti communities.' },
  { Icon: Globe, title: 'Inclusivity', desc: 'Every voice matters — from Kumasi city centre to rural villages.' },
];

const STATS = [
  { value: '1M+', label: 'Monthly Readers' },
  { value: '15+', label: 'Years Reporting' },
  { value: '50+', label: 'Staff & Contributors' },
  { value: '8', label: 'Editorial Awards' },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-news-bg text-news-text">
      <KenteBanner
        title="About Bosomtwi Web"
        badge="Our Story"
        description="YOUR VOICE. OUR MISSION. The Ashanti Region's most trusted digital media platform, serving communities since 2009."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">

        {/* Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-4">Our Mission</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-news-text leading-tight mb-6">
              YOUR VOICE.<br /><span className="text-ashanti-gold">OUR MISSION.</span>
            </h2>
            <p className="text-news-muted text-base leading-relaxed mb-4">
              Bosomtwi Web was born from a simple belief: the stories of Ashanti people deserve to be told with accuracy, depth, and pride. From the corridors of Manhyia Palace to the markets of Kejetia, every story matters.
            </p>
            <p className="text-news-muted text-base leading-relaxed mb-8">
              We are an independent digital media house dedicated to empowering communities through information, holding power accountable, and celebrating the rich culture and heritage of the Ashanti Region.
            </p>
            <button
              onClick={() => onNavigate?.('contact')}
              className="flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
              Get in Touch <ChevronRight size={14} />
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid grid-cols-2 gap-5">
            {STATS.map(({ value, label }) => (
              <div key={label} className="p-6 bg-news-card border border-news-border rounded-2xl text-center">
                <p className="font-heading text-4xl font-black text-ashanti-gold mb-1">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Values */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-2 text-center">What We Stand For</p>
          <h2 className="font-heading text-3xl font-black text-news-text text-center mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 bg-news-card border border-news-border rounded-2xl hover:border-ashanti-gold/30 transition-all group">
                <div className="w-10 h-10 bg-ashanti-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ashanti-gold/20 transition-all">
                  <Icon size={18} className="text-ashanti-gold" />
                </div>
                <h3 className="font-heading font-bold text-news-text mb-2">{title}</h3>
                <p className="text-news-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-2 text-center">How We Got Here</p>
          <h2 className="font-heading text-3xl font-black text-news-text text-center mb-10">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-news-border -translate-x-1/2 hidden lg:block" />
            <div className="space-y-8">
              {MILESTONES.map(({ year, title, desc }, i) => (
                <motion.div key={year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className={`flex items-center gap-6 lg:gap-10 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 p-5 bg-news-card border border-news-border rounded-2xl ${i % 2 === 0 ? 'lg:text-right' : ''}`}>
                    <p className="text-ashanti-gold font-black text-sm mb-0.5">{year}</p>
                    <h3 className="font-heading font-bold text-news-text mb-1">{title}</h3>
                    <p className="text-news-muted text-sm">{desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-ashanti-gold rounded-full flex items-center justify-center shrink-0 z-10 shadow-lg shadow-ashanti-gold/20">
                    <Award size={16} className="text-black" />
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-2 text-center">The People Behind the News</p>
          <h2 className="font-heading text-3xl font-black text-news-text text-center mb-10">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {TEAM.map(({ name, role, bio, img }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-4 p-5 bg-news-card border border-news-border rounded-2xl hover:border-ashanti-gold/30 transition-all">
                <img src={img} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-ashanti-gold/20" />
                <div>
                  <p className="font-heading font-bold text-news-text text-sm">{name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ashanti-gold mb-2">{role}</p>
                  <p className="text-news-muted text-xs leading-relaxed">{bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Press Kit */}
        <section className="p-8 md:p-12 bg-ashanti-green/10 border border-ashanti-green/20 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ashanti-gold mb-2">Press Kit</p>
              <h2 className="font-heading text-2xl font-black text-news-text mb-3">Media Resources</h2>
              <p className="text-news-muted text-sm leading-relaxed">
                Download our logos, brand guidelines, editorial charter, and fact sheets. For press inquiries and interview requests, contact our communications team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a href="mailto:press@bosomtwi.web"
                className="flex items-center gap-2 px-6 py-3 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all">
                <Radio size={13} /> Press Inquiry
              </a>
              <button className="flex items-center gap-2 px-6 py-3 bg-news-card border border-news-border text-news-text font-black uppercase tracking-widest rounded-xl text-[11px] hover:border-ashanti-gold transition-all">
                <Download size={13} /> Brand Assets
              </button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Users, label: 'Editorial Charter', desc: 'Our standards and policies' },
              { icon: Globe, label: 'Fact Sheet', desc: 'Key stats and reach data' },
              { icon: Award, label: 'Awards & Recognition', desc: 'Our journalism accolades' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-4 bg-news-card border border-news-border rounded-xl">
                <div className="w-8 h-8 bg-ashanti-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-ashanti-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold text-news-text">{label}</p>
                  <p className="text-[10px] text-news-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="font-heading text-3xl font-black text-news-text mb-4">Join the Bosomtwi Family</h2>
          <p className="text-news-muted mb-8 max-w-xl mx-auto">Whether you're a reader, contributor, advertiser, or journalist — there's a place for you in our growing community.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate?.('careers')}
              className="flex items-center gap-2 px-8 py-4 bg-ashanti-gold text-black font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-news-text hover:text-ashanti-gold transition-all shadow-lg">
              View Careers <ChevronRight size={14} />
            </button>
            <button onClick={() => onNavigate?.('submit')}
              className="flex items-center gap-2 px-8 py-4 bg-news-card border border-news-border text-news-text font-black uppercase tracking-widest rounded-xl text-[11px] hover:border-ashanti-gold transition-all">
              Submit a Story <ChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
