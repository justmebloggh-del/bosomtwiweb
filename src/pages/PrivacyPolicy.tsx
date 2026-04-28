import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-news-text">Privacy Policy</h1>
            <p className="text-sm text-news-text/40 mt-1">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="space-y-10 text-news-text/75 leading-relaxed">

          <p className="text-lg text-news-text/80 border-l-4 border-ashanti-gold pl-6 italic">
            Bosomtwi Web Media ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you visit bosomtwi.web.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">1. Information We Collect</h2>
            <p className="mb-3">We collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Information you provide directly</strong> — such as your name and email address when subscribing to our newsletter or creating an account.</li>
              <li><strong>Usage data</strong> — pages viewed, time spent, referring URLs, device type, browser, and IP address, collected automatically when you access our site.</li>
              <li><strong>Cookies and tracking technologies</strong> — used to remember your preferences and improve your experience. See Section 6 for full details.</li>
              <li><strong>Communications</strong> — if you contact us by email, we retain that correspondence.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">2. How We Use Your Information</h2>
            <p className="mb-3">We use collected data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Deliver personalised news content and newsletters you have subscribed to.</li>
              <li>Operate, maintain, and improve our website and editorial systems.</li>
              <li>Communicate with you about your account, new features, or important notices.</li>
              <li>Measure audience engagement and analyse traffic patterns to improve our journalism.</li>
              <li>Detect and prevent fraud, spam, and security threats.</li>
              <li>Comply with legal obligations applicable in Ghana and internationally.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">3. Information Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell your personal information. We may share data in these circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service providers</strong> — trusted third-party vendors who assist us with hosting, analytics, and email delivery, under strict data-processing agreements.</li>
              <li><strong>Legal compliance</strong> — when required by Ghanaian law, court order, or to protect our rights and users' safety.</li>
              <li><strong>Business transfers</strong> — if Bosomtwi Web Media is acquired or merged, user data may be transferred as part of that transaction.</li>
              <li><strong>Advertising partners</strong> — only aggregated, non-identifiable data is shared with our advertising network to serve relevant ads.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">4. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfil the purposes for which it was collected. Newsletter subscriber data is retained until you unsubscribe. Account data is retained for the lifetime of your account and up to 12 months after deletion, after which it is permanently purged.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures — including TLS encryption, secure data centres, and access controls — to protect your information against unauthorised access, disclosure, alteration, and destruction. No method of internet transmission is 100% secure; we encourage you to use strong passwords and to contact us immediately if you suspect any breach.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">6. Cookies</h2>
            <p className="mb-3">We use the following categories of cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Strictly necessary</strong> — essential for the site to function (authentication, security).</li>
              <li><strong>Analytics</strong> — help us understand how visitors use our site (e.g. Google Analytics). Data is aggregated and anonymised.</li>
              <li><strong>Advertising</strong> — used by our ad partners to serve relevant advertisements. You may opt out via your browser settings or industry opt-out tools.</li>
            </ul>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may limit some features of the site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">7. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data ("right to be forgotten").</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Data portability — receive your data in a machine-readable format.</li>
              <li>Withdraw consent at any time (e.g., unsubscribe from newsletters).</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@bosomtwi.web" className="text-ashanti-gold hover:underline">privacy@bosomtwi.web</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">8. Children's Privacy</h2>
            <p>
              Bosomtwi Web is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify registered users of significant changes by email and post the updated policy on this page with a revised "last updated" date. Continued use of the site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-news-text mb-4">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact:</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-brand-secondary/10 space-y-1 text-sm">
              <p><strong>Bosomtwi Web Media</strong></p>
              <p>Kumasi, Ashanti Region, Ghana</p>
              <p>Email: <a href="mailto:privacy@bosomtwi.web" className="text-ashanti-gold hover:underline">privacy@bosomtwi.web</a></p>
              <p>Phone: +233 (0) 302 000 000</p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
