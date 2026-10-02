import User from '../models/User.js';
import { sendPasswordResetOtp } from '../utils/email.js';
import {
  generateOtp,
  hashOtp,
  otpMatches,
  isValidOtpFormat,
  OTP_TTL_MS,
  OTP_VERIFIED_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_REQUEST_COOLDOWN_MS,
  OTP_MAX_REQUESTS_PER_HOUR,
} from '../utils/otp.js';

const OTP_FIELDS = '+resetOtpHash +resetOtpExpires +resetOtpAttempts +resetOtpVerifiedAt +otpRequestCount +otpRequestWindowExpires +lastOtpRequestAt';

function clearOtp(user) {
  user.resetOtpHash = undefined;
  user.resetOtpExpires = undefined;
  user.resetOtpAttempts = 0;
  user.resetOtpVerifiedAt = undefined;
}

// POST /api/users/forgot-password { email }
// Generates a 6-digit OTP and emails it via Resend. Only the hash is stored.
// Responds 200 either way to prevent account enumeration.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select(OTP_FIELDS);

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for this email, a 6-digit code has been sent.',
      });
    }

    const now = new Date();
    // 60-second cooldown between requests
    if (user.lastOtpRequestAt && now - user.lastOtpRequestAt < OTP_REQUEST_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_REQUEST_COOLDOWN_MS - (now - user.lastOtpRequestAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new code.`,
      });
    }
    // Max 5 codes per rolling hour
    if (user.otpRequestWindowExpires && user.otpRequestWindowExpires > now) {
      if ((user.otpRequestCount || 0) >= OTP_MAX_REQUESTS_PER_HOUR) {
        return res.status(429).json({
          success: false,
          message: 'Too many codes requested. Please try again later.',
        });
      }
    }

    const otp = generateOtp();
    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    user.resetOtpAttempts = 0;
    user.resetOtpVerifiedAt = undefined;
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetOtp({ to: user.email, name: user.name, otp });
    } catch (err) {
      // Roll back the code so a half-created reset cannot linger.
      clearOtp(user);
      await user.save({ validateBeforeSave: false });
      if (err.code === 'EMAIL_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message: 'Email service is not configured yet. Please contact support.',
        });
      }
      throw err;
    }

    // Count the request only after the email actually went out
    if (!user.otpRequestWindowExpires || user.otpRequestWindowExpires <= now) {
      user.otpRequestCount = 1;
      user.otpRequestWindowExpires = new Date(Date.now() + 60 * 60 * 1000);
    } else {
      user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    }
    user.lastOtpRequestAt = now;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'If an account exists for this email, a 6-digit code has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/users/verify-otp { email, otp }
// Wrong codes are counted; 5 misses invalidate the code (single-use lifecycle).
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!isValidOtpFormat(otp)) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit code' });
    }

    const normalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select(OTP_FIELDS);

    // Same message either way — never reveal whether the email exists.
    if (!user || !user.resetOtpHash || !user.resetOtpExpires || user.resetOtpExpires <= new Date()) {
      return res.status(400).json({ success: false, message: 'Code is invalid or has expired.' });
    }

    if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      clearOtp(user);
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ success: false, message: 'Too many wrong attempts. Please request a new code.' });
    }

    if (!otpMatches(String(otp).trim(), user.resetOtpHash)) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      const remaining = OTP_MAX_ATTEMPTS - user.resetOtpAttempts;
      if (remaining <= 0) {
        clearOtp(user);
        await user.save({ validateBeforeSave: false });
        return res.status(429).json({ success: false, message: 'Too many wrong attempts. Please request a new code.' });
      }
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    user.resetOtpAttempts = 0;
    user.resetOtpVerifiedAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Code verified. You can now set a new password.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/users/reset-password { email, password }
// Requires a freshly verified OTP; the code is invalidated on success.
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select(`${OTP_FIELDS} +password`);

    if (
      !user ||
      !user.resetOtpVerifiedAt ||
      Date.now() - new Date(user.resetOtpVerifiedAt).getTime() > OTP_VERIFIED_TTL_MS
    ) {
      return res.status(400).json({ success: false, message: 'Please verify your code first.' });
    }

    user.password = password; // hashed by bcrypt pre('save') hook
    clearOtp(user); // single-use: verification cannot be replayed
    await user.save();

    res.json({ success: true, message: 'Password has been reset. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
