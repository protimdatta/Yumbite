import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Moon, Sun } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import { BRAND } from '../../utils/brand';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

function ThemeToggle({ theme, toggleTheme, mobile = false }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === 'light'}
      title={`Switch to ${nextTheme} mode`}
      className={mobile
        ? 'flex w-full items-center gap-3 rounded-radius-lg border border-yumbite-border bg-yumbite-charcoal px-4 py-3 text-yumbite-white/80 transition-colors hover:border-yumbite-yellow/50 hover:text-yumbite-yellow focus-visible-ring'
        : 'hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-radius-md border border-yumbite-border bg-yumbite-charcoal text-yumbite-white/80 transition-colors hover:border-yumbite-yellow/50 hover:text-yumbite-yellow focus-visible-ring lg:inline-flex'}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {mobile && <span>{`Switch to ${nextTheme} mode`}</span>}
    </button>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { cart, setIsOpen: setCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLinkClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        data-scrolled={isScrolled}
        className={`site-header fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-yumbite-black/95 backdrop-blur-xl border-b border-yumbite-border shadow-shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="container-custom" aria-label="Main navigation">
          <div className="flex h-14 items-center justify-between lg:h-16">
            {/* Logo */}
            <Link to="/" className="z-50 flex items-center" aria-label={`${BRAND.name} Home`}>
              {BRAND.name === 'Yumbite' ? (
                <img src="/images/logo-lockup.png" alt="Yumbite" className="h-9 w-28 object-contain lg:h-10 lg:w-32" />
              ) : (
                <span className="font-display text-xl font-bold tracking-tight text-yumbite-white">{BRAND.name}</span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative font-medium text-body-sm tracking-wide transition-colors duration-200 ${
                    location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                      ? 'text-yumbite-yellow'
                      : 'text-yumbite-white/80 hover:text-yumbite-yellow'
                  }`}
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  {link.label}
                  <motion.span
                    className="absolute bottom-[-6px] left-0 h-0.5 bg-yumbite-yellow-fill rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href)) ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Facebook Link */}
              <a
                href={BRAND.FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-radius-md bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-all duration-200"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.77,7.29H15.4V4.67c0-1.03.64-1.74,1.78-1.74H18.77V7.29z M24,12.07C24,6.57 19.6,2.1 12.5,2.1S1,6.57 1,12.07c0,3.56 1.67,6.6 4.33,8.5V21h2.7v-7.5h2.6v7.5H13V15.4c0-.86 0-1.72 1.04-1.72h2.6V9.9c-.97-.2-2.1-.6-3.5-.6-2.8 0-4.7 1.9-4.7 4.7v3.8H7.5V21h3.8v-7.5c0 0 1.6 0 1.9-.01V21H24c5.5 0 10-4.5 10-10S19.5 2.07 12.5 2.07" />
                </svg>
              </a>

              {/* Account Button */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-radius-md bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-all duration-200"
                aria-label={isAuthenticated ? 'My account' : 'Log in or sign up'}
                title={isAuthenticated ? 'My account' : 'Log in / Sign up'}
              >
                <User className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
              </Link>

              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-radius-md bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-all duration-200"
                aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ''}`}
              >
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
                {itemCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-yumbite-yellow-fill text-yumbite-ink text-caption font-bold rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Order Now CTA */}
              <Link
                to="/menu"
                className="hidden lg:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-yumbite-yellow-fill text-yumbite-ink font-semibold text-body-sm tracking-wide rounded-radius-md hover:bg-yumbite-yellow-fill-dark hover:shadow-shadow-glow-yellow active:scale-[0.98] transition-all duration-200"
              >
                Order Now
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-radius-md bg-yumbite-charcoal border border-yumbite-border text-yumbite-white hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-all duration-200"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                id="mobile-menu"
                className="lg:hidden overflow-hidden bg-yumbite-black border-t border-yumbite-border"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="container-custom py-6 space-y-4">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className={`block px-4 py-3 rounded-radius-lg font-medium text-body transition-colors ${
                        location.pathname === link.href
                          ? 'bg-yumbite-yellow/10 text-yumbite-yellow border border-yumbite-yellow/30'
                          : 'text-yumbite-white/80 hover:bg-yumbite-charcoal hover:text-yumbite-yellow'
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-yumbite-border flex flex-col gap-3">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} mobile />
                    <Link
                      to={isAuthenticated ? '/account' : '/login'}
                      className="flex items-center gap-3 px-4 py-3 rounded-radius-lg bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-colors"
                    >
                      <User className="w-5 h-5" aria-hidden="true" />
                      <span>{isAuthenticated ? 'My Account' : 'Log In / Sign Up'}</span>
                    </Link>
                    <a
                      href={BRAND.FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-radius-lg bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.77,7.29H15.4V4.67c0-1.03.64-1.74,1.78-1.74H18.77V7.29z M24,12.07C24,6.57 19.6,2.1 12.5,2.1S1,6.57 1,12.07c0,3.56 1.67,6.6 4.33,8.5V21h2.7v-7.5h2.6v7.5H13V15.4c0-.86 0-1.72 1.04-1.72h2.6V9.9c-.97-.2-2.1-.6-3.5-.6-2.8 0-4.7 1.9-4.7 4.7v3.8H7.5V21h3.8v-7.5c0 0 1.6 0 1.9-.01V21H24c5.5 0 10-4.5 10-10S19.5 2.07 12.5 2.07" />
                      </svg>
                      <span>Follow us on Facebook</span>
                    </a>
                  </div>

                  <Link
                    to="/menu"
                    className="block w-full text-center px-4 py-3.5 bg-yumbite-yellow-fill text-yumbite-ink font-semibold text-body-sm tracking-wide rounded-radius-md hover:bg-yumbite-yellow-fill-dark transition-colors"
                  >
                    Order Now
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Accent Line */}
        <motion.div
          className="hidden lg:block h-px bg-gradient-to-r from-transparent via-yumbite-yellow to-transparent max-w-[800px] mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          aria-hidden="true"
        />
      </header>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 z-50 bg-gradient-to-r from-yumbite-yellow to-yumbite-red"
        style={{ transformOrigin: 'left center' }}
        animate={{ scaleX: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        aria-hidden="true"
      />
    </>
  );
}