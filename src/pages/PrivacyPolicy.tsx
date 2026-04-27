import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-secondary/10"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-ashanti-gold rounded-full flex items-center justify-center text-black">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-news-text">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-lg max-w-none text-news-text/80 space-y-6">
          <p className="text-xl font-medium text-news-text">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">2. How We Use Your Information</h2>
          <p>We may use the information we collect about you to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support, develop safety features, authenticate users, and send product updates and administrative messages.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">3. Information Sharing And Disclosure</h2>
          <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          
          <h2 className="text-2xl font-bold text-news-text mt-8">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Statement, please contact us at privacy@bosomtwi.web.</p>
        </div>
      </motion.div>
    </div>
  );
}
