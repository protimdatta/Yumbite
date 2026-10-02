import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Heart, Smile, Repeat } from 'lucide-react';

const statements = [
  { text: 'BITE.', icon: Sparkles, color: '#FFC400' },
  { text: 'TASTE.', icon: Heart, color: '#E50914' },
  { text: 'SMILE.', icon: Smile, color: '#FFC400' },
  { text: 'REPEAT.', icon: Repeat, color: '#E50914' },
];

export default function YumbiteMoment() {
  const containerRef = useRef(null);
  // Global page scroll instead of target tracking: a `target` makes
  // framer-motion measure against the (static) <html> scroller and warn.
  // Same journey mapping as offset ['start end', 'end start'], measured once.
  const { scrollY } = useScroll();
  const [range, setRange] = useState([0, 1]);
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setRange([top - window.innerHeight, top + el.offsetHeight]);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const scrollYProgress = useTransform(scrollY, range, [0, 1]);
  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-65%']);
  const decoX = useTransform(scrollYProgress, [0, 1], ['0%', '60px']);
  const fadeOut = useTransform(scrollYProgress, [0, 0.15, 0.35], [1, 1, 0]);

  return (
    <section ref={containerRef} id="moment" className="relative bg-yumbite-darker overflow-hidden" aria-label="The Yumbite Moment" style={{ height: '300vh' }}>
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="w-full">
          <motion.div className="flex items-center gap-12 lg:gap-20 pl-[6vw] w-max" style={{ x }} >
            <div className="w-[80vw] lg:w-[38vw] flex-shrink-0">
              <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-6">SIGNATURE</span>
              <h2 className="font-display font-bold text-display-xl lg:text-[clamp(3.5rem,7vw,7rem)] leading-[0.95] text-yumbite-white uppercase tracking-tight">THE YUMBYTE<br /><span className="text-gradient-hero">MOMENT</span></h2>
              <p className="font-handwritten text-2xl lg:text-3xl text-yumbite-yellow/90 mt-6">Bite Into Happiness</p>
            </div>
            <motion.div className="relative flex-shrink-0 w-[85vw] lg:w-[520px] h-[480px] lg:h-[600px]" style={{ x: decoX }}>
              <div className="absolute inset-0 rounded-radius-2xl overflow-hidden bg-yumbite-charcoal">
                <img src="/images/interior.png" alt="Yumbite restaurant interior experience" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/70 via-transparent to-yumbite-yellow/10" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-yumbite-yellow-fill text-yumbite-ink font-semibold text-body-sm rounded-radius-md">GOOD FOOD</span>
                  <span className="px-3 py-1.5 bg-yumbite-red text-yumbite-white font-semibold text-body-sm rounded-radius-md">GOOD MOOD</span>
                  <span className="px-3 py-1.5 bg-yumbite-black/80 backdrop-blur-sm border border-yumbite-border text-yumbite-white font-semibold text-body-sm rounded-radius-md">YUMBYTE EXPERIENCE</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-52 h-52 lg:w-64 lg:h-64 rounded-radius-xl overflow-hidden bg-yumbite-charcoal shadow-shadow-xl border border-yumbite-border">
                <img src="/images/exterior.jpg" alt="Yumbite exterior" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </motion.div>
            <div className="flex-shrink-0 w-[80vw] lg:w-[36vw] flex flex-col justify-center gap-6 lg:gap-8 pr-[6vw]">
              {statements.map((s, i) => (
                <motion.div key={s.text} className="flex items-center gap-4" initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-yumbite-charcoal border border-yumbite-border flex items-center justify-center flex-shrink-0"><s.icon className="w-7 h-7" style={{ color: s.color }} aria-hidden="true" /></div>
                  <span className="font-display font-bold text-heading-xl lg:text-display-md uppercase tracking-tight" style={{ color: s.color }}>{s.text}</span>
                </motion.div>
              ))}
              <p className="text-yumbite-white/60 text-body border-t border-yumbite-border pt-6">Every visit. Every bite. Every moment.</p>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-yumbite-white/40" style={{ opacity: fadeOut }} aria-hidden="true">
        <span className="text-caption tracking-widest">SCROLL TO EXPERIENCE</span>
        <div className="w-40 h-px bg-yumbite-border relative overflow-hidden"><motion.div className="absolute inset-0 bg-gradient-to-r from-yumbite-yellow to-yumbite-red origin-left" style={{ scaleX: scrollYProgress }} /></div>
      </motion.div>
    </section>
  );
}