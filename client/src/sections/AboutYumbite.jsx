import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Shield, Truck, Heart, Leaf } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'Sourced daily from local markets. Every bite bursts with natural flavor and quality.',
  },
  {
    icon: Sparkles,
    title: 'Skilled Chefs',
    description: 'Our culinary team brings years of expertise and passion to every dish they create.',
  },
  {
    icon: Shield,
    title: 'Hygienic & Safe',
    description: 'Strict food safety standards. Clean kitchen, safe preparation, peace of mind.',
  },
  {
    icon: Heart,
    title: 'Customer Satisfaction',
    description: 'Your happiness is our priority. We listen, improve, and serve with a smile.',
  },
];

export default function AboutYumbite() {
  const useVerticalEntrance = window.innerWidth < 1440;
  return (
    <section 
      id="about"
      className="relative border-b border-yumbite-border bg-yumbite-darker py-7 sm:py-9 lg:py-10"
      aria-label="About Yumbite"
    >
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      
      {/* Background Accent */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-yumbite-yellow/10 via-transparent to-yumbite-red/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="container-custom relative">
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: useVerticalEntrance ? 0 : -60, y: useVerticalEntrance ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-radius-lg bg-yumbite-charcoal">
              <img
                src="/images/interior.png"
                alt="Yumbite restaurant interior - modern dining space"
                className="w-full h-full object-cover img-zoom"
                loading="lazy"
              />
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-6 left-6 w-32 h-32 border-2 border-yumbite-yellow/50 rounded-radius-xl rotate-6" />
              <div className="absolute bottom-6 right-6 w-24 h-24 border-b-2 border-r-2 border-yumbite-red/50" />
              
              {/* Floating Label */}
              <motion.div
                className="hidden"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="font-display font-bold text-heading-sm">YUMBYTE EXPERIENCE</div>
                <div className="font-handwritten text-yumbite-red text-lg mt-1">Good Food • Good Mood</div>
              </motion.div>
            </div>

            {/* Small Image Crops */}
            <div className="hidden">
              <motion.div
                className="aspect-square rounded-radius-lg overflow-hidden bg-yumbite-charcoal"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <img
                  src="/images/interior.png"
                  alt="Restaurant seating area"
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
              </motion.div>
              <motion.div
                className="aspect-square rounded-radius-lg overflow-hidden bg-yumbite-charcoal"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-yumbite-red/20 to-yumbite-yellow/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="font-display font-bold text-3xl lg:text-4xl text-yumbite-yellow">5.0</div>
                    <div className="text-yumbite-white/70 text-body-sm">Google Rating</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="min-w-0"
            initial={{ opacity: 0, x: useVerticalEntrance ? 0 : 60, y: useVerticalEntrance ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Label */}
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative">
                <span className="relative z-10">ABOUT</span>
              </span>
              <span className="relative">
                <span className="relative z-10">YUMBYTE</span>
              </span>
            </motion.span>

            {/* Main Headline */}
            <motion.h2
              className="mt-2 mb-3 font-display text-heading-lg font-bold leading-tight text-yumbite-white lg:text-heading-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              More Than Just Fast Food
            </motion.h2>

            {/* Description */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-body-lg text-yumbite-white/70 leading-relaxed">
                At Yumbite, we serve delicious fast food with fresh ingredients and a cozy atmosphere. Our goal is to make every meal a happy moment for you.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-2 gap-1 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex min-w-0 items-center gap-2 p-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-yumbite-yellow">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-display text-caption font-semibold leading-tight text-yumbite-white sm:text-body-sm">
                      {feature.title}
                    </h4>
                    <p className="sr-only">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="mt-3 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <a href="/menu" className="btn-primary">
                Explore Our Menu
              </a>
              <a href="/contact" className="btn-secondary">
                Visit Us
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}