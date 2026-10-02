import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Banknote, Clock, CheckCircle, XCircle, UtensilsCrossed, UserCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { StatCard, CardSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { BarChart, DonutChart } from '../../components/admin/Charts';

function statusCount(byStatus, s) {
  return byStatus.find((x) => x._id === s)?.count ?? 0;
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await adminAPI.overview(token);
        if (r.success) setData(r.data);
      } catch (e) {
        setError(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div>
        <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">Dashboard</h1>
        <p className="text-yumbite-muted text-body-sm mb-6">Overview of Yumbite sales & operations.</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <EmptyState title="Could not load dashboard" text={error || 'Please try again.'} />;
  }

  const cards = [
    { icon: Banknote, label: 'Total Revenue (paid)', value: formatPrice(data.revenue.total), sub: `${data.revenue.paidCount} paid orders` },
    { icon: ShoppingBag, label: 'Total Orders', value: data.orders.total, sub: `Today: ${data.orders.today} • Week: ${data.orders.week}` },
    { icon: Users, label: 'Total Users', value: data.users.total, sub: `${data.users.active} active • +${data.users.newWeek} this week` },
    { icon: Clock, label: 'Pending Orders', value: statusCount(data.byStatus, 'Pending'), sub: 'needs attention', accent: 'text-orange-400' },
    { icon: CheckCircle, label: 'Delivered', value: statusCount(data.byStatus, 'Delivered'), sub: 'completed fulfillment', accent: 'text-green-400' },
    { icon: XCircle, label: 'Cancelled', value: statusCount(data.byStatus, 'Cancelled'), sub: 'cancelled orders', accent: 'text-yumbite-red' },
    { icon: UtensilsCrossed, label: 'Food Items', value: data.catalog.menu, sub: `${data.catalog.gallery} gallery • ${data.catalog.reviews} reviews` },
    { icon: UserCheck, label: 'Active Users', value: data.users.active, sub: `Avg order ${formatPrice(data.orders.avgValue)}` },
  ];

  const dailyBars = (data.daily || []).map((d) => ({ label: d._id.slice(5), value: d.orders }));
  const revenueBars = (data.daily || []).map((d) => ({ label: d._id.slice(5), value: d.revenue }));

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">Dashboard</h1>
      <p className="text-yumbite-muted text-body-sm mb-6">Live overview of the entire Yumbite platform.</p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.04} />)}
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-8">
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Orders — last 14 days</h2>
          {dailyBars.length === 0 ? <p className="text-yumbite-muted text-body-sm">No orders yet.</p> : <BarChart data={dailyBars} />}
        </div>
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Revenue — last 14 days (৳)</h2>
          {revenueBars.every((d) => d.value === 0) ? <p className="text-yumbite-muted text-body-sm">No paid revenue yet.</p> : <BarChart data={revenueBars} formatY={(v) => `৳${v}`} />}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-8">
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Order status distribution</h2>
          {data.byStatus.length === 0 ? <p className="text-yumbite-muted text-body-sm">No orders yet.</p> : (
            <DonutChart data={data.byStatus.map((s) => ({ label: s._id || 'Unknown', value: s.count }))} />
          )}
        </div>
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Most ordered items</h2>
          {data.topItems.length === 0 ? <p className="text-yumbite-muted text-body-sm">No sales yet.</p> : (
            <ul className="space-y-3">
              {data.topItems.map((t, i) => (
                <li key={t._id}>
                  <div className="flex justify-between text-body-sm mb-1">
                    <span className="text-yumbite-white truncate">{i + 1}. {t._id}</span>
                    <span className="text-yumbite-yellow font-semibold">{t.qty} sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-yumbite-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yumbite-yellow to-yumbite-red" style={{ width: `${Math.max(4, (t.qty / (data.topItems[0]?.qty || 1)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-yumbite-white">Recent Orders</h2>
          <Link to="/admin/orders" className="btn-ghost text-body-sm">View all</Link>
        </div>
        {data.recentOrders.length === 0 ? <p className="text-yumbite-muted text-body-sm">No orders yet.</p> : (
          <div className="space-y-3">
            {data.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between bg-yumbite-black/50 border border-yumbite-border rounded-radius-lg px-4 py-3">
                <div>
                  <div className="text-yumbite-white font-medium text-body-sm">{o.orderNumber || o.customerName} • {o.status}</div>
                  <div className="text-caption text-yumbite-muted">{o.paymentMethod === 'SSLCommerz' ? 'Online' : 'COD'} • {o.paymentStatus}</div>
                </div>
                <div className="font-bold text-yumbite-yellow">{formatPrice(o.total)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
