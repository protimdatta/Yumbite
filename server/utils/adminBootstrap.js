// Single source of truth for the bootstrap admin account.
// Credentials come from backend .env (ADMIN_EMAIL / ADMIN_PASSWORD) —
// never from frontend code. Falls back to dev defaults with a loud warning
// so a fresh checkout still boots.
export function getBootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim() || 'admin@yumbite.com';
  const password = (process.env.ADMIN_PASSWORD || '').trim() || 'yumbite2024';
  const usingDefaults = !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD;
  return { email, password, usingDefaults };
}

export function warnIfDefaultAdmin() {
  console.warn(
    'WARNING: using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env for production.'
  );
}
