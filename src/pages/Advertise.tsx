import React from 'react';
import { motion } from 'motion/react';
import { Megaphone, Mail, TrendingUp, Users } from 'lucide-react';

export default function Advertise() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-secondary/10"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ashanti-gold rounded-full text-black mb-6">
            <Megaphone size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-news-text mb-4">Advertise With Us</h1>
          <p className="text-xl text-news-text/60 max-w-2xl mx-auto">
            Reach a highly engaged audience of news consumers across the Ashanti region and beyond.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-6 bg-news-bg rounded-2xl border border-brand-secondary/5">
            <TrendingUp size={28} className="text-brand-primary mb-4" />
            <h3 className="text-xl font-bold text-news-text mb-2">High Engagement</h3>
            <p className="text-news-text/70">Our readers spend above-average time on articles and interact deeply with our content.</p>
          </div>
          <div className="p-6 bg-news-bg rounded-2xl border border-brand-secondary/5">
            <Users size={28} className="text-brand-primary mb-4" />
            <h3 className="text-xl font-bold text-news-text mb-2">Targeted Reach</h3>
            <p className="text-news-text/70">Connect with specific demographics through our specialized content categories and newsletters.</p>
          </div>
        </div>

        <div className="bg-black text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-6">Ready to start your campaign?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Contact our advertising team today to discuss custom packages, sponsored content, and display advertising opportunities.
            </p>
            <a 
              href="mailto:ads@bosomtwi.web"
              className="inline-flex items-center space-x-2 bg-ashanti-gold text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-colors"
            >
              <Mail size={20} />
              <span>Contact Sales Team</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
