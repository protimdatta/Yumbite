import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RotateCcw, Home } from 'lucide-react';

const REASONS = {
  'payment-failed': { title: 'Payment Failed', text: 'Your payment could not be completed. No money was charged for this attempt.' },
  cancelled: { title: 'Payment Cancelled', text: 'You cancelled the payment. Your cart items are safe — try again when ready.' },
  'verification-failed': { title: 'Payment Not Verified', text: 'The gateway response could not be verified, so the order was not marked paid. Try again or choose Cash on Delivery.' },
  'unknown-order': { title: 'Order Not Found', text: 'We could not match this payment to an order. Contact us with your transaction details.' },
  'missing-data': { title: 'Incomplete Response', text: 'The payment gateway returned an incomplete response. Try again or choose Cash on Delivery.' },
  'server-error': { title: 'Something Went Wrong', text: 'An error occurred while confirming payment. Try again or choose Cash on Delivery.' },
};

export default function OrderFailed() {
  const [params] = useSearchParams();
  const reason = REASONS[params.get('reason')] || REASONS['payment-failed'];
  const tranId = params.get('tran_id');

  return (
    <div className="min-h-screen bg-yumbite-black pt-28 pb-20">
      <div className="container-custom max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-base p-8 lg:p-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yumbite-red/15 border border-yumbite-red/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-yumbite-red" />
          </div>
          <h1 className="font-display font-bold text-display-sm text-yumbite-white mb-2">{reason.title}</h1>
          <p className="text-yumbite-white/60 mb-2">{reason.text}</p>
          {tranId && <p className="text-caption text-yumbite-muted mb-6">Reference: <span className="font-mono">{tranId}</span></p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/order" className="btn-primary inline-flex items-center gap-2 justify-center"><RotateCcw className="w-4 h-4" />Try Again</Link>
            <Link to="/" className="btn-secondary inline-flex items-center gap-2 justify-center"><Home className="w-4 h-4" />Back Home</Link>
          </div>
          <p className="text-caption text-yumbite-muted mt-6">Prefer cash? Choose Cash on Delivery at checkout. Need help? Call 01313-886160.</p>
        </motion.div>
      </div>
    </div>
  );
}
