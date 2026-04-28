import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-news-text/40 hover:text-ashanti-gold mb-10 group transition-colors"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-secondary/10"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-ashanti-gold rounded-2xl flex items-center justify-center text-black shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-news-text">Terms of Service</h1>
            <p className="text-sm text-news-text/40 mt-1">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="space-y-10 text-news-text/75 leading-relaxed">

          <p className="text-lg text-news-text/80 border-l-4 border-ashanti-gold pl-6 italic">
            By accessing or using the Bosomtwi Web Media website and services, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree, do not use our services.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">1. Acceptance of Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Bosomtwi Web Media ("Company", "we", "our", "us") governing your use of the bosomtwi.web website and all associated services, content, and features ("Services"). By accessing or using our Services, you confirm that you are at least 13 years old, that you have read and understood these Terms, and that you agree to be bound by them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">2. Use of the Services</h2>
            <p className="mb-3">You may use our Services only for lawful purposes. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Services without our express written permission.</li>
              <li>Use automated tools (bots, scrapers, crawlers) to access content without prior authorisation.</li>
              <li>Post or transmit any content that is unlawful, harmful, defamatory, abusive, obscene, or otherwise objectionable.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Attempt to gain unauthorised access to our systems or interfere with the integrity or performance of the Services.</li>
              <li>Use the Services to send unsolicited commercial communications (spam).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">3. Intellectual Property</h2>
            <p className="mb-3">
              All content published on Bosomtwi Web Media — including articles, photographs, graphics, video, audio, logos, and trade marks — is the property of Bosomtwi Web Media or its content licensors and is protected by Ghanaian and international copyright laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable licence to access and view the content for your personal, non-commercial use only. Any other use — including reproduction, modification, distribution, or public display — requires our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">4. User-Generated Content</h2>
            <p className="mb-3">
              If you submit comments, letters, or other content to us, you grant Bosomtwi Web Media a perpetual, worldwide, royalty-free licence to use, reproduce, modify, adapt, publish, and display that content in any media.
            </p>
            <p>
              You represent that you own or have the necessary rights to submit such content, and that it does not infringe the rights of any third party. We reserve the right to remove any user-generated content at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">5. Accuracy of Information</h2>
            <p>
              We strive to publish accurate, fair, and timely journalism. However, Bosomtwi Web Media makes no warranty that the information on our website is complete, accurate, or current. News content reflects the situation at the time of publication. We are not liable for any errors or omissions, or for any action taken in reliance on our content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">6. Third-Party Links and Advertising</h2>
            <p>
              Our website may contain links to third-party websites and display third-party advertisements. These are provided for your convenience and do not constitute our endorsement of those sites or their content. We have no control over third-party sites and accept no liability for their content, privacy practices, or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Bosomtwi Web Media and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising from your use of or inability to use the Services, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">8. Disclaimer of Warranties</h2>
            <p>
              The Services are provided on an "as is" and "as available" basis without any warranty of any kind, express or implied. We do not warrant that the Services will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">10. Modifications to the Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page and updating the "last updated" date. Your continued use of the Services after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">11. Contact Us</h2>
            <p>For questions about these Terms, please contact:</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-brand-secondary/10 space-y-1 text-sm">
              <p><strong>Bosomtwi Web Media — Legal Department</strong></p>
              <p>Kumasi, Ashanti Region, Ghana</p>
              <p>Email: <a href="mailto:legal@bosomtwi.web" className="text-ashanti-gold hover:underline">legal@bosomtwi.web</a></p>
              <p>Phone: +233 (0) 302 000 000</p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
