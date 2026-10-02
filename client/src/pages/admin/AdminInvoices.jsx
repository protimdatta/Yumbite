import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, Eye } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { orderAPI } from '../../services/api';
import { formatPrice, getStatusColor, getPaymentStatusMeta } from '../../utils/helpers';
import { downloadInvoicePdf } from '../../utils/invoicePdf';
import { PageHeader, EmptyState } from '../../components/admin/AdminUI';
import { toast } from 'react-hot-toast';

export default function AdminInvoices() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Pull recent orders; only invoiced ones are shown
        const r = await orderAPI.getAll({ limit: 50 }, token);
        if (r.success) setOrders(r.data.filter((o) => o.invoiceNumber));
      } catch (e) {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const download = async (orderId, invoiceNumber) => {
    setDownloading(true);
    try {
      // Admin JWT is accepted by the invoice endpoint (flexAuth)
      const r = await orderAPI.invoice(orderId, token);
      if (r.success) {
        await downloadInvoicePdf(r.data);
        toast.success(`Invoice ${invoiceNumber} downloaded`);
      }
    } catch (e) {
      toast.error(e.message || 'Could not download invoice');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Invoices" sub={`${orders.length} generated invoices`} />
      {loading ? (
        <p className="text-yumbite-muted">Loading invoices...</p>
      ) : orders.length === 0 ? (
        <EmptyState title="No invoices yet" text="Invoices are generated when an order's invoice is first viewed." />
      ) : (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-caption text-yumbite-muted uppercase tracking-widest border-b border-yumbite-border">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pay = getPaymentStatusMeta(o.paymentStatus);
                  return (
                    <tr key={o._id} className="border-b border-yumbite-border/50 hover:bg-yumbite-white/5">
                      <td className="px-4 py-3 font-mono text-yumbite-yellow font-semibold">{o.invoiceNumber}</td>
                      <td className="px-4 py-3 text-yumbite-white/70 font-mono text-caption">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-yumbite-white">{o.customerName}</td>
                      <td className="px-4 py-3 text-right text-yumbite-yellow font-semibold">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3"><span className={`badge border ${pay.color}`}>{pay.label}</span></td>
                      <td className="px-4 py-3"><span className={`badge border ${getStatusColor(o.status)}`}>{o.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setSelected(o)} className="btn-ghost p-2" aria-label="View invoice"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => download(o._id, o.invoiceNumber)} disabled={downloading} className="btn-ghost p-2" aria-label="Download invoice">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card-base p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-yumbite-yellow font-mono">{selected.invoiceNumber}</h2>
                  <p className="text-caption text-yumbite-muted">Order {selected.orderNumber} • {new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5 text-yumbite-white/60" /></button>
              </div>
              <div className="space-y-2 mb-4">
                {selected.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-body-sm">
                    <span className="text-yumbite-white/80">{it.quantity}× {it.name}</span>
                    <span className="text-yumbite-white">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t border-yumbite-border pt-3 mb-4">
                <span className="text-yumbite-white">Total</span>
                <span className="text-yumbite-yellow">{formatPrice(selected.total)}</span>
              </div>
              <button onClick={() => download(selected._id, selected.invoiceNumber)} disabled={downloading} className="btn-primary w-full justify-center py-2.5 text-body-sm">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
