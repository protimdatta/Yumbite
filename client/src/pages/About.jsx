import { motion } from 'framer-motion';
import { Leaf, Sparkles, Shield, Heart, Truck, Award } from 'lucide-react';

const storySections = [
  {
    title: 'Our Beginning',
    content: 'Yumbite was born from a simple idea: fast food doesn\'t have to mean compromised quality. Founded in Cox\'s Bazar, we set out to create a place where bold flavors meet fresh ingredients, where every burger is crafted with care, and where quick service doesn\'t sacrifice taste.',
  },
  {
    title: 'Our Philosophy',
    content: 'Good Food • Good Mood isn\'t just a tagline — it\'s our promise. We believe that what you eat affects how you feel. That\'s why we source ingredients daily, prepare everything fresh to order, and serve with a genuine smile. Your satisfaction is the only metric that matters.',
  },
  {
    title: 'Our Commitment',
    content: 'From our kitchen to your table, quality is non-negotiable. We maintain the highest hygiene standards, train our team extensively, and constantly refine our recipes based on your feedback. Every visit should be better than the last.',
  },
];

const values = [
  { icon: Leaf, title: 'Fresh Daily', desc: 'Ingredients sourced fresh every morning from trusted local suppliers' },
  { icon: Sparkles, title: 'Crafted with Care', desc: 'Every item made to order by our skilled culinary team' },
  { icon: Shield, title: 'Hygiene First', desc: 'Strict food safety protocols and clean kitchen standards' },
  { icon: Heart, title: 'Customer Focused', desc: 'Your experience drives everything we do' },
  { icon: Truck, title: 'Quick Service', desc: 'Fresh doesn\'t mean slow — we respect your time' },
  { icon: Award, title: 'Quality Guaranteed', desc: 'If it\'s not perfect, we\'ll make it right' },
];

const team = [
  { name: 'Chef Ahmed', role: 'Head Chef', bio: '15+ years crafting burgers and leading kitchen teams', initials: 'CA' },
  { name: 'Sarah Rahman', role: 'Operations Manager', bio: 'Ensuring every guest leaves with a smile', initials: 'SR' },
  { name: 'Karim Hassan', role: 'Founder', bio: 'Passionate about bringing quality fast food to Cox\'s Bazar', initials: 'KH' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-yumbite-black">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url(/images/interior.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} aria-hidden="true">
          <div className="absolute inset-0 hero-gradient" />
          <div className="noise-overlay absolute inset-0" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-6">
              OUR STORY
            </span>
            <h1 className="font-display font-bold text-display-xl lg:text-display-lg text-yumbite-white mb-6 leading-[1.02]">
              MORE THAN JUST<span className="block text-gradient-hero"> FAST FOOD</span>
            </h1>
            <p className="text-body-lg lg:text-body-xl text-yumbite-white/70 leading-relaxed">
              At Yumbite, we believe fast food doesn't mean compromised quality. Every burger is crafted with premium ingredients, every chicken piece fried to golden perfection, and every wrap assembled with care.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-yumbite-white/50"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-caption tracking-widest">SCROLL</span>
        </motion.div>
      </motion.section>

      {/* Story Sections */}
      <section className="section-padding bg-yumbite-darker" aria-label="Our Story">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {storySections.map((section, index) => (
              <motion.article
                key={section.title}
                className="relative p-6 lg:p-8 bg-yumbite-charcoal/50 border border-yumbite-border rounded-radius-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-yumbite-yellow/20 to-yumbite-red/20 rounded-full opacity-50" />
                <div className="relative z-10">
                  <span className="font-display font-bold text-4xl lg:text-5xl text-yumbite-yellow/20">{index + 1}</span>
                  <h3 className="font-display font-bold text-heading-xl text-yumbite-white mt-4 mb-4">{section.title}</h3>
                  <p className="text-yumbite-white/60 text-body leading-relaxed">{section.content}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-yumbite-black" aria-label="Our Values">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
              OUR VALUES
            </span>
            <h2 className="font-display font-bold text-display-md lg:text-display-lg text-yumbite-white mb-4">
              What We Stand For
            </h2>
            <p className="text-body-lg text-yumbite-white/60">
              These principles guide every decision we make, from ingredient sourcing to guest service.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="p-6 bg-yumbite-charcoal border border-yumbite-border rounded-radius-xl hover:border-yumbite-yellow/30 hover:bg-yumbite-yellow/5 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="w-14 h-14 rounded-radius-xl bg-yumbite-yellow/10 border border-yumbite-yellow/20 flex items-center justify-center mb-5 group-hover:border-yumbite-yellow/50 group-hover:bg-yumbite-yellow/20 transition-all duration-300">
                  <value.icon className="w-7 h-7 text-yumbite-yellow" aria-hidden="true" />
                </div>
                <h3 className="font-display font-semibold text-heading-md text-yumbite-white mb-2">{value.title}</h3>
                <p className="text-yumbite-white/60 text-body-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-yumbite-darker" aria-label="Our Team">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
              MEET THE TEAM
            </span>
            <h2 className="font-display font-bold text-display-md lg:text-display-lg text-yumbite-white mb-4">
              The People Behind Yumbite
            </h2>
            <p className="text-body-lg text-yumbite-white/60">
              Passionate individuals dedicated to making your dining experience memorable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-5 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-3xl lg:text-4xl text-yumbite-ink shadow-shadow-glow-yellow">
                  {member.initials}
                </div>
                <h3 className="font-display font-semibold text-heading-lg text-yumbite-white mb-1">{member.name}</h3>
                <p className="text-yumbite-yellow text-body-sm font-medium mb-3">{member.role}</p>
                <p className="text-yumbite-white/60 text-body-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <motion.section
        className="py-16 lg:py-20 bg-yumbite-black border-t border-yumbite-border"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container-custom text-center">
          <h2 className="font-display font-bold text-display-sm lg:text-display-md text-yumbite-white mb-4">
            Visit Us in Cox's Bazar
          </h2>
          <p className="text-body-lg text-yumbite-white/60 mb-8 max-w-xl mx-auto">
            Experience the Yumbite moment in person. Great food, good vibes, and a team that cares.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find Us
          </a>
        </div>
      </motion.section>
    </div>
  );
}