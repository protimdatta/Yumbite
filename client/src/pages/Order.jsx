import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, User, Phone, Mail, MapPin, FileText, Bike, Store, CheckCircle, Loader2, ArrowLeft, Banknote, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getPaymentStatusMeta } from '../utils/helpers';
import { orderAPI, settingsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export default function Order() {
  const { cart, getSubtotal, getTotal, clearCart, incrementQuantity, decrementQuantity, removeItem } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', orderType: 'pickup', address: '', note: '', paymentMethod: 'COD' });
  const [errors, setErrors] = useState({});
  const [feeRules, setFeeRules] = useState({ deliveryFee: 50, freeDeliveryThreshold: 500 });

  useEffect(() => {
    (async () => {
      try {
        const r = await settingsAPI.get();
        if (r.success) {
          setFeeRules({
            deliveryFee: Number(r.data.deliveryFee) || 0,
            freeDeliveryThreshold: Number(r.data.freeDeliveryThreshold) || 0,
          });
        }
      } catch { /* offline — defaults apply, server still enforces */ }
    })();
  }, []);

  // Prefill from logged-in account
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((p) => ({
        ...p,
        customerName: p.customerName || user.name || '',
        phone: p.phone || user.phone || '',
        email: p.email || user.email || '',
        address: p.address || user.address || '',
      }));
    }
  }, [isAuthenticated, user]);

  const subtotal = getSubtotal();
  const deliveryFee = form.orderType === 'delivery' ? (subtotal >= feeRules.freeDeliveryThreshold || subtotal === 0 ? 0 : feeRules.deliveryFee) : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[\d\s\-+()]{10,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email (for order confirmation)';
    if (form.orderType === 'delivery' && !form.address.trim()) e.address = 'Delivery address is required';
    if (cart.length === 0) e.cart = 'Your cart is empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const basePayload = () => ({
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    orderType: form.orderType,
    address: form.orderType === 'delivery' ? form.address.trim() : '',
    note: form.note.trim(),
    items: cart.map((i) => ({ menuItemId: i._id, quantity: i.quantity })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the highlighted fields'); return; }
    setIsSubmitting(true);
    try {
      if (form.paymentMethod === 'SSLCommerz') {
        // Online payment: backend creates a pending order + gateway session.
        // Nothing is marked paid here — only the gateway callback can do that.
        const res = await orderAPI.initiateOnline({ ...basePayload(), paymentMethod: 'SSLCommerz' }, token || undefined);
        if (res.success) {
          clearCart();
          toast.success('Redirecting to secure payment...');
          window.location.href = res.data.gatewayUrl;
          return;
        }
      } else {
        const res = await orderAPI.create({ ...basePayload(), paymentMethod: 'COD' }, token || undefined);
        if (res.success) {
          setPlacedOrder(res.data);
          clearCart();
          setStep(3);
          toast.success('Order placed successfully! Pay on delivery/pickup.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    } finally { setIsSubmitting(false); }
  };

  if (step === 3 && placedOrder) {
    const payMeta = getPaymentStatusMeta(placedOrder.paymentStatus);
    return (
      <div className="min-h-screen bg-yumbite-black pt-28 pb-20">
        <div className="container-custom max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-base p-8 lg:p-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            <h1 className="font-display font-bold text-display-sm text-yumbite-white mb-2">Order Confirmed!</h1>
            <p className="text-yumbite-white/60 mb-6">Thank you, {placedOrder.customerName}. We are preparing your food.</p>
            <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-lg p-5 text-left space-y-2 mb-6">
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Order number</span><span className="font-mono font-bold text-yumbite-yellow">{placedOrder.orderNumber || String(placedOrder._id).slice(-8).toUpperCase()}</span></div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-yumbite-white/60">Payment</span>
                <span className="flex items-center gap-2">
                  <span className="text-yumbite-white">{placedOrder.paymentMethod === 'SSLCommerz' ? 'Online' : 'Cash on Delivery'}</span>
                  <span className={`badge border ${payMeta.color}`}>{payMeta.label}</span>
                </span>
              </div>
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Status</span><span className="text-yumbite-white">{placedOrder.status}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Type</span><span className="text-yumbite-white capitalize">{placedOrder.orderType}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Phone</span><span className="text-yumbite-white">{placedOrder.phone}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Estimated time</span><span className="text-yumbite-white">~{placedOrder.estimatedTime} min</span></div>
              <div className="divider" />
              <div className="flex justify-between font-display font-bold"><span className="text-yumbite-white">Total {placedOrder.paymentMethod === 'COD' ? `payable on ${placedOrder.orderType === 'delivery' ? 'delivery' : 'pickup'}` : ''}</span><span className="text-yumbite-yellow">{formatPrice(placedOrder.total)}</span></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/menu" className="btn-primary">Order More</Link>
              <Link to="/" className="btn-secondary">Back Home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yumbite-black pt-24 lg:pt-28 pb-24">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full min-w-0 max-w-5xl mx-auto">
          <Link to="/menu" className="inline-flex items-center gap-2 text-yumbite-white/60 hover:text-yumbite-yellow text-body-sm mb-6"><ArrowLeft className="w-4 h-4" /> Back to menu</Link>
          <h1 className="font-display font-bold text-display-md text-yumbite-white mb-2">Checkout</h1>
          <p className="text-yumbite-white/60 mb-8">Review your items, add your details, choose payment, and place your order.</p>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-2 mb-8 sm:flex sm:items-center sm:gap-2">
            {[{ n: 1, label: 'Review Cart' }, { n: 2, label: 'Details & Payment' }, { n: 3, label: 'Done' }].map((s, i, arr) => (
              <div key={s.n} className="flex min-w-0 flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.n ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/50'}`}>{s.n}</div>
                <span className={`text-center text-caption leading-tight font-medium sm:text-left sm:text-body-sm ${step >= s.n ? 'text-yumbite-white' : 'text-yumbite-white/40'}`}>{s.label}</span>
                {i < arr.length - 1 && <div className="hidden sm:block w-10 h-px bg-yumbite-border mx-2" />}
              </div>
            ))}
          </div>

          {!isAuthenticated && cart.length > 0 && (
            <div className="card-base p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-yumbite-white/70 text-body-sm">Have an account? Log in to check out faster with saved details.</p>
              <Link to="/login" className="btn-secondary py-2 px-5 text-body-sm whitespace-nowrap">Log In / Sign Up</Link>
            </div>
          )}
          {cart.length === 0 ? (            <div className="card-base p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-yumbite-muted mx-auto mb-4" />
              <h2 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">Your cart is empty</h2>
              <p className="text-yumbite-white/60 mb-6">Add something delicious first.</p>
              <Link to="/menu" className="btn-primary">Browse Menu</Link>
            </div>
          ) : (
            <div className="grid min-w-0 gap-6 lg:grid-cols-5">
              {/* Cart review */}
              <div className="min-w-0 space-y-4 lg:col-span-3">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card-base min-w-0 p-3 flex gap-3 sm:p-4 sm:gap-4">
                      <div className="w-20 h-20 rounded-radius-lg overflow-hidden bg-yumbite-charcoal flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-yumbite-muted"><ShoppingBag className="w-6 h-6" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="min-w-0 break-words font-semibold text-yumbite-white">{item.name}</h3>
                            <button onClick={() => removeItem(item._id)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-radius-md text-yumbite-white/40 hover:text-yumbite-red" aria-label={`Remove ${item.name}`}><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-yumbite-yellow font-semibold text-body-sm">
                          {item.originalPrice && item.originalPrice > item.price ? (
                            <>
                              <span className="text-yumbite-white/40 line-through font-normal mr-1">{formatPrice(item.originalPrice)}</span>
                              {formatPrice(item.price)} each
                            </>
                          ) : (
                            <>{formatPrice(item.price)} each</>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-2 bg-yumbite-black border border-yumbite-border rounded-radius-md">
                            <button onClick={() => decrementQuantity(item._id)} className="w-8 h-8 flex items-center justify-center hover:text-yumbite-yellow" aria-label="Decrease"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center text-yumbite-white font-semibold">{item.quantity}</span>
                            <button onClick={() => incrementQuantity(item._id)} className="w-8 h-8 flex items-center justify-center hover:text-yumbite-yellow" aria-label="Increase"><Plus className="w-4 h-4" /></button>
                          </div>
                          <span className="whitespace-nowrap font-bold text-yumbite-yellow">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Form + summary */}
              <div className="min-w-0 lg:col-span-2">
                <form onSubmit={handleSubmit} className="card-base min-w-0 p-4 space-y-5 sm:p-6 lg:sticky lg:top-32" noValidate>
                  <h2 className="font-display font-semibold text-heading-md text-yumbite-white">Your Details</h2>
                  <div>
                    <label htmlFor="customerName" className="label-base">Name *</label>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" /><input id="customerName" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Your full name" className={`input-base pl-10 ${errors.customerName ? 'border-yumbite-red' : ''}`} />{errors.customerName && <p className="text-yumbite-red text-caption mt-1">{errors.customerName}</p>}</div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="label-base">Phone *</label>
                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" /><input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className={`input-base pl-10 ${errors.phone ? 'border-yumbite-red' : ''}`} />{errors.phone && <p className="text-yumbite-red text-caption mt-1">{errors.phone}</p>}</div>
                  </div>
                  <div>
                    <label htmlFor="email" className="label-base">Email (for order confirmation)</label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" /><input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={`input-base pl-10 ${errors.email ? 'border-yumbite-red' : ''}`} />{errors.email && <p className="text-yumbite-red text-caption mt-1">{errors.email}</p>}</div>
                  </div>
                  <div>
                    <span className="label-base">Order type</span>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Order type">
                      {[{ v: 'pickup', icon: Store, label: 'Pickup' }, { v: 'delivery', icon: Bike, label: 'Delivery' }].map((o) => (
                        <button key={o.v} type="button" role="radio" aria-checked={form.orderType === o.v} onClick={() => setForm((p) => ({ ...p, orderType: o.v }))} className={`flex items-center justify-center gap-2 p-3 rounded-radius-md border font-semibold text-body-sm transition-all ${form.orderType === o.v ? 'bg-yumbite-yellow-fill text-yumbite-ink border-yumbite-yellow' : 'bg-yumbite-black border-yumbite-border text-yumbite-white/70 hover:border-yumbite-yellow/40'}`}><o.icon className="w-4 h-4" />{o.label}</button>
                      ))}
                    </div>
                  </div>
                  {form.orderType === 'delivery' && (
                    <div>
                      <label htmlFor="address" className="label-base">Delivery address *</label>
                      <div className="relative"><MapPin className="absolute left-3 top-3 w-5 h-5 text-yumbite-muted" /><textarea id="address" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House, road, area..." className={`input-base pl-10 resize-none ${errors.address ? 'border-yumbite-red' : ''}`} />{errors.address && <p className="text-yumbite-red text-caption mt-1">{errors.address}</p>}</div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="note" className="label-base">Note (optional)</label>
                    <div className="relative"><FileText className="absolute left-3 top-3 w-5 h-5 text-yumbite-muted" /><textarea id="note" name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Extra spicy, no onion..." className="input-base pl-10 resize-none" /></div>
                  </div>
                  <div>
                    <span className="label-base">Payment method</span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                      {[{ v: 'COD', icon: Banknote, label: 'Cash on Delivery' }, { v: 'SSLCommerz', icon: CreditCard, label: 'Online Payment' }].map((o) => (
                        <button key={o.v} type="button" role="radio" aria-checked={form.paymentMethod === o.v} onClick={() => setForm((p) => ({ ...p, paymentMethod: o.v }))} className={`flex items-center justify-center gap-2 p-3 rounded-radius-md border font-semibold text-body-sm transition-all ${form.paymentMethod === o.v ? 'bg-yumbite-yellow-fill text-yumbite-ink border-yumbite-yellow' : 'bg-yumbite-black border-yumbite-border text-yumbite-white/70 hover:border-yumbite-yellow/40'}`}><o.icon className="w-4 h-4" />{o.label}</button>
                      ))}
                    </div>
                    <p className="text-caption text-yumbite-muted mt-2">
                      {form.paymentMethod === 'COD' ? 'Pay in cash when you receive your food.' : 'You will be redirected to SSLCommerz sandbox to pay securely by card/bKash/Nagad.'}
                    </p>
                  </div>
                  <div className="border-t border-yumbite-border pt-4 space-y-2">
                    <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Subtotal</span><span className="text-yumbite-white">{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Delivery</span><span className="text-yumbite-white">{deliveryFee === 0 ? <span className="text-yumbite-yellow">Free</span> : formatPrice(deliveryFee)}</span></div>
                    <div className="flex justify-between font-display font-bold text-heading-sm"><span className="text-yumbite-white">Total</span><span className="text-yumbite-yellow">{formatPrice(total)}</span></div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-4">
                    {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : (<>{form.paymentMethod === 'COD' ? 'Place Order' : 'Pay Online'} • {formatPrice(total)}</>)}
                  </button>
                  <p className="text-center text-caption text-yumbite-muted">{form.paymentMethod === 'COD' ? `Pay on ${form.orderType === 'delivery' ? 'delivery' : 'pickup'}` : 'Secured by SSLCommerz sandbox'} • Call 01313-886160 for help</p>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}