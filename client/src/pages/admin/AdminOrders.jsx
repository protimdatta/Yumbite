import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { orderAPI } from '../../services/api';
import { formatPrice, getStatusColor, getPaymentStatusMeta, ORDER_STATUSES } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await orderAPI.getAll(filter ? { status: filter } : {}, token); if (r.success) setOrders(r.data); }
    catch (e) { toast.error('Failed to load orders'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    try {
      const r = await orderAPI.updateStatus(id, status, token);
      if (r.success) { toast.success(`Order → ${status}`); setOrders((p) => p.map((o) => (o._id === id ? r.data : o))); if (selected?._id === id) setSelected(r.data); }
    } catch (e) { toast.error(e.message); }
  };

  const markCash = async (id) => {
    if (!confirm('Confirm cash received for this COD order?')) return;
    try {
      const r = await orderAPI.markCashReceived(id, token);
      if (r.success) { toast.success('Cash received — order marked paid'); setOrders((p) => p.map((o) => (o._id === id ? r.data : o))); if (selected?._id === id) setSelected(r.data); }
    } catch (e) { toast.error(e.message); }
  };

  const payBadge = (o) => {
    const meta = getPaymentStatusMeta(o.paymentStatus);
    return <span className={`badge border ${meta.color}`}>{o.paymentMethod === 'SSLCommerz' ? 'Online' : 'COD'} • {meta.label}</span>;
  };

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">Orders</h1>
      <p className="text-yumbite-muted text-body-sm mb-5">{orders.length} orders {filter && `• ${filter}`}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-radius-full text-body-sm font-semibold ${!filter ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70'}`}>All</button>
        {ORDER_STATUSES.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={`px-4 py-2 rounded-radius-full text-body-sm font-semibold capitalize ${filter === s.value ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70'}`}>{s.label}</button>
        ))}
      </div>
      {loading ? <p className="text-yumbite-muted">Loading...</p> : orders.length === 0 ? <p className="text-yumbite-muted">No orders.</p> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <motion.div key={o._id} layout className="card-base p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-yumbite-white truncate">{o.customerName} • {o.phone}</div>
                <div className="text-caption text-yumbite-muted">{o.orderNumber || String(o._id).slice(-8).toUpperCase()} • {new Date(o.createdAt).toLocaleString()} • {o.items.length} items • {o.orderType}{o.transactionId ? ` • ${o.transactionId}` : ''}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`badge border ${getStatusColor(o.status)}`}>{o.status}</span>
                  {payBadge(o)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-yumbite-yellow">{formatPrice(o.total)}</span>
                <button onClick={() => setSelected(o)} className="btn-secondary py-2 px-4 text-body-sm">Details</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card-base p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4"><h2 className="font-display font-bold text-yumbite-white">Order {selected.orderNumber || String(selected._id).slice(-8).toUpperCase()}</h2><button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5 text-yumbite-white/60" /></button></div>
              <div className="space-y-2 text-body-sm mb-4">
                <div className="flex gap-2 items-center text-yumbite-white/80"><Phone className="w-4 h-4 text-yumbite-yellow" />{selected.customerName} • {selected.phone}</div>
                {selected.address && <div className="flex gap-2 text-yumbite-white/80"><MapPin className="w-4 h-4 text-yumbite-yellow flex-shrink-0 mt-0.5" />{selected.address}</div>}
                {selected.note && <div className="text-yumbite-muted">Note: {selected.note}</div>}
              </div>
              <div className="space-y-2 mb-4">{selected.items.map((it, i) => (<div key={i} className="flex justify-between text-body-sm"><span className="text-yumbite-white/80">{it.quantity}× {it.name}</span><span className="text-yumbite-white">{formatPrice(it.price * it.quantity)}</span></div>))}</div>
              <div className="flex justify-between font-bold border-t border-yumbite-border pt-3 mb-4"><span className="text-yumbite-white">Total</span><span className="text-yumbite-yellow">{formatPrice(selected.total)}</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body-sm mb-4">
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted mb-1">Payment method</div><div className="text-yumbite-white font-semibold">{selected.paymentMethod === 'SSLCommerz' ? 'Online (SSLCommerz)' : 'Cash on Delivery'}</div></div>
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted mb-1">Payment status</div><span className={`badge border ${getPaymentStatusMeta(selected.paymentStatus).color}`}>{getPaymentStatusMeta(selected.paymentStatus).label}</span></div>
              </div>
              {selected.transactionId && <div className="text-caption text-yumbite-muted mb-4">Transaction ID: <span className="font-mono text-yumbite-white">{selected.transactionId}</span></div>}
              {selected.paymentMethod === 'COD' && selected.paymentStatus !== 'paid' && (
                <button onClick={() => markCash(selected._id)} className="btn-primary w-full justify-center py-2.5 mb-4 text-body-sm">Mark Cash Received</button>
              )}
              {selected.paymentMethod !== 'COD' && (
                <p className="text-caption text-yumbite-muted mb-4">Online payments can only become paid via gateway verification — they cannot be marked paid by hand.</p>
              )}
              <div className="label-base">Update status</div>
              <div className="flex flex-wrap gap-2">{ORDER_STATUSES.map((s) => (<button key={s.value} onClick={() => setStatus(selected._id, s.value)} className={`px-3 py-1.5 rounded-radius-md text-caption font-bold uppercase border ${selected.status === s.value ? 'bg-yumbite-yellow-fill text-yumbite-ink border-yumbite-yellow' : 'border-yumbite-border text-yumbite-white/60 hover:border-yumbite-yellow/40'}`}>{s.label}</button>))}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}