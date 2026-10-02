import crypto from 'crypto';

// OTP settings
export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_VERIFIED_TTL_MS = 10 * 60 * 1000; // verified flag valid 10 minutes
export const OTP_MAX_ATTEMPTS = 5; // wrong-code attempts per OTP before it is invalidated
export const OTP_REQUEST_COOLDOWN_MS = 60 * 1000; // min 60s between code requests
export const OTP_MAX_REQUESTS_PER_HOUR = 5;

// Secure random 6-digit code (crypto-backed, may include leading zeros)
export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(OTP_LENGTH, '0');
}

// Store only this hash in MongoDB — the raw code never touches the database
export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

// Timing-safe comparison to avoid leaking match position
export function otpMatches(candidate, storedHash) {
  if (!candidate || !storedHash) return false;
  const a = Buffer.from(hashOtp(candidate));
  const b = Buffer.from(String(storedHash));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isValidOtpFormat(otp) {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(String(otp || '').trim());
}
