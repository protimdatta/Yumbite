import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice, hasDiscount, getDiscount } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeItem, incrementQuantity, decrementQuantity, getSubtotal, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsOpen(false);
    navigate('/order');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <AnimatePresence>
      <motion.div
        key="cart-backdrop"
        className="fixed inset-0 z-50 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-yumbite-black/60 backdrop-blur-sm" />
      </motion.div>

      <motion.aside
        key="cart-panel"
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md lg:max-w-lg bg-yumbite-charcoal border-l border-yumbite-border flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-yumbite-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-radius-lg bg-yumbite-yellow/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-yumbite-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-semibold text-heading-md text-yumbite-white">Your Cart</h2>
              <p className="text-caption text-yumbite-muted">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-10 h-10 rounded-radius-md bg-yumbite-black border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 transition-all duration-200"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-6">
              <div className="w-16 h-16 rounded-full bg-yumbite-black border border-yumbite-border flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yumbite-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-display font-medium text-heading-sm text-yumbite-white mb-2">Cart is Empty</h3>
              <p className="text-yumbite-muted text-body-sm mb-6 max-w-xs">Looks like you haven't added anything yet. Time to fix that.</p>
              <Link
                to="/menu"
                onClick={handleClose}
                className="btn-primary"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <>
              {cart.map((item, index) => (
                <motion.div
                  key={`${item._id}-${item.quantity}`}
                  className="flex gap-3 bg-yumbite-black border border-yumbite-border rounded-radius-xl overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover img-zoom"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-yumbite-charcoal flex items-center justify-center">
                        <svg className="w-8 h-8 text-yumbite-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="break-words font-medium leading-tight text-body text-yumbite-white">{item.name}</h4>
                        <p className="text-yumbite-yellow font-semibold text-body-sm mt-1">
                          {item.originalPrice && item.originalPrice > item.price ? (
                            <>
                              <span className="text-yumbite-white/40 line-through font-normal mr-1">{formatPrice(item.originalPrice)}</span>
                              {formatPrice(item.price)} each
                              {hasDiscount(item) && (
                                <span className="ml-1 px-1.5 py-0.5 bg-yumbite-red text-yumbite-white text-caption font-bold rounded-radius-sm">-{getDiscount(item)}%</span>
                              )}
                            </>
                          ) : (
                            <>{formatPrice(item.price)} each</>
                          )}
                        </p>
                        {item.description && (
                          <p className="text-yumbite-muted text-caption mt-1 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="flex-shrink-0 w-8 h-8 rounded-radius-md bg-yumbite-black/50 border border-yumbite-border text-yumbite-white/50 hover:text-yumbite-red hover:border-yumbite-red/50 hover:bg-yumbite-red/10 transition-all duration-200 flex items-center justify-center"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-yumbite-black border border-yumbite-border rounded-radius-md overflow-hidden">
                        <button
                          onClick={() => decrementQuantity(item._id)}
                          className="w-9 h-9 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-body text-yumbite-white">{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item._id)}
                          className="w-9 h-9 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-display font-bold text-heading-sm text-yumbite-yellow">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {cart.length > 0 && (
                <motion.div
                  className="pt-4 border-t border-yumbite-border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cart.length * 0.05 + 0.1 }}
                >
                  <button
                    onClick={handleClearCart}
                    className="w-full flex items-center justify-center gap-2 text-yumbite-white/50 hover:text-yumbite-red transition-colors text-body-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <motion.div
            className="p-5 border-t border-yumbite-border bg-yumbite-black/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-body-sm">
                <span className="text-yumbite-white/70">Subtotal</span>
                <span className="font-medium text-yumbite-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-yumbite-white/70">Delivery</span>
                <span className="font-medium text-yumbite-white">
                  {subtotal >= 500 ? (
                    <span className="text-yumbite-yellow">Free</span>
                  ) : (
                    '৳50'
                  )}
                </span>
              </div>
              {subtotal < 500 && (
                <p className="text-caption text-yumbite-yellow flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Add ৳{500 - subtotal} more for free delivery
                </p>
              )}
              <div className="divider" />
              <div className="flex justify-between text-heading-sm font-display">
                <span className="text-yumbite-white">Total</span>
                <span className="text-yumbite-yellow">{formatPrice(total + (subtotal < 500 && subtotal > 0 ? 50 : 0))}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full justify-center gap-2 py-4 text-body"
              disabled={cart.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Proceed to Checkout
            </button>

            <p className="text-center text-caption text-yumbite-muted mt-3">
              Secure checkout • Pay on delivery available
            </p>
          </motion.div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}