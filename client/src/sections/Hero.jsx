import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Hero() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section
      className="hero-section relative flex min-h-[400px] items-center overflow-hidden border-b border-yumbite-yellow/30 pt-16 pb-8 lg:min-h-[400px] lg:pt-20 lg:pb-0"
      aria-label="Yumbite Hero"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: 'url(/images/exterior.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: theme === 'light' ? 1 : 0.75 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <div
          className="hero-background-overlay absolute inset-0 bg-yumbite-black/50"
          style={{ backgroundColor: `rgb(var(--yumbite-black) / ${theme === 'light' ? 0.1 : 0.5})` }}
        />
      </motion.div>

      <div className="container-custom relative z-20 w-full py-6 lg:py-5">
        <div className="grid w-full items-center justify-items-start">
          {/* Left Content */}
          <motion.div
            className="hero-copy relative isolate w-full max-w-xl text-left"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Welcome Label */}
            <motion.div
              className={`hero-welcome mb-3 inline-flex items-center text-caption font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-yumbite-yellow-fill' : 'text-yumbite-yellow'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              WELCOME TO YUMBYTE
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className={`mb-3 font-display text-4xl font-bold leading-[1.02] ${isLight ? 'text-white' : 'text-yumbite-white'} sm:text-5xl lg:text-6xl`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="block">Fresh Food</span>
              <span className={`block ${isLight ? 'text-yumbite-yellow-fill' : 'text-yumbite-yellow'}`}>Great Vibes</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              className={`mb-4 max-w-lg text-body-sm leading-relaxed ${isLight ? 'text-white/90' : 'text-yumbite-white/75'} sm:text-body`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Burgers, fries, shawarma and more, made with love and served with happiness.
            </motion.p>

            {/* Handwritten Decorative Text */}
            <motion.div
              className={`hero-decoration mb-4 flex items-center gap-3 font-handwritten text-xl ${isLight ? 'text-yumbite-yellow-fill/90' : 'text-yumbite-yellow/90'} sm:text-2xl`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="relative">Taste the Happiness</span>
              <motion.div
                className="w-16 h-px bg-gradient-to-r from-yumbite-yellow to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                to="/menu"
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10">VIEW MENU</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                <motion.div
                  className="absolute inset-0 bg-yumbite-yellow-dark scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary group"
                style={isLight ? { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.72)' } : undefined}
              >
                <MapPin className="w-5 h-5" aria-hidden="true" />
                <span>FIND US</span>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}