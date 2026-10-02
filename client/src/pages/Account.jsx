import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, LogOut, ShoppingBag, Loader2, Save, Camera, ChevronDown, Package, Receipt, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, orderAPI } from '../services/api';
import { formatPrice, getStatusColor, getPaymentStatusMeta } from '../utils/helpers';
import { downloadInvoicePdf } from '../utils/invoicePdf';
import { toast } from 'react-hot-toast';

const TIMELINE_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

export default function Account() {
  const { user, token, logout, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const avatarRef = useRef(null);

  const downloadRowInvoice = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const r = await orderAPI.invoice(orderId, token);
      if (r.success) {
        await downloadInvoicePdf(r.data);
        toast.success('Invoice downloaded');
      }
    } catch (e) {
      toast.error(e.message || 'Could not download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        let stored = null;
        try { stored = localStorage.getItem('yumbite_user_token'); } catch { stored = null; }
        const r = await userAPI.myOrders(stored);
        if (r.success) setOrders(r.data);
      } catch { /* backend offline — history unavailable */ }
      finally { setLoadingOrders(false); }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const r = await updateProfile({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
      if (r.success) toast.success('Profile updated');
      else toast.error(r.message || 'Update failed');
    } catch (err) { toast.error(err.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    setUploadingAvatar(true);
    try {
      const r = await userAPI.uploadAvatar(file, token);
      if (r.success) {
        await updateProfile({}); // refresh user state (includes new avatar)
        toast.success('Profile photo updated');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-yumbite-black pt-24 lg:pt-28 pb-20">
      <div className="container-custom max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-yumbite-yellow/50" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-xl text-yumbite-ink">
                    {(user?.name || 'Y').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => avatarRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yumbite-yellow-fill text-yumbite-ink flex items-center justify-center shadow-shadow-md hover:bg-yumbite-yellow-fill-dark transition-colors"
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" aria-label="Upload profile photo" />
              </div>
              <div>
                <h1 className="break-words font-display font-bold text-heading-xl text-yumbite-white">{user?.name}</h1>
                <p className="break-all text-yumbite-muted text-body-sm">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="btn-ghost flex-shrink-0 gap-2"><LogOut className="w-4 h-4" />Logout</button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={save} className="card-base p-6 space-y-4" noValidate>
              <h2 className="font-display font-semibold text-heading-md text-yumbite-white flex items-center gap-2"><User className="w-5 h-5 text-yumbite-yellow" />Profile</h2>
              <div><label className="label-base" htmlFor="acc-name">Name *</label><input id="acc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" required /></div>
              <div><label className="label-base" htmlFor="acc-phone">Phone</label><input id="acc-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" /></div>
              <div><label className="label-base" htmlFor="acc-address">Default delivery address</label><textarea id="acc-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="input-base resize-none" /></div>
              <button type="submit" disabled={saving} className="btn-primary justify-center">{saving ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />Save Changes</>)}</button>
            </form>

            <div className="card-base p-6 lg:col-span-1">
              <h2 className="font-display font-semibold text-heading-md text-yumbite-white flex items-center gap-2 mb-4"><ShoppingBag className="w-5 h-5 text-yumbite-yellow" />My Orders</h2>
              {loadingOrders ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : orders.length === 0 ? (
                <p className="text-yumbite-muted text-body-sm">No orders yet. Your placed orders will appear here.</p>
              ) : (
                <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                  {orders.map((o) => {
                    const expanded = expandedOrder === o._id;
                    const payMeta = getPaymentStatusMeta(o.paymentStatus);
                    const currentIdx = o.status === 'Cancelled' ? -1 : TIMELINE_STEPS.indexOf(o.status);
                    return (
                      <div key={o._id} className="bg-yumbite-black/50 border border-yumbite-border rounded-radius-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedOrder(expanded ? null : o._id)}
                          className="w-full p-3 text-left"
                          aria-expanded={expanded}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-yumbite-yellow text-body-sm">{o.orderNumber || String(o._id).slice(-8).toUpperCase()}</span>
                            <ChevronDown className={`w-4 h-4 text-yumbite-muted transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex justify-between text-body-sm mt-1">
                            <span className="text-yumbite-white/70">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="font-bold text-yumbite-yellow">{formatPrice(o.total)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className={`badge border text-caption ${getStatusColor(o.status)}`}>{o.status}</span>
                            <span className={`badge border text-caption ${payMeta.color}`}>{o.paymentMethod === 'SSLCommerz' ? 'Online' : 'COD'} • {payMeta.label}</span>
                          </div>
                          {o.invoiceNumber && (
                            <div className="flex items-center gap-1.5 mt-2 text-caption text-yumbite-white/50">
                              <Receipt className="w-3.5 h-3.5" />Invoice {o.invoiceNumber}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            <Link to={`/invoice/${o._id}`} className="btn-secondary py-1.5 px-3 text-caption inline-flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />View Invoice
                            </Link>
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadRowInvoice(o._id); }}
                              disabled={downloadingId === o._id}
                              className="btn-ghost py-1.5 px-3 text-caption inline-flex items-center gap-1"
                            >
                              {downloadingId === o._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}Download
                            </button>
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 space-y-2 border-t border-yumbite-border pt-3">
                                {o.items.map((it, i) => (
                                  <div key={i} className="flex justify-between text-caption">
                                    <span className="text-yumbite-white/70">{it.quantity}× {it.name}</span>
                                    <span className="text-yumbite-white">{formatPrice(it.price * it.quantity)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-caption border-t border-yumbite-border pt-2">
                                  <span className="text-yumbite-white/60">Subtotal{Number(o.deliveryFee) > 0 ? ' + delivery' : ''}</span>
                                  <span className="text-yumbite-white font-semibold">{formatPrice(o.total)}</span>
                                </div>
                                <div>
                                  <div className="text-caption text-yumbite-muted mb-2 flex items-center gap-1"><Package className="w-3.5 h-3.5" />Order timeline</div>
                                  {o.status === 'Cancelled' ? (
                                    <p className="text-caption text-yumbite-red">This order was cancelled.</p>
                                  ) : (
                                    <ol className="space-y-0">
                                      {TIMELINE_STEPS.map((s, i) => {
                                        const done = i <= currentIdx;
                                        const active = i === currentIdx;
                                        return (
                                          <li key={s} className="flex gap-2 items-start">
                                            <div className="flex flex-col items-center">
                                              <div className={`w-3 h-3 rounded-full mt-0.5 ${done ? 'bg-yumbite-yellow-fill' : 'bg-yumbite-white/20'}`} />
                                              {i < TIMELINE_STEPS.length - 1 && <div className={`w-px h-4 ${i < currentIdx ? 'bg-yumbite-yellow-fill' : 'bg-yumbite-white/20'}`} />}
                                            </div>
                                            <span className={`text-caption pb-2 ${active ? 'text-yumbite-yellow font-semibold' : done ? 'text-yumbite-white/70' : 'text-yumbite-white/40'}`}>{s}</span>
                                          </li>
                                        );
                                      })}
                                    </ol>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}