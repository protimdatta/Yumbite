import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Facebook, Linkedin, Globe, ArrowUpRight, GraduationCap, Code2, MapPin } from 'lucide-react';
import { DEVELOPER } from '../../utils/developer';

function socialIcon(label) {
  if (label === 'Facebook') return Facebook;
  if (label === 'LinkedIn') return Linkedin;
  return Globe;
}

export function DeveloperPhoto({ className = 'w-24 h-24 rounded-full', textClass = 'text-3xl' }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={DEVELOPER.photo}
        alt={DEVELOPER.name}
        onError={() => setFailed(true)}
        className={`${className} object-cover`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${className} bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink ${textClass}`}>
      {DEVELOPER.initials}
    </div>
  );
}

export default function DeveloperModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="About the developer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-radius-2xl overflow-hidden bg-yumbite-card border border-yumbite-border shadow-shadow-xl"
          >
            {/* Cover banner */}
            <div className="relative h-28 bg-gradient-to-r from-yumbite-red/80 via-yumbite-red/40 to-yumbite-yellow/60">
              <div className="absolute inset-0 noise-overlay" aria-hidden="true" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:text-yumbite-yellow flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo overlapping cover */}
            <div className="px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-28 h-28 -mt-14 mx-auto rounded-full p-[3px] bg-gradient-to-br from-yumbite-yellow via-yumbite-yellow-dark to-yumbite-red shadow-shadow-glow-yellow relative z-10"
              >
                <DeveloperPhoto className="w-full h-full rounded-full" textClass="text-4xl" />
              </motion.div>

              <span className="inline-block mt-3 px-3 py-1 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase">
                Developer
              </span>
              <h3 className="font-display font-bold text-heading-lg text-yumbite-white mt-1.5">{DEVELOPER.name}</h3>
              <p className="text-yumbite-yellow text-body-sm font-medium">{DEVELOPER.role}</p>
              <p className="text-yumbite-white/50 text-caption mt-1 inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />Cox&apos;s Bazar, Bangladesh
              </p>

              <p className="text-yumbite-white/65 text-body-sm mt-4 leading-relaxed text-left">{DEVELOPER.intro}</p>

              <div className="grid grid-cols-1 gap-2 mt-4 text-left">
                <div className="flex items-start gap-2.5 bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-3">
                  <GraduationCap className="w-4 h-4 text-yumbite-yellow flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-body-sm text-yumbite-white/75">
                    {DEVELOPER.education}<br />
                    <span className="text-yumbite-white/50 text-caption">{DEVELOPER.institute} • {DEVELOPER.graduation}</span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-3">
                  <Code2 className="w-4 h-4 text-yumbite-yellow flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-body-sm text-yumbite-white/75">
                    MERN Stack<br />
                    <span className="text-yumbite-white/50 text-caption">{DEVELOPER.focus.join(' • ')}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {DEVELOPER.socials.map((s) => {
                  const Icon = socialIcon(s.label);
                  return (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in new tab)`}
                      title={s.label}
                      className="w-10 h-10 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/75 hover:text-yumbite-yellow hover:border-yumbite-yellow/60 hover:shadow-shadow-glow-yellow flex items-center justify-center transition-all"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                    </motion.a>
                  );
                })}
              </div>

              <a
                href={DEVELOPER.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center mt-4 mb-6 py-3 text-body-sm"
              >
                View Portfolio<ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
