import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Mail, TrendingUp, Users, BarChart2, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface AdvertiseProps {
  onBack?: () => void;
}

const PACKAGES = [
  {
    name: 'Bronze',
    price: 'GH₵500',
    period: '/month',
    description: 'Perfect for local businesses reaching the Kumasi market.',
    features: [
      'Leaderboard banner (homepage)',
      '10,000 guaranteed impressions',
      'Standard ad placement rotation',
      'Basic performance report',
      '1 active creative',
    ],
    accent: '#6B7280',
    popular: false,
  },
  {
    name: 'Silver',
    price: 'GH₵1,500',
    period: '/month',
    description: 'Ideal for regional brands seeking consistent visibility.',
    features: [
      'All ad placements (leaderboard, rectangle, square)',
      '50,000 guaranteed impressions',
      'Priority rotation in high-traffic slots',
      'Weekly analytics dashboard',
      '3 active creatives',
      'Category-targeted placement',
    ],
    accent: '#0A1B35',
    popular: false,
  },
  {
    name: 'Gold',
    price: 'GH₵3,500',
    period: '/month',
    description: 'Maximum exposure for national and international brands.',
    features: [
      'All Silver benefits',
      '150,000 guaranteed impressions',
      'Premium homepage hero placement',
      'Newsletter banner (40,000+ subscribers)',
      'Dedicated account manager',
      'Monthly strategy call',
      'Unlimited creatives',
      'Real-time reporting portal',
    ],
    accent: '#E09E2B',
    popular: true,
  },
  {
    name: 'Sponsored Content',
    price: 'GH₵800',
    period: '/article',
    description: 'Native editorial content that informs and engages our audience.',
    features: [
      'Long-form article written by our team',
      'Published across all relevant categories',
      'Permanent archive listing',
      'Social media promotion (all channels)',
      'Newsletter feature placement',
      'SEO-optimised headline and metadata',
    ],
    accent: '#2D7A31',
    popular: false,
  },
];

const STATS = [
  { value: '45k+', label: 'Monthly Readers', icon: Users },
  { value: '3.8min', label: 'Avg. Time on Site', icon: TrendingUp },
  { value: '40k+', label: 'Newsletter Subscribers', icon: Mail },
  { value: '9', label: 'News Categories', icon: BarChart2 },
];

export default function Advertise({ onBack }: AdvertiseProps) {
  const [form, setForm] = useState({ name: '', email: '', company: '', package: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-news-bg">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-news-text/40 hover:text-ashanti-gold mb-10 group transition-colors"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        )}
      </div>

      {/* Hero */}
      <section className="bg-brand-surface border-b border-brand-secondary/10 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ashanti-gold rounded-2xl text-black mb-6">
              <Megaphone size={30} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-news-text mb-6">
              Advertise With <span className="text-ashanti-gold">Bosomtwi Web</span>
            </h1>
            <p className="text-xl text-news-text/60 max-w-2xl mx-auto leading-relaxed">
              Reach a highly engaged audience of news consumers across the Ashanti Region, Ghana, and the wider diaspora. Our readers are decision-makers, business owners, and community leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-brand-secondary/10 p-6 text-center shadow-sm">
              <Icon size={24} className="text-ashanti-gold mx-auto mb-3" />
              <div className="text-3xl font-black text-news-text mb-1">{value}</div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-news-text/40">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-news-text mb-4">Advertising Packages</h2>
          <p className="text-news-text/50 text-lg">Choose the plan that fits your goals. All prices in Ghanaian Cedis.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.name}
              className={`bg-white rounded-3xl border p-8 relative shadow-sm transition-shadow hover:shadow-xl ${pkg.popular ? 'border-ashanti-gold ring-2 ring-ashanti-gold/20' : 'border-brand-secondary/10'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-ashanti-gold text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-news-text">{pkg.name}</h3>
                  <p className="text-news-text/50 text-sm mt-1">{pkg.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-3xl font-black" style={{ color: pkg.accent }}>{pkg.price}</span>
                  <span className="text-news-text/40 text-sm font-medium">{pkg.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-news-text/70">
                    <Check size={15} className="shrink-0 mt-0.5" style={{ color: pkg.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setForm(prev => ({ ...prev, package: pkg.name }))}
                className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02]"
                style={{ backgroundColor: pkg.accent, color: pkg.accent === '#E09E2B' ? '#000' : '#fff' }}
              >
                Select {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-brand-surface border-t border-brand-secondary/10 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-news-text mb-4">Start Your Campaign</h2>
            <p className="text-news-text/50">Fill out the form below and our sales team will contact you within 24 hours.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-brand-secondary/10 p-12 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-ashanti-gold rounded-full flex items-center justify-center text-black mx-auto mb-6">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-black text-news-text mb-3">Enquiry Received!</h3>
              <p className="text-news-text/50 leading-relaxed">
                Thank you for your interest in advertising with Bosomtwi Web. Our sales team will reach out to you at <strong>{form.email}</strong> within 24 business hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-brand-secondary/10 p-8 md:p-10 shadow-sm space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-news-text/40 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-text/20"
                    placeholder="Kwame Mensah"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-news-text/40 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-text/20"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-news-text/40 mb-2">Company / Brand *</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all placeholder:text-news-text/20"
                    placeholder="Ashanti Gold Bank"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-news-text/40 mb-2">Package Interest</label>
                  <select
                    value={form.package}
                    onChange={e => setForm(p => ({ ...p, package: e.target.value }))}
                    className="w-full border-b-2 border-brand-accent bg-transparent py-3 font-semibold text-news-text focus:outline-none focus:border-ashanti-gold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a package</option>
                    {PACKAGES.map(pkg => (
                      <option key={pkg.name} value={pkg.name}>{pkg.name} — {pkg.price}{pkg.period}</option>
                    ))}
                    <option value="Custom">Custom / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-news-text/40 mb-2">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full border-2 border-brand-accent bg-gray-50 rounded-2xl p-4 font-medium text-news-text focus:outline-none focus:border-ashanti-gold transition-all resize-none placeholder:text-news-text/20 text-[15px]"
                  placeholder="Tell us about your campaign goals, target audience, and preferred timeline..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-ashanti-gold hover:bg-news-text text-black hover:text-ashanti-gold py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 group"
              >
                <span>Submit Enquiry</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-[10px] uppercase tracking-widest font-bold text-news-text/25 pt-2">
                Or email us directly at{' '}
                <a href="mailto:ads@bosomtwi.web" className="text-ashanti-gold hover:underline">ads@bosomtwi.web</a>
              </p>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
