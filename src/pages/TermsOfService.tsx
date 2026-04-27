import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-secondary/10"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-ashanti-gold rounded-full flex items-center justify-center text-black">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-news-text">Terms of Service</h1>
        </div>
        
        <div className="prose prose-lg max-w-none text-news-text/80 space-y-6">
          <p className="text-xl font-medium text-news-text">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">1. Acceptance of Terms</h2>
          <p>By accessing and using Bosomtwi Web Media, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on Bosomtwi Web Media's website for personal, non-commercial transitory viewing only.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">3. Disclaimer</h2>
          <p>The materials on Bosomtwi Web Media's website are provided on an 'as is' basis. Bosomtwi Web Media makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">4. Limitations</h2>
          <p>In no event shall Bosomtwi Web Media or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Bosomtwi Web Media's website.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">5. Content Accuracy</h2>
          <p>The materials appearing on Bosomtwi Web Media's website could include technical, typographical, or photographic errors. Bosomtwi Web Media does not warrant that any of the materials on its website are accurate, complete or current.</p>
        </div>
      </motion.div>
    </div>
  );
}
