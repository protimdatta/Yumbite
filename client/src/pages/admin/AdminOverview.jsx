import { useEffect, useState } from 'react';
import { CalendarDays, CalendarRange, CalendarClock, TrendingUp, UserPlus, Crown } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { StatCard, CardSkeleton, EmptyState, UserAvatar } from '../../components/admin/AdminUI';
import { BarChart } from '../../components/admin/Charts';

function RangeCards({ title, icon: Icon, orders, revenue }) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-yumbite-yellow" />
        <h2 className="font-display font-semibold text-yumbite-white">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-4 text-center">
          <div className="font-display font-bold text-2xl text-yumbite-white">{orders}</div>
          <div className="text-caption text-yumbite-muted">Orders</div>
        </div>
        <div className="bg-yumbite-black/50 border border-yumbite-border rounded-radius-md p-4 text-center">
          <div className="font-display font-bold text-2xl text-yumbite-yellow">{formatPrice(revenue)}</div>
          <div className="text-caption text-yumbite-muted">Revenue</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
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
        setError(e.message || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div>
        <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">Digital Overview</h1>
        <p className="text-yumbite-muted text-body-sm mb-6">How Yumbite is performing online.</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  if (error || !data) return <EmptyState title="Could not load overview" text={error} />;

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">Digital Overview</h1>
      <p className="text-yumbite-muted text-body-sm mb-6">How Yumbite is performing online.</p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={UserPlus} label="New users (7 days)" value={`+${data.users.newWeek}`} sub={`${data.users.total} registered total`} />
        <StatCard icon={TrendingUp} label="Average order value" value={formatPrice(data.orders.avgValue)} sub="across all orders" />
        <StatCard icon={Crown} label="Paid orders (all time)" value={data.revenue.paidCount} sub={`${formatPrice(data.revenue.total)} collected`} />
        <StatCard icon={CalendarClock} label="Orders this month" value={data.orders.month} sub={`${formatPrice(data.revenue.month)} revenue`} />
      </div>

      <div className="grid xl:grid-cols-3 gap-4 mb-6">
        <RangeCards title="Today" icon={CalendarDays} orders={data.orders.today} revenue={data.revenue.today} />
        <RangeCards title="Last 7 days" icon={CalendarRange} orders={data.orders.week} revenue={data.revenue.week} />
        <RangeCards title="This month" icon={CalendarClock} orders={data.orders.month} revenue={data.revenue.month} />
      </div>

      <div className="card-base p-5 mb-6">
        <h2 className="font-display font-semibold text-yumbite-white mb-4">Revenue — last 14 days (৳)</h2>
        {(data.daily || []).length === 0 ? <p className="text-yumbite-muted text-body-sm">No data yet.</p> : (
          <BarChart data={data.daily.map((d) => ({ label: d._id.slice(5), value: d.revenue }))} formatY={(v) => `৳${v}`} />
        )}
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-6">
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Most popular items</h2>
          {data.topItems.length === 0 ? <p className="text-yumbite-muted text-body-sm">No sales yet.</p> : (
            <ul className="space-y-3">
              {data.topItems.map((t, i) => (
                <li key={t._id}>
                  <div className="flex justify-between text-body-sm mb-1">
                    <span className="text-yumbite-white truncate">{i + 1}. {t._id}</span>
                    <span className="text-yumbite-yellow font-semibold">{t.qty} sold • {formatPrice(t.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-yumbite-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yumbite-yellow to-yumbite-red" style={{ width: `${Math.max(4, (t.qty / (data.topItems[0]?.qty || 1)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card-base p-5">
          <h2 className="font-display font-semibold text-yumbite-white mb-4">Most active customers</h2>
          {data.topCustomers.length === 0 ? <p className="text-yumbite-muted text-body-sm">No registered-customer orders yet.</p> : (
            <ul className="space-y-3">
              {data.topCustomers.map((c) => (
                <li key={c.email} className="flex items-center gap-3 bg-yumbite-black/50 border border-yumbite-border rounded-radius-lg px-3 py-2">
                  <UserAvatar user={c} size="w-9 h-9 text-caption" />
                  <div className="flex-1 min-w-0">
                    <div className="text-yumbite-white text-body-sm font-medium truncate">{c.name}</div>
                    <div className="text-caption text-yumbite-muted">{c.orders} orders</div>
                  </div>
                  <span className="text-yumbite-yellow font-semibold text-body-sm">{formatPrice(c.spent)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-base p-5">
        <h2 className="font-display font-semibold text-yumbite-white mb-4">Recent activity</h2>
        {data.recentOrders.length === 0 ? <p className="text-yumbite-muted text-body-sm">Nothing yet.</p> : (
          <ul className="space-y-2">
            {data.recentOrders.map((o) => (
              <li key={o._id} className="flex items-center justify-between text-body-sm bg-yumbite-black/50 border border-yumbite-border rounded-radius-md px-3 py-2">
                <span className="text-yumbite-white/80">Order <span className="font-mono text-yumbite-yellow">{o.orderNumber}</span> • {o.status} • {o.paymentStatus}</span>
                <span className="text-yumbite-white/50 text-caption">{new Date(o.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
