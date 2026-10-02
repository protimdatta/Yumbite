import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { userAPI } from '../services/api';
import Logo from '../components/layout/Logo';
import { toast } from 'react-hot-toast';

const OTP_RESEND_WAIT_SECS = 60; // matches backend OTP_REQUEST_COOLDOWN_MS

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  const startCooldown = () => {
    setCooldown(OTP_RESEND_WAIT_SECS);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const requestCode = async (e) => {
    e?.preventDefault();
    if (!email.trim()) { toast.error('Enter your email address'); return; }
    setBusy(true);
    try {
      const r = await userAPI.forgotPassword(email.trim());
      setStep('code');
      setCode(['', '', '', '', '', '']);
      startCooldown();
      toast.success(r.message || 'Code sent');
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || 'Could not send code');
    } finally {
      setBusy(false);
    }
  };

  const handleDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKey = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;
    e.preventDefault();
    setCode((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => { next[i] = d; });
      return next;
    });
    inputsRef.current[Math.min(digits.length, 5)]?.focus();
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setBusy(true);
    try {
      const r = await userAPI.verifyOtp(email.trim(), otp);
      toast.success(r.message || 'Code verified');
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Code is invalid or has expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-yumbite-black flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 rounded-full object-cover mx-auto mb-4" alt="Yumbite logo" />
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Forgot Password</h1>
          <p className="text-yumbite-muted text-body-sm mt-1">
            {step === 'email'
              ? 'Enter your registered email and we will send you a 6-digit code.'
              : `Enter the 6-digit code sent to ${email}. It expires in 10 minutes.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={requestCode} className="space-y-4" noValidate>
            <div>
              <label className="label-base" htmlFor="forgot-email">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
                <input
                  id="forgot-email"
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
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3">
              {busy ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />Sending...</>) : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-5" noValidate>
            <div>
              <label className="label-base text-center block" htmlFor="otp-0">6-digit code *</label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKey(i, e)}
                    className="input-base w-12 h-14 text-center text-xl font-bold px-0"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3">
              {busy ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />Verifying...</>) : 'Verify Code'}
            </button>
            <div className="text-center text-body-sm">
              {cooldown > 0 ? (
                <span className="text-yumbite-white/40">Resend code in {cooldown}s</span>
              ) : (
                <button type="button" onClick={requestCode} disabled={busy} className="text-yumbite-yellow font-semibold hover:underline disabled:opacity-50">
                  Resend code
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-center text-body-sm text-yumbite-white/60 hover:text-yumbite-yellow inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Use a different email
            </button>
          </form>
        )}

        {step === 'email' && (
          <p className="text-center text-body-sm text-yumbite-white/60 mt-6">
            <Link to="/login" className="text-yumbite-yellow font-semibold hover:underline">Back to Log In</Link>
          </p>
        )}
        {step === 'code' && (
          <p className="text-center text-body-sm text-yumbite-white/60 mt-6 inline-flex items-center gap-1 justify-center w-full">
            <CheckCircle className="w-4 h-4 text-green-400" /> Code sent — check your inbox and spam folder
          </p>
        )}
      </motion.div>
    </div>
  );
}
