import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAPI } from '../../services/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import { UserAvatar, PageHeader, EmptyState } from '../../components/admin/AdminUI';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [active, setActive] = useState('');
  const [provider, setProvider] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.users({ search: debounced, active, provider, sort, page, limit: 15 }, token);
      if (r.success) {
        setUsers(r.data);
        setPagination(r.pagination);
      }
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debounced, active, provider, sort, page, token]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const r = await adminAPI.userDetail(id, token);
      if (r.success) setSelected(r.data);
    } catch (e) {
      toast.error(e.message || 'Could not load user');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (id, next) => {
    if (!confirm(next ? 'Activate this account?' : 'Deactivate this account? They will not be able to log in.')) return;
    try {
      const r = await adminAPI.setUserActive(id, next, token);
      if (r.success) {
        toast.success(next ? 'Account activated' : 'Account deactivated');
        setUsers((p) => p.map((u) => (u._id === id ? { ...u, isActive: next } : u)));
        if (selected?.user._id === id) setSelected((s) => ({ ...s, user: { ...s.user, isActive: next } }));
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const selectCls = 'input-base py-2.5 text-body-sm';

  return (
    <div>
      <PageHeader title="Users" sub={`${pagination.total} registered customers`} />

      <div className="card-base p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yumbite-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="input-base pl-9 py-2.5 text-body-sm"
            aria-label="Search users"
          />
        </div>
        <select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} className={selectCls} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Deactivated</option>
        </select>
        <select value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }} className={selectCls} aria-label="Filter by signup method">
          <option value="">All methods</option>
          <option value="local">Email + password</option>
          <option value="google">Google</option>
          <option value="both">Both linked</option>
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={selectCls} aria-label="Sort users">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="spending">Top spending</option>
          <option value="orders">Most orders</option>
        </select>
      </div>

      {loading ? (
        <p className="text-yumbite-muted">Loading users...</p>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" text="Try a different search or filter." />
      ) : (
        <>
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-caption text-yumbite-muted uppercase tracking-widest border-b border-yumbite-border">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                    <th className="px-4 py-3 text-right">Spent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} onClick={() => openDetail(u._id)} className="border-b border-yumbite-border/50 hover:bg-yumbite-white/5 cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} />
                          <div className="min-w-0">
                            <div className="text-yumbite-white font-medium truncate">{u.name}</div>
                            <div className="text-caption text-yumbite-muted truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-yumbite-white/70">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-right text-yumbite-white font-semibold">{u.orderCount}</td>
                      <td className="px-4 py-3 text-right text-yumbite-yellow font-semibold">{formatPrice(u.totalSpent)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge border ${u.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {u.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-yumbite-white/60 text-caption">{new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-body-sm text-yumbite-white/60">
            <span>Page {pagination.page} of {Math.max(pagination.pages, 1)}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-5 h-5" /></button>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-ghost p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {detailLoading && !selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"><p className="text-white">Loading...</p></motion.div>
        )}
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card-base p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={selected.user} size="w-14 h-14 text-lg" />
                  <div>
                    <h2 className="font-display font-bold text-yumbite-white">{selected.user.name}</h2>
                    <p className="text-caption text-yumbite-muted">{selected.user.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5 text-yumbite-white/60" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body-sm mb-4">
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted">Phone</div><div className="text-yumbite-white">{selected.user.phone || '—'}</div></div>
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted">Signup</div><div className="text-yumbite-white capitalize">{selected.user.authProvider} {selected.user.googleId ? '• Google linked' : ''}</div></div>
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted">Joined</div><div className="text-yumbite-white">{new Date(selected.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                <div className="bg-yumbite-black/60 border border-yumbite-border rounded-radius-md p-3"><div className="text-caption text-yumbite-muted">Status</div><div className={selected.user.isActive ? 'text-green-400' : 'text-yumbite-red'}>{selected.user.isActive ? 'Active' : 'Deactivated'}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-yumbite-yellow/10 border border-yumbite-yellow/30 rounded-radius-md p-3 text-center"><div className="font-display font-bold text-xl text-yumbite-yellow">{selected.totals.count}</div><div className="text-caption text-yumbite-muted">Total orders</div></div>
                <div className="bg-yumbite-yellow/10 border border-yumbite-yellow/30 rounded-radius-md p-3 text-center"><div className="font-display font-bold text-xl text-yumbite-yellow">{formatPrice(selected.totals.spent)}</div><div className="text-caption text-yumbite-muted">Total spending</div></div>
              </div>
              <h3 className="font-display font-semibold text-yumbite-white mb-2">Recent orders</h3>
              {selected.orders.length === 0 ? <p className="text-yumbite-muted text-body-sm mb-4">No orders yet.</p> : (
                <div className="space-y-2 mb-4">
                  {selected.orders.slice(0, 5).map((o) => (
                    <div key={o._id} className="flex justify-between items-center bg-yumbite-black/50 border border-yumbite-border rounded-radius-md px-3 py-2 text-body-sm">
                      <span className="text-yumbite-white font-mono text-caption">{o.orderNumber}</span>
                      <span className={`badge border ${getStatusColor(o.status)}`}>{o.status}</span>
                      <span className="text-yumbite-yellow font-semibold">{formatPrice(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => toggleActive(selected.user._id, !selected.user.isActive)}
                className={`w-full justify-center py-2.5 text-body-sm inline-flex items-center gap-2 rounded-radius-md font-semibold ${selected.user.isActive ? 'bg-yumbite-red/15 text-yumbite-red border border-yumbite-red/30' : 'bg-green-500/15 text-green-400 border border-green-500/30'}`}
              >
                {selected.user.isActive ? <><UserX className="w-4 h-4" />Deactivate Account</> : <><UserCheck className="w-4 h-4" />Activate Account</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
