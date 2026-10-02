import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Image as ImageIcon, Star, ShoppingBag, Users, Receipt, BarChart3, Settings, LogOut, Home } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import Logo from '../components/layout/Logo';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/invoices', label: 'Invoices', icon: Receipt },
    { to: '/admin/overview', label: 'Digital Overview', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];
  return (
    <div className="min-h-screen bg-yumbite-black flex">
      <aside className="w-60 hidden lg:flex flex-col bg-yumbite-darker border-r border-yumbite-border p-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-8"><Logo className="w-10 h-10 rounded-full object-cover" /><span className="font-display font-bold text-yumbite-white">YUMBYTE <span className="text-yumbite-yellow text-caption block">ADMIN</span></span></Link>
        <nav className="space-y-2" aria-label="Admin">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-4 py-3 rounded-radius-lg text-body-sm font-medium ${location.pathname === l.to ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'text-yumbite-white/70 hover:bg-yumbite-charcoal hover:text-yumbite-yellow'}`}><l.icon className="w-5 h-5" />{l.label}</Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 pt-6 border-t border-yumbite-border">
          <div className="px-4 py-2 text-caption text-yumbite-muted truncate">{admin?.email}</div>
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-yumbite-white/60 hover:text-yumbite-yellow text-body-sm"><Home className="w-4 h-4" />View Site</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="w-full flex items-center gap-3 px-4 py-2 text-yumbite-white/60 hover:text-yumbite-red text-body-sm"><LogOut className="w-4 h-4" />Logout</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-yumbite-darker/95 backdrop-blur border-b border-yumbite-border px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-2"><Logo className="w-8 h-8 rounded-full object-cover" /><span className="font-bold text-yumbite-white">YUMBYTE ADMIN</span></Link>
            <button onClick={() => { logout(); navigate('/admin/login'); }} className="p-2 text-yumbite-white/60" aria-label="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Admin">
            {links.map((l) => (<Link key={l.to} to={l.to} className={`flex items-center gap-1.5 px-3 py-2 rounded-radius-md text-caption font-semibold whitespace-nowrap ${location.pathname === l.to ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'text-yumbite-white/70 bg-yumbite-charcoal'}`}><l.icon className="w-4 h-4" />{l.label}</Link>))}
          </nav>
        </header>
        <main className="p-4 lg:p-8 max-w-6xl mx-auto w-full"><Outlet /></main>
      </div>
    </div>
  );
}