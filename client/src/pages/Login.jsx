import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import Logo from '../components/layout/Logo';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Enter email and password'); return; }
    setBusy(true);
    try {
      const r = await login(form.email.trim(), form.password);
      if (r.success) { toast.success('Welcome back to Yumbite!'); navigate(from, { replace: true }); }
      else toast.error(r.message || 'Login failed');
    } catch (err) { toast.error(err.message || 'Login failed — is the server running?'); }
    finally { setBusy(false); }
  };

  const handleGoogle = async (idToken) => {
    setBusy(true);
    try {
      const r = await loginWithGoogle(idToken);
      if (r.success) {
        toast.success(r.isNew ? 'Account created — welcome to Yumbite!' : 'Welcome back to Yumbite!');
        navigate(from, { replace: true });
      } else toast.error(r.message || 'Google sign-in failed');
    } catch (err) { toast.error(err.message || 'Google sign-in failed — is the server running?'); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-yumbite-black flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 rounded-full object-cover mx-auto mb-4" alt="Yumbite logo" />
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Welcome Back</h1>
          <p className="text-yumbite-muted text-body-sm mt-1">Log in to order faster and track your orders.</p>
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="label-base" htmlFor="login-email">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
              <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="label-base" htmlFor="login-password">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
              <input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base pl-10" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3">
            {busy ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />Signing in...</>) : 'Log In'}
          </button>
        </form>
        <div className="flex items-center gap-3 my-5" aria-hidden="true">
          <span className="flex-1 h-px bg-yumbite-border" />
          <span className="text-caption text-yumbite-muted uppercase tracking-widest">or</span>
          <span className="flex-1 h-px bg-yumbite-border" />
        </div>
        <GoogleSignIn mode="signin" onSuccess={handleGoogle} onError={(m) => toast.error(m)} />
        <p className="text-center text-body-sm mt-4">
          <Link to="/forgot-password" className="text-yumbite-white/60 hover:text-yumbite-yellow hover:underline">Forgot password?</Link>
        </p>
        <p className="text-center text-body-sm text-yumbite-white/60 mt-6">
          New to Yumbite? <Link to="/signup" state={{ from: location.state?.from }} className="text-yumbite-yellow font-semibold hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}