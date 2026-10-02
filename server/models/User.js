import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    // Google-only accounts have no password; required for local accounts
    required: [function() { return !this.googleId; }, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  // Google OAuth linking (customer auth only — admin auth is separate)
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'both'],
    default: 'local'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Password reset via email OTP (only the SHA-256 hash is stored)
  resetOtpHash: {
    type: String,
    select: false,
    default: undefined
  },
  resetOtpExpires: {
    type: Date,
    select: false,
    default: undefined
  },
  resetOtpAttempts: {
    type: Number,
    select: false,
    default: 0
  },
  resetOtpVerifiedAt: {
    type: Date,
    select: false,
    default: undefined
  },
  // DB-backed OTP request throttling (survives restarts)
  otpRequestCount: {
    type: Number,
    select: false,
    default: 0
  },
  otpRequestWindowExpires: {
    type: Date,
    select: false,
    default: undefined
  },
  lastOtpRequestAt: {
    type: Date,
    select: false,
    default: undefined
  }
}, {
  timestamps: true
});

// Hash password before saving (Google-only accounts have no password)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  // Skip if already a bcrypt hash (e.g. linked-account edge cases)
  if (/^\$2[aby]\$/.test(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields in JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;