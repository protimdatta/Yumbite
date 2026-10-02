import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import Logo from '../components/layout/Logo';
import { toast } from 'react-hot-toast';

export default function Signup() {
  const { signup, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', address: '' });
  const [busy, setBusy] = useState(false);

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) { toast.error('Name, email and password are required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      const r = await signup({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password, address: form.address.trim() });
      if (r.success) { toast.success('Account created — welcome to Yumbite!'); navigate(from, { replace: true }); }
      else toast.error(r.message || 'Signup failed');
    } catch (err) { toast.error(err.message || 'Signup failed — is the server running?'); }
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

  const field = (id, label, Icon, props) => (
    <div>
      <label className="label-base" htmlFor={id}>{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
        <input id={id} value={form[props.name]} onChange={(e) => setForm({ ...form, [props.name]: e.target.value })} className="input-base pl-10" {...props} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-yumbite-black flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 rounded-full object-cover mx-auto mb-4" alt="Yumbite logo" />
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Join Yumbite</h1>
          <p className="text-yumbite-muted text-body-sm mt-1">Faster checkout, order history, and more.</p>
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {field('signup-name', 'Full name *', User, { name: 'name', placeholder: 'Your name', autoComplete: 'name', required: true })}
          {field('signup-email', 'Email *', Mail, { name: 'email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email', required: true })}
          {field('signup-phone', 'Phone', Phone, { name: 'phone', type: 'tel', placeholder: '01XXXXXXXXX', autoComplete: 'tel' })}
          <div className="grid grid-cols-2 gap-3">
            {field('signup-password', 'Password *', Lock, { name: 'password', type: 'password', placeholder: 'Min 6 chars', autoComplete: 'new-password', required: true })}
            {field('signup-confirm', 'Confirm *', Lock, { name: 'confirm', type: 'password', placeholder: 'Repeat it', autoComplete: 'new-password', required: true })}
          </div>
          <div>
            <label className="label-base" htmlFor="signup-address">Delivery address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
              <textarea id="signup-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="House, road, area..." className="input-base pl-10 resize-none" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3">
            {busy ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />Creating account...</>) : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center gap-3 my-5" aria-hidden="true">
          <span className="flex-1 h-px bg-yumbite-border" />
          <span className="text-caption text-yumbite-muted uppercase tracking-widest">or</span>
          <span className="flex-1 h-px bg-yumbite-border" />
        </div>
        <GoogleSignIn mode="signup" onSuccess={handleGoogle} onError={(m) => toast.error(m)} />
        <p className="text-center text-body-sm text-yumbite-white/60 mt-6">
          Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="text-yumbite-yellow font-semibold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}