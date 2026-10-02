import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    
    const token = generateToken(admin._id);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current admin profile
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create initial admin (for setup)
export const createInitialAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    
    const admin = await Admin.create({ username, email, password, role: 'superadmin' });
    
    const token = generateToken(admin._id);
    
    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create initial admin error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update own admin profile (username / email)
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body || {};
    const updates = {};
    if (username !== undefined) {
      if (!String(username).trim() || String(username).trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
      }
      updates.username = String(username).trim();
    }
    if (email !== undefined) {
      if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email' });
      }
      updates.email = String(email).trim().toLowerCase();
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }
    const admin = await Admin.findByIdAndUpdate(req.admin.id, updates, { new: true, runValidators: true });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Update admin profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username or email already taken' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change own admin password (current password required)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};