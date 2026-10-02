// Tiny in-memory rate limiter for OTP endpoints (per IP + email).
// This is a second layer: per-email cooldown/hourly caps are also enforced
// against MongoDB in the controller so limits survive restarts.
const buckets = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    entry.hits = entry.hits.filter((t) => now - t < entry.windowMs);
    if (entry.hits.length === 0) buckets.delete(key);
  }
}

const sweep = setInterval(cleanup, 60 * 1000);
if (typeof sweep.unref === 'function') sweep.unref();

export function otpRateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const key = `${req.ip || 'unknown'}:${req.path}:${email}`;
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry) {
      entry = { hits: [], windowMs };
      buckets.set(key, entry);
    }
    entry.windowMs = windowMs;
    entry.hits = entry.hits.filter((t) => now - t < windowMs);
    if (entry.hits.length >= max) {
      return res.status(429).json({ success: false, message });
    }
    entry.hits.push(now);
    next();
  };
}

// Floors brute force from a single source; DB-backed caps are stricter.
export const otpRequestLimiter = otpRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many code requests. Please try again in 15 minutes.',
});

export const otpVerifyLimiter = otpRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many verification attempts. Please try again in 15 minutes.',
});
