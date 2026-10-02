import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, CheckCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import Logo from '../components/layout/Logo';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') || '');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email address'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      const r = await userAPI.resetPassword(email.trim(), form.password);
      setDone(true);
      toast.success(r.message || 'Password reset successful');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      toast.error(err.message || 'Could not reset password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-yumbite-black flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 rounded-full object-cover mx-auto mb-4" alt="Yumbite logo" />
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Set New Password</h1>
          <p className="text-yumbite-muted text-body-sm mt-1">
            Your code is verified. Choose a new password.
          </p>
        </div>
        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <p className="text-yumbite-white/70 text-body-sm">
              Password reset successful. Redirecting to login...
            </p>
            <Link to="/login" className="btn-primary w-full justify-center py-3 inline-flex">
              Go to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label className="label-base" htmlFor="reset-email">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-base" htmlFor="reset-password">New password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-base pl-10"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="label-base" htmlFor="reset-confirm">Confirm password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
                <input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="input-base pl-10"
                  placeholder="Repeat new password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3">
              {busy ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />Saving...</>) : 'Reset Password'}
            </button>
          </form>
        )}
        {!done && (
          <p className="text-center text-body-sm text-yumbite-white/60 mt-6">
            No code yet? <Link to="/forgot-password" className="text-yumbite-yellow font-semibold hover:underline">Get a code</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
