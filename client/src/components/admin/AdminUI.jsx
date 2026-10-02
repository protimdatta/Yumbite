import { motion } from 'framer-motion';

export function StatCard({ icon: Icon, label, value, sub, delay = 0, accent = 'text-yumbite-yellow' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-base p-5"
    >
      <Icon className={`w-6 h-6 ${accent} mb-3`} aria-hidden="true" />
      <div className="font-display font-bold text-2xl text-yumbite-white truncate">{value}</div>
      <div className="text-yumbite-white/60 text-body-sm">{label}</div>
      {sub && <div className="text-caption text-yumbite-muted mt-1">{sub}</div>}
    </motion.div>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="card-base p-5 animate-pulse" aria-hidden="true">
      <div className="h-6 w-6 rounded bg-yumbite-white/10 mb-3" />
      <div className="h-7 w-2/3 rounded bg-yumbite-white/10 mb-2" />
      <div className="h-4 w-1/2 rounded bg-yumbite-white/10" />
      {rows > 3 && <div className="h-4 w-1/3 rounded bg-yumbite-white/10 mt-2" />}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="card-base p-10 text-center">
      {Icon && <Icon className="w-10 h-10 text-yumbite-muted mx-auto mb-3" aria-hidden="true" />}
      <h3 className="font-display font-semibold text-yumbite-white mb-1">{title}</h3>
      {text && <p className="text-yumbite-muted text-body-sm">{text}</p>}
    </div>
  );
}

export function UserAvatar({ user, size = 'w-10 h-10 text-body-sm' }) {
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${size} rounded-full object-cover flex-shrink-0`} loading="lazy" />;
  }
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display font-bold text-heading-xl text-yumbite-white mb-1">{title}</h1>
        {sub && <p className="text-yumbite-muted text-body-sm">{sub}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
