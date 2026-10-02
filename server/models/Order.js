import mongoose from 'mongoose';
import { nextOrderNumber } from './Counter.js';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String
}, { _id: false });

// Audit trail: who changed the fulfillment status and when
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: String, required: true }, // 'admin' | 'system'
  at: { type: Date, default: Date.now }
}, { _id: false });

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export const PAYMENT_METHODS = ['COD', 'SSLCommerz'];

export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];

const orderSchema = new mongoose.Schema({
  // Human-friendly order number, e.g. YB-7X2K9Q
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
    match: [/^$|^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  orderType: {
    type: String,
    required: true,
    enum: ['delivery', 'pickup'],
    default: 'pickup'
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters'],
    default: ''
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    default: ''
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  // Fulfillment status (admin-controlled, audited)
  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'Pending'
  },
  statusHistory: [statusHistorySchema],
  // Payment — paymentStatus is ONLY ever written by server-side
  // payment verification (gateway callback/IPN) or, for COD orders,
  // the audited cash-received endpoint. Never from the frontend directly.
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: 'unpaid'
  },
  // Invoice — generated once per order, reuses order data (no duplication)
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    index: true
  },
  invoiceGeneratedAt: {
    type: Date,
    default: undefined
  },
  // Gateway transaction id (SSLCommerz tran_id). Unique + sparse so it
  // doubles as an idempotency key against repeated gateway callbacks.
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    index: true
  },
  paidAt: {
    type: Date,
    default: undefined
  },
  // Raw gateway validation payload (no secrets) for reconciliation
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined,
    select: false
  },
  estimatedTime: {
    type: Number,
    default: 30 // minutes
  }
}, {
  timestamps: true
});

// Auto-generate a unique sequential order number (YB-2026-000123)
orderSchema.pre('validate', async function(next) {
  try {
    if (!this.orderNumber) {
      this.orderNumber = await nextOrderNumber();
    }
    next();
  } catch (e) {
    next(e);
  }
});

// Index for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ phone: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
