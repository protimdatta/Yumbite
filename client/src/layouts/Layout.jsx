import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { AnimatePresence } from 'framer-motion';
import { BRAND } from '../utils/brand';

export default function Layout() {
  const { isOpen, setIsOpen, isLoading, getItemCount } = useCart();
  const count = getItemCount();

  return (
    <div className="relative min-h-screen bg-yumbite-black flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>

      <AnimatePresence>
        {isOpen && !isLoading && <CartDrawer />}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="mobile-sticky-bar lg:hidden" aria-label="Quick actions">
        <a href={BRAND.phoneHref} className="flex flex-col items-center gap-1 text-yumbite-white/70 hover:text-yumbite-yellow transition-colors" aria-label={`Call Yumbite at ${BRAND.phoneDisplay}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-caption">Call</span>
        </a>
        <Link to="/menu" className="flex flex-col items-center gap-1 text-yumbite-white/70 hover:text-yumbite-yellow transition-colors" aria-label="View Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-caption">Menu</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-1 text-yumbite-white/70 hover:text-yumbite-yellow transition-colors relative"
          aria-label={count > 0 ? `View cart, ${count} items` : 'View cart'}
        >
          <span className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-yumbite-yellow-fill text-yumbite-ink text-caption font-bold rounded-full flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </span>
          <span className="text-caption">Cart</span>
        </button>
      </nav>
    </div>
  );
}