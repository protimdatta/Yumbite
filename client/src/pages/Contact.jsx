import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { BRAND, openMaps, callYumbite, openFacebook } from '../utils/brand';
import { contactAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const useVerticalEntrance = window.innerWidth < 1440;
  // Built at render time so Admin → Settings edits apply site-wide
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: BRAND.addressLines.length >= 2
        ? [BRAND.addressLines.slice(0, -1).join(', '), BRAND.addressLines[BRAND.addressLines.length - 1]]
        : [BRAND.addressShort],
      action: openMaps,
      actionLabel: 'Get Directions',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [BRAND.phoneDisplay],
      action: callYumbite,
      actionLabel: 'Call Now',
    },
    {
      icon: Clock,
      title: 'Opening Hours',
      details: ['Open Daily', '11:00 AM - 11:00 PM'],
      action: null,
      actionLabel: null,
    },
    {
      icon: Mail,
      title: 'Follow Us',
      details: ['@yumbite.coxsbazar'],
      action: openFacebook,
      actionLabel: 'Facebook',
    },
  ];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email and message');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const r = await contactAPI.send({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });
      setSubmitStatus('success');
      toast.success(r.message || 'Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setSubmitStatus('error');
      toast.error(err.message || 'Could not send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-yumbite-black">
      {/* Page Header */}
      <motion.header
        className="relative pt-28 pb-12 lg:pt-32 lg:pb-16 bg-yumbite-darker border-b border-yumbite-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom relative">
          <motion.div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
              CONTACT US
            </span>
            <h1 className="font-display font-bold text-display-xl lg:text-display-lg text-yumbite-white mb-4">
              Get In Touch
            </h1>
            <p className="text-body-lg text-yumbite-white/60">
              Have a question? Want to give feedback? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Contact Info & Form */}
      <section className="section-padding bg-yumbite-black">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info Cards */}
            <motion.div
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: useVerticalEntrance ? 0 : -40, y: useVerticalEntrance ? 20 : 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="card-base p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-radius-xl bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-yumbite-yellow" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-heading-sm text-yumbite-white mb-2">{item.title}</h3>
                      <div className="space-y-1 text-yumbite-white/70 text-body-sm">
                        {item.details.map((detail, i) => (
                          <div key={i}>{detail}</div>
                        ))}
                      </div>
                      {item.action && (
                        <button
                          onClick={item.action}
                          className="mt-3 inline-flex items-center gap-2 text-yumbite-yellow font-semibold text-body-sm hover:text-yumbite-yellow-dark transition-colors"
                        >
                          {item.actionLabel}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Quick CTA Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <motion.button
                  onClick={openMaps}
                  className="btn-primary py-4"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Get Directions</span>
                </motion.button>
                <motion.button
                  onClick={callYumbite}
                  className="btn-secondary py-4"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Call Now</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: useVerticalEntrance ? 0 : 40, y: useVerticalEntrance ? 20 : 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="card-base p-6 lg:p-8">
                <h2 className="font-display font-bold text-heading-xl text-yumbite-white mb-6">Send Us a Message</h2>

                {submitStatus === 'success' && (
                  <motion.div
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-radius-lg flex items-center gap-3 text-green-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Message Sent!</p>
                      <p className="text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    className="mb-6 p-4 bg-yumbite-red/10 border border-yumbite-red/30 rounded-radius-lg flex items-center gap-3 text-yumbite-red"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Send className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Could not send message</p>
                      <p className="text-sm">Please try again, call us, or message on Facebook.</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="label-base">Your Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-base"
                        required
                        placeholder="John Doe"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="label-base">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-base"
                        required
                        placeholder="john@example.com"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="label-base">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-base"
                        placeholder="01313-886160"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="label-base">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="input-base appearance-none bg-yumbite-charcoal"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="catering">Catering & Events</option>
                        <option value="careers">Careers</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="label-base">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="input-base min-h-[150px] resize-y"
                      required
                      placeholder="Tell us how we can help..."
                      aria-required="true"
                      rows={5}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto btn-primary justify-center gap-2 py-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative bg-yumbite-darker border-t border-yumbite-border" aria-label="Location map">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <motion.div
            className="aspect-[16/9] rounded-radius-2xl overflow-hidden bg-yumbite-charcoal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-full h-full bg-gradient-to-br from-yumbite-red/20 via-yumbite-black to-yumbite-yellow/10 flex items-center justify-center relative">
              <img
                src="/images/exterior.jpg"
                alt="Yumbite restaurant location"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent" />
              
              <div className="relative z-10 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-yumbite-yellow-fill flex items-center justify-center mx-auto mb-4 shadow-shadow-glow-yellow">
                  <MapPin className="w-10 h-10 text-yumbite-ink" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-heading-xl lg:text-display-sm text-yumbite-white mb-2">
                  YUMBYTE
                </h3>
                <p className="text-yumbite-white/70 text-body-lg mb-6">
                  CXRJ+JH7, Buddhist Temple Rd, Cox's Bazar
                </p>
                <button
                  onClick={openMaps}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                  Open in Google Maps
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <motion.section
        className="section-padding bg-yumbite-black border-t border-yumbite-border"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
              FAQ
            </span>
            <h2 className="font-display font-bold text-display-md text-yumbite-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-body-lg text-yumbite-white/60">
              Quick answers to common questions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'What are your opening hours?', a: 'We\'re open daily from 11:00 AM to 11:00 PM.' },
              { q: 'Do you offer delivery?', a: 'Yes! We offer delivery within Cox\'s Bazar. You can order through our website or call us directly.' },
              { q: 'Is there parking available?', a: 'Yes, we have parking space available for customers near the restaurant.' },
              { q: 'Do you have vegetarian options?', a: 'Absolutely! We have veggie wraps, fries, and several vegetarian-friendly sides.' },
              { q: 'Can I host a private event?', a: 'Yes, we cater for private events. Contact us for more details and custom menus.' },
              { q: 'Do you accept card payments?', a: 'We accept cash, bKash, Nagad, and all major credit/debit cards.' },
            ].map((faq, index) => (
              <motion.details
                key={index}
                className="group card-base overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <summary className="flex items-center justify-between p-5 lg:p-6 cursor-pointer list-none">
                  <span className="font-display font-medium text-heading-sm text-yumbite-white pr-10">{faq.q}</span>
                  <svg className="w-6 h-6 text-yumbite-yellow/70 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 lg:px-6 pb-6 text-yumbite-white/60 text-body leading-relaxed border-t border-yumbite-border">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}