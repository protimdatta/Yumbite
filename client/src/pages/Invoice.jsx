import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Printer, ArrowLeft, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { formatPrice, getStatusColor, getPaymentStatusMeta } from '../utils/helpers';
import { downloadInvoicePdf } from '../utils/invoicePdf';
import { toast } from 'react-hot-toast';

export default function Invoice() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setForbidden(false);
      try {
        const r = await orderAPI.invoice(orderId, token);
        if (r.success) setInvoice(r.data);
      } catch (e) {
        const msg = e.message || 'Could not load invoice';
        if (/only view your own|log in/i.test(msg)) setForbidden(true);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (orderId && token) load();
  }, [orderId, token]);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
      toast.success('Invoice downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Could not generate PDF. Try Print instead.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yumbite-black pt-28 pb-20 flex items-center justify-center">
        <p className="text-yumbite-muted flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Loading invoice...</p>
      </div>
    );
  }

  if (forbidden || error) {
    return (
      <div className="min-h-screen bg-yumbite-black pt-28 pb-20">
        <div className="container-custom max-w-lg mx-auto text-center">
          <div className="card-base p-10">
            {forbidden ? <Lock className="w-12 h-12 text-yumbite-yellow mx-auto mb-4" /> : <AlertTriangle className="w-12 h-12 text-yumbite-red mx-auto mb-4" />}
            <h1 className="font-display font-bold text-heading-lg text-yumbite-white mb-2">
              {forbidden ? 'Not Your Invoice' : 'Invoice Not Found'}
            </h1>
            <p className="text-yumbite-white/60 mb-6">{forbidden ? 'You can only view your own invoices.' : error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/account" className="btn-primary">Back to Orders</Link>
              <Link to="/" className="btn-secondary">Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { order, invoiceNumber, invoiceGeneratedAt } = invoice;
  const payMeta = getPaymentStatusMeta(order.paymentStatus);

  return (
    <div className="min-h-screen bg-yumbite-black pt-24 lg:pt-28 pb-20">
      <div className="container-custom max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          <button onClick={() => navigate('/account')} className="inline-flex items-center gap-2 text-yumbite-white/60 hover:text-yumbite-yellow text-body-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button onClick={handleDownload} disabled={downloading} className="btn-secondary w-full justify-center py-2 px-4 text-body-sm inline-flex items-center gap-2 sm:w-auto">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Invoice
            </button>
            <button onClick={() => window.print()} className="btn-primary w-full justify-center py-2 px-4 text-body-sm inline-flex items-center gap-2 sm:w-auto">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="invoice-sheet card-base overflow-hidden">
          {/* Header */}
          <div className="bg-black border-b-4 border-yumbite-yellow px-6 lg:px-10 py-8 text-center">
            <img src="/images/logo.jpg" alt="Yumbite" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
            <div className="font-display font-bold text-yumbite-yellow-fill text-2xl tracking-widest">YUMBITE</div>
            <div className="text-white/70 text-caption">Bite Into Happiness • Cox's Bazar</div>
          </div>

          <div className="p-6 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-caption text-yumbite-muted uppercase tracking-widest">Invoice</div>
                <div className="font-mono font-bold text-yumbite-yellow text-xl">{invoiceNumber}</div>
                <div className="text-caption text-yumbite-muted mt-1">
                  Order {order.orderNumber} • {new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-start sm:items-end">
                <span className={`badge border ${getStatusColor(order.status)}`}>{order.status}</span>
                <span className={`badge border ${payMeta.color}`}>{order.paymentMethod === 'SSLCommerz' ? 'Online' : 'COD'} • {payMeta.label}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6 text-body-sm">
              <div className="bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-4">
                <div className="text-caption text-yumbite-muted uppercase tracking-widest mb-2">Billed To</div>
                <div className="text-yumbite-white font-semibold">{order.customerName}</div>
                <div className="text-yumbite-white/70">{order.phone}</div>
                {order.email && <div className="text-yumbite-white/70 break-all">{order.email}</div>}
                {order.orderType === 'delivery' && order.address && <div className="text-yumbite-white/70 mt-1">{order.address}</div>}
              </div>
              <div className="bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-4">
                <div className="text-caption text-yumbite-muted uppercase tracking-widest mb-2">Invoice Info</div>
                <div className="text-yumbite-white/70">Type: <span className="text-yumbite-white capitalize">{order.orderType}</span></div>
                <div className="text-yumbite-white/70">Issued: <span className="text-yumbite-white">{new Date(invoiceGeneratedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>
                {order.transactionId && <div className="text-yumbite-white/70">Txn: <span className="font-mono text-caption text-yumbite-white">{order.transactionId}</span></div>}
                <div className="text-yumbite-white/70">Est. time: <span className="text-yumbite-white">~{order.estimatedTime} min</span></div>
              </div>
            </div>

            {/* Items */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="text-left text-caption text-yumbite-muted uppercase tracking-widest border-b border-yumbite-border">
                    <th className="py-2 pr-2">Item</th>
                    <th className="py-2 px-2 text-right">Qty</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, i) => (
                    <tr key={i} className="border-b border-yumbite-border/50">
                      <td className="break-words py-3 pr-2 text-yumbite-white">{it.name}</td>
                      <td className="py-3 px-2 text-right text-yumbite-white/70">{it.quantity}</td>
                      <td className="py-3 px-2 text-right text-yumbite-white/70">{formatPrice(it.price)}</td>
                      <td className="py-3 pl-2 text-right text-yumbite-yellow font-semibold">{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="max-w-xs ml-auto space-y-1.5 text-body-sm mb-6">
              <div className="flex justify-between"><span className="text-yumbite-white/60">Subtotal</span><span className="text-yumbite-white">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-yumbite-white/60">Delivery charge</span><span className="text-yumbite-white">{Number(order.deliveryFee) > 0 ? formatPrice(order.deliveryFee) : 'Free'}</span></div>
              <div className="flex justify-between font-display font-bold text-heading-sm border-t border-yumbite-border pt-2"><span className="text-yumbite-white">Grand Total</span><span className="text-yumbite-yellow">{formatPrice(order.total)}</span></div>
            </div>

            <p className="text-center text-caption text-yumbite-muted border-t border-yumbite-border pt-4">
              Thank you for ordering with Yumbite! • 01313-886160 • Open Daily 11 AM – 11 PM
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
