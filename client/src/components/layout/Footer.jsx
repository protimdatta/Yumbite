import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, MapPin, Phone, Clock, ChevronRight, CheckCircle, Code2 } from 'lucide-react';
import DeveloperModal from './DeveloperModal';
import { DEVELOPER } from '../../utils/developer';
import { BRAND, openFacebook, openMaps, callYumbite } from '../../utils/brand';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  // Built at render time so Admin → Settings edits apply site-wide
  const contactInfo = [
    { icon: Phone, label: BRAND.phoneDisplay, href: BRAND.phoneHref },
    { icon: MapPin, label: BRAND.addressShort, action: 'maps' },
    { icon: Clock, label: BRAND.hours, href: null },
  ];

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return;
    setSubscribed(true);
  };
  return (
    <footer className="bg-yumbite-darker border-t border-yumbite-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] noise-overlay" aria-hidden="true" />
      
      {/* Top Accent Line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-yumbite-yellow/50 to-transparent max-w-[1000px] mx-auto" aria-hidden="true" />

      <div className="container-custom relative py-7 lg:py-9">
        <div className="grid grid-cols-1 gap-5 min-[400px]:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-2 flex items-center" aria-label={`${BRAND.name} Home`}>
              {BRAND.name === 'Yumbite' ? (
                <img src="/images/logo-lockup.png" alt="Yumbite" className="h-10 w-32 object-contain" />
              ) : (
                <span className="font-display text-xl font-bold tracking-tight text-yumbite-white">{BRAND.name}</span>
              )}
            </Link>

            <p className="text-yumbite-white/70 text-body-sm leading-relaxed">
              {BRAND.tagline}
            </p>
            
            <p className="text-yumbite-yellow font-medium text-caption">
              Good Food • Good Mood
            </p>
          </div>

          {/* Quick Links */}
          <nav className="lg:col-span-1" aria-label="Quick links">
            <h3 className="mb-2 font-display text-body-sm font-semibold text-yumbite-white">Quick Links</h3>
            <ul className="space-y-1" role="list">
              {quickLinks.map((link, index) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-yumbite-white/70 hover:text-yumbite-yellow transition-colors duration-200 group"
                  >
                    <ChevronRight className="w-4 h-4 text-yumbite-yellow/50 group-hover:text-yumbite-yellow transition-colors" aria-hidden="true" />
                    <span className="text-body-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="lg:col-span-1" aria-label="Contact information">
            <h3 className="mb-2 font-display text-body-sm font-semibold text-yumbite-white">Contact Us</h3>
            <ul className="space-y-2" role="list">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-yumbite-yellow">
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    {item.action === 'maps' ? (
                      <button
                        onClick={openMaps}
                        className="text-left text-yumbite-white/70 hover:text-yumbite-yellow transition-colors text-body-sm leading-relaxed"
                      >
                        {item.label}
                      </button>
                    ) : item.href ? (
                      <a
                        href={item.href}
                        className="text-yumbite-white/70 hover:text-yumbite-yellow transition-colors text-body-sm leading-relaxed"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-yumbite-white/70 text-body-sm leading-relaxed">{item.label}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-1">
            <h3 className="mb-2 font-display text-body-sm font-semibold text-yumbite-white">Follow Us</h3>
            <a
              href={BRAND.FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-radius-md border border-yumbite-border text-yumbite-white/70 transition-colors hover:border-yumbite-yellow/50 hover:text-yumbite-yellow"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <h4 className="mb-2 text-caption font-semibold text-yumbite-white/80">Stay Updated</h4>
            {subscribed ? (
              <div className="p-4 bg-yumbite-yellow/10 border border-yumbite-yellow/30 rounded-radius-lg flex items-center gap-3 text-yumbite-yellow">
                <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <p className="text-body-sm">You're on the list! Watch your inbox for Yumbite offers.</p>
              </div>
            ) : (
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={subscribe}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-base flex-1"
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            )}
            <p className="mt-2 text-caption text-yumbite-muted text-left">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 border-t border-yumbite-border pt-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-yumbite-muted text-body-sm text-center lg:text-left">
              © {new Date().getFullYear()} Yumbite. All rights reserved.
            </p>

            <button
              onClick={() => setDevOpen(true)}
              className="inline-flex items-center gap-1.5 text-caption text-yumbite-white/50 hover:text-yumbite-yellow transition-colors"
              aria-label={`Developed by ${DEVELOPER.name} — view details`}
            >
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              Developed by {DEVELOPER.shortName}
            </button>
            
            <div className="flex items-center gap-6 text-caption text-yumbite-muted">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookie Policy</span>
            </div>
          </div>
        </div>
      </div>
      <DeveloperModal open={devOpen} onClose={() => setDevOpen(false)} />
    </footer>
  );
}