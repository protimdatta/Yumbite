import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Phone, AlertTriangle } from 'lucide-react';
import { formatPrice, getPaymentStatusMeta } from '../utils/helpers';
import { orderAPI } from '../services/api';

// Shown after the gateway redirects back. The order shown here was already
// verified server-side — this page only displays, never decides payment.
export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get('orderNumber') || '';
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (ph) => {
    if (!orderNumber || !ph) return;
    setLoading(true);
    setError('');
    try {
      const r = await orderAPI.track(orderNumber, ph);
      if (r.success) setOrder(r.data);
    } catch (e) {
      setError(e.message || 'Could not load your order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load is impossible without the phone (privacy) — user enters it once.
  }, []);

  const payMeta = order ? getPaymentStatusMeta(order.paymentStatus) : null;

  return (
    <div className="min-h-screen bg-yumbite-black pt-28 pb-20">
      <div className="container-custom max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-base p-8 lg:p-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="font-display font-bold text-display-sm text-yumbite-white mb-2">Payment Successful!</h1>
          <p className="text-yumbite-white/60 mb-2">
            {order ? <>Thank you, {order.customerName}. Your online payment is confirmed.</> : 'Your online payment is confirmed.'}
          </p>
          {orderNumber && <p className="mb-6">Order number: <span className="font-mono font-bold text-yumbite-yellow text-lg">{orderNumber}</span></p>}

          {!order && (
            <form
              onSubmit={(e) => { e.preventDefault(); load(phone.trim()); }}
              className="max-w-sm mx-auto space-y-3 mb-6"
            >
              <p className="text-body-sm text-yumbite-white/60">Enter your phone number to view the receipt.</p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="input-base pl-10"
                  aria-label="Phone number"
                />
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center">
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Loading...</>) : 'View My Order'}
              </button>
              {error && <p className="text-yumbite-red text-body-sm flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4" />{error}</p>}
            </form>
          )}

          {order && (
            <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-lg p-5 text-left space-y-2 mb-6">
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-yumbite-white/60">Payment</span>
                <span className="flex items-center gap-2">
                  <span className="text-yumbite-white">Online</span>
                  <span className={`badge border ${payMeta.color}`}>{payMeta.label}</span>
                </span>
              </div>
              {order.transactionId && <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Transaction ID</span><span className="font-mono text-yumbite-white text-caption">{order.transactionId}</span></div>}
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Status</span><span className="text-yumbite-white">{order.status}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-yumbite-white/60">Estimated time</span><span className="text-yumbite-white">~{order.estimatedTime} min</span></div>
              <div className="divider" />
              <div className="flex justify-between font-display font-bold"><span className="text-yumbite-white">Total paid</span><span className="text-yumbite-yellow">{formatPrice(order.total)}</span></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/menu" className="btn-primary">Order More</Link>
            <Link to="/" className="btn-secondary">Back Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
