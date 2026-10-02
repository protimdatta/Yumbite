import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyGoogleIdToken, findOrCreateGoogleUser } from '../utils/googleAuth.js';

// Generate JWT token for customers (type: user)
const generateToken = (id) => {
  return jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Customer signup
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password,
      address: address ? address.trim() : ''
    });

    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Customer login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Google-created accounts have no password — guide them to the right button
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'This account uses Google sign-in. Please use "Continue with Google".' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Google sign-in (customers): verify ID token, find-or-link-or-create, issue JWT
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google sign-in was cancelled or failed. Please try again.' });
    }

    let profile;
    try {
      profile = await verifyGoogleIdToken(String(idToken));
    } catch (err) {
      if (err.code === 'GOOGLE_NOT_CONFIGURED') {
        return res.status(503).json({ success: false, message: 'Google sign-in is not configured yet.' });
      }
      if (err.code === 'GOOGLE_UNVERIFIED') {
        return res.status(401).json({ success: false, message: 'Google account email is not verified.' });
      }
      return res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
    }

    let result;
    try {
      result = await findOrCreateGoogleUser(profile);
    } catch (err) {
      if (err.code === 'ACCOUNT_DEACTIVATED') {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }
      throw err;
    }

    const user = result.user;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ success: true, token, user, isNew: result.isNew });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current customer profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update customer profile (name, phone, address, avatar)
export const updateMe = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(address !== undefined ? { address: address.trim() } : {}),
        ...(avatar !== undefined ? { avatar: avatar.trim() } : {})
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get my orders (order history)
export const getMyOrders = async (req, res) => {
  try {
    const { default: Order } = await import('../models/Order.js');
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};