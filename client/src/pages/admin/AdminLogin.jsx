import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Logo from '../../components/layout/Logo';
import { toast } from 'react-hot-toast';

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (!isLoading && isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Enter email and password'); return; }
    setBusy(true);
    try { const r = await login(form.email, form.password); if (r.success) { toast.success('Welcome back!'); navigate('/admin/dashboard'); } else toast.error(r.message || 'Login failed'); }
    catch (err) { toast.error(err.message || 'Login failed — is backend running?'); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-yumbite-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 w-full max-w-md">
        <div className="text-center mb-8"><Logo className="w-16 h-16 rounded-full object-cover mx-auto mb-4" /><h1 className="font-display font-bold text-heading-xl text-yumbite-white">Admin Login</h1><p className="text-yumbite-muted text-body-sm">Yumbite dashboard • authorized access only</p></div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label-base" htmlFor="email">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" /><input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base pl-10" required /></div></div>
          <div><label className="label-base" htmlFor="password">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" /><input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base pl-10" required /></div></div>
          <button disabled={busy} className="btn-primary w-full justify-center py-3">{busy ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>) : 'Sign In'}</button>
        </form>
      </motion.div>
    </div>
  );
}