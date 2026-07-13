'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Building2, Globe, Send, CheckCircle, ArrowRight, HeadphonesIcon, HandshakeIcon, Radio } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/landing/Footer';

const channels = [
  { icon: HeadphonesIcon, title: 'Technical Support', desc: '24/7 dedicated engineering support', href: '#' },
  { icon: HandshakeIcon, title: 'Sales & Enterprise', desc: 'Custom volume pricing and terms', href: '#' },
  { icon: Radio, title: 'Media Relations', desc: 'Press inquiries and brand assets', href: '#' },
];

const hubs = [
  { icon: Building2, name: 'New York, USA', lines: ['1 World Trade Center', 'Suite 4500', 'New York, NY 10007'] },
  { icon: Globe, name: 'Lagos, Nigeria', lines: ['Landmark Towers', '5B Water Corporation Road', 'Victoria Island, Lagos'] },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    subject: 'Platform Integration',
    message: ''
  });
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setTimeout(() => {
      setStatus('SUCCESS');
      setFormData({ fullName: '', workEmail: '', subject: 'Platform Integration', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Get in touch
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
              >
                Let&apos;s talk about your <span className="text-primary">next project</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-500 leading-relaxed"
              >
                Whether you need technical support, enterprise solutions, or have a partnership inquiry — our team is ready to help.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="py-20 -mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
                    <p className="text-sm text-gray-500">Fill out the form below and we&apos;ll get back to you within 2 hours.</p>
                  </div>

                  {status === 'SUCCESS' ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent successfully</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                        Thanks for reaching out. We&apos;ll review your inquiry and get back to you shortly.
                      </p>
                      <button
                        onClick={() => setStatus('IDLE')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Send another message
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="fullName">Full name</label>
                          <input
                            required
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="workEmail">Work email</label>
                          <input
                            required
                            id="workEmail"
                            type="email"
                            value={formData.workEmail}
                            onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="jane@company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="subject">Subject</label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option>Platform Integration</option>
                          <option>Enterprise Sales</option>
                          <option>Technical Support</option>
                          <option>Partnerships</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="message">Message</label>
                        <textarea
                          required
                          id="message"
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                          placeholder="Tell us how we can help..."
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          disabled={status === 'SUBMITTING'}
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-50 w-full md:w-auto"
                        >
                          {status === 'SUBMITTING' ? 'Sending...' : 'Send message'}
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-5 space-y-8"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Direct channels</h3>
                  <div className="space-y-4">
                    {channels.map((channel, i) => (
                      <a
                        key={i}
                        href={channel.href}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                          <channel.icon size={18} className="text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{channel.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{channel.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Global offices</h3>
                  <div className="space-y-8">
                    {hubs.map((hub, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <hub.icon size={16} className="text-primary" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">{hub.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed ml-12">
                          {hub.lines.map((line, j) => (
                            <React.Fragment key={j}>
                              {line}<br />
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">Quick response</h3>
                  <p className="text-sm leading-relaxed text-white/90 mb-6">
                    Most inquiries receive a response within 2 hours. For urgent issues, our support team is available 24/7.
                  </p>
                  <a
                    href="mailto:support@invoiceos.com"
                    className="inline-flex items-center gap-2 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-all px-5 py-2.5 rounded-xl backdrop-blur-sm"
                  >
                    <Mail size={16} />
                    support@invoiceos.com
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
