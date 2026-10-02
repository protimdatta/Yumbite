import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation2, ChevronRight } from 'lucide-react';
import { BRAND, openMaps, callYumbite, openFacebook } from '../utils/brand';

export default function LocationSection() {
  const address = {
    lines: [
      'CXRJ+JH7',
      'Buddhist Temple Rd',
      "Cox's Bazar, Bangladesh"
    ],
    mapsQuery: "Yumbite, Buddhist Temple Road, Cox's Bazar"
  };

  return (
    <section 
      id="contact"
      className="relative section-padding bg-yumbite-black"
      aria-label="Location & Contact"
    >
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-yumbite-yellow/10 via-transparent to-yumbite-red/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Map/Location Visual */}
          <motion.div
            className="lg:col-span-2 relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[16/9] rounded-radius-2xl overflow-hidden bg-yumbite-charcoal">
              {/* Map placeholder with image */}
              <div className="w-full h-full bg-gradient-to-br from-yumbite-red/20 via-yumbite-black to-yumbite-yellow/10 flex items-center justify-center relative">
                <img
                  src="/images/exterior.jpg"
                  alt="Yumbite restaurant location exterior"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent" />
                
                {/* Location Pin */}
                <motion.div
                  className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-yumbite-yellow-fill flex items-center justify-center shadow-shadow-glow-yellow">
                    <MapPin className="w-10 h-10 lg:w-12 lg:h-12 text-yumbite-ink" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-heading-lg lg:text-heading-xl text-yumbite-white">
                      YUMBYTE
                    </div>
                    <div className="text-yumbite-white/70 text-body-sm">Find Us Here</div>
                  </div>
                </motion.div>

                {/* Get Directions Button */}
                <button
                  onClick={openMaps}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 btn-primary group"
                >
                  <Navigation2 className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  GET DIRECTIONS
                </button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-32 h-32 border-2 border-yumbite-yellow/30 rounded-radius-xl rotate-12" />
              <div className="absolute bottom-6 left-6 w-24 h-24 border-b-2 border-l-2 border-yumbite-red/50" />
            </div>

            {/* Location Info Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: MapPin, label: 'Address', value: BRAND.addressShort },
                { icon: Phone, label: 'Phone', value: BRAND.phoneDisplay, action: callYumbite },
                { icon: Clock, label: 'Hours', value: BRAND.hours },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className="group relative p-5 bg-yumbite-charcoal border border-yumbite-border rounded-radius-xl hover:border-yumbite-yellow/30 hover:bg-yumbite-yellow/5 transition-all duration-300 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-radius-lg bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center group-hover:border-yumbite-yellow/50 group-hover:bg-yumbite-yellow/20 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-yumbite-yellow" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-body-sm text-yumbite-white/60">{item.label}</span>
                  </div>
                  <p className="font-semibold text-body text-yumbite-white">{item.value}</p>
                  {item.action && (
                    <motion.div
                      className="absolute inset-0 bg-yumbite-yellow/5 rounded-radius-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Contact Form / Info */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-yumbite-charcoal border border-yumbite-border rounded-radius-2xl p-6 lg:p-8 h-full">
              <div className="mb-8">
                <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
                  VISIT US
                </span>
                <h3 className="font-display font-bold text-heading-xl text-yumbite-white mb-4">
                  Find Yumbite
                </h3>
                <p className="text-yumbite-white/60 text-body-sm leading-relaxed">
                  Located in the heart of Cox's Bazar, just off Buddhist Temple Road. 
                  Easy to find, hard to forget.
                </p>
              </div>

              {/* Address Details */}
              <div className="space-y-5 mb-8">
                {address.lines.map((line, index) => (
                  <motion.div
                    key={line}
                    className="flex items-start gap-4 p-4 bg-yumbite-black/50 border border-yumbite-border rounded-radius-lg"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-radius-md bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-yumbite-yellow" aria-hidden="true" />
                    </div>
                    <span className="text-yumbite-white text-body-sm leading-relaxed">{line}</span>
                  </motion.div>
                ))}

                <motion.button
                  onClick={openMaps}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow font-semibold text-body-sm rounded-radius-lg hover:bg-yumbite-yellow/20 hover:border-yumbite-yellow/50 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <Navigation2 className="w-5 h-5" aria-hidden="true" />
                  Open in Google Maps
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </motion.button>
              </div>

              {/* Contact Info */}
              <div className="border-t border-yumbite-border pt-6 space-y-5">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="w-10 h-10 rounded-radius-md bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-yumbite-yellow" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-yumbite-white/60 text-caption uppercase tracking-wide">Call Us</div>
                    <button
                      onClick={callYumbite}
                      className="font-semibold text-body text-yumbite-white hover:text-yumbite-yellow transition-colors"
                    >
                      01313-886160
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="w-10 h-10 rounded-radius-md bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yumbite-yellow" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-yumbite-white/60 text-caption uppercase tracking-wide">Opening Hours</div>
                    <div className="font-semibold text-body text-yumbite-white">Open Daily · 11 AM - 11 PM</div>
                  </div>
                </motion.div>

                <motion.a
                  href={BRAND.FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="w-10 h-10 rounded-radius-md bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yumbite-yellow" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.77,7.29H15.4V4.67c0-1.03.64-1.74,1.78-1.74H18.77V7.29z M24,12.07C24,6.57 19.6,2.1 12.5,2.1S1,6.57 1,12.07c0,3.56 1.67,6.6 4.33,8.5V21h2.7v-7.5h2.6v7.5H13V15.4c0-.86 0-1.72 1.04-1.72h2.6V9.9c-.97-.2-2.1-.6-3.5-.6-2.8 0-4.7 1.9-4.7 4.7v3.8H7.5V21h3.8v-7.5c0 0 1.6 0 1.9-.01V21H24c5.5 0 10-4.5 10-10S19.5 2.07 12.5 2.07" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-yumbite-white/60 text-caption uppercase tracking-wide">Follow Us</div>
                    <div className="font-semibold text-body text-yumbite-white hover:text-yumbite-yellow transition-colors">@yumbite.coxsbazar</div>
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}