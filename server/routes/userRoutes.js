import express from 'express';
import {
  register,
  login,
  googleLogin,
  getMe,
  updateMe,
  getMyOrders
} from '../controllers/userController.js';
import { forgotPassword, verifyOtp, resetPassword } from '../controllers/passwordController.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/otpRateLimit.js';
import { protectUser } from '../middleware/userAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/reset-password', otpVerifyLimiter, resetPassword);

// Protected (customer JWT)
router.get('/me', protectUser, getMe);
router.put('/me', protectUser, updateMe);
router.get('/orders', protectUser, getMyOrders);

// Customer profile photo upload
router.post('/avatar', protectUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    req.user.avatar = `/uploads/${req.file.filename}`;
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, data: req.user });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;