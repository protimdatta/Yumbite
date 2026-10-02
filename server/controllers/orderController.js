import crypto from 'crypto';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { getSetting } from '../models/Setting.js';
import { nextInvoiceNumber } from '../models/Counter.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/email.js';
import { initPayment, validatePayment, safePaymentDetails } from '../utils/sslcommerz.js';

function frontendBase() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

// Shared: validate items server-side and compute totals (never trust client math)
async function buildOrderDraft({ customerName, phone, email, orderType, address, note, items, userId }) {
  if (!items || items.length === 0) {
    const err = new Error('Order must contain at least one item');
    err.code = 'BAD_REQUEST';
    throw err;
  }
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem) {
      const err = new Error(`Menu item not found: ${item.menuItemId}`);
      err.code = 'BAD_REQUEST';
      throw err;
    }
    if (!menuItem.isAvailable) {
      const err = new Error(`${menuItem.name} is currently unavailable`);
      err.code = 'BAD_REQUEST';
      throw err;
    }
    const discount = Math.min(Math.max(menuItem.discount || 0, 0), 100);
    const unitPrice = Math.round(menuItem.price * (1 - discount / 100));
    subtotal += unitPrice * item.quantity;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name + (discount > 0 ? ` (${discount}% off)` : ''),
      price: unitPrice,
      quantity: item.quantity,
      image: menuItem.image
    });
  }
  const deliveryFee = orderType === 'delivery'
    ? (subtotal >= Number(await getSetting('freeDeliveryThreshold')) || subtotal === 0 ? 0 : Number(await getSetting('deliveryFee')))
    : 0;
  return {
    user: userId || null,
    customerName: customerName?.trim(),
    phone: phone?.trim(),
    email: email?.trim() || '',
    orderType,
    address: orderType === 'delivery' ? (address?.trim() || '') : '',
    note: note?.trim() || '',
    items: orderItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    estimatedTime: orderType === 'delivery' ? 45 : 25
  };
}

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

// Best-effort customer mails — never fail the order/status change
async function notifyCustomer(order) {
  try {
    await sendOrderConfirmation(order);
  } catch (e) {
    console.error('Order confirmation email skipped/failed:', e.message);
  }
}

async function notifyStatusChange(order, newStatus) {
  try {
    await sendOrderStatusUpdate(order, newStatus);
  } catch (e) {
    console.error(`Order status email (${newStatus}) skipped/failed:`, e.message);
  }
}

// POST /api/orders  { ..., paymentMethod: 'COD' }
// Cash on Delivery: paymentStatus stays 'unpaid' until cash is received.
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod = 'COD' } = req.body;
    if (paymentMethod !== 'COD') {
      return badRequest(res, 'Use /api/orders/initiate for online payment.');
    }
    const draft = await buildOrderDraft({ ...req.body, userId: req.user ? req.user._id : null });
    const order = await Order.create({
      ...draft,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', changedBy: 'system' }],
      paymentMethod: 'COD',
      paymentStatus: 'unpaid',
    });
    await order.populate('items.menuItem');
    notifyCustomer(order);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.code === 'BAD_REQUEST') return badRequest(res, error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/orders/initiate  { ...order fields, paymentMethod: 'SSLCommerz' }
// Creates a pending order + gateway session. Returns GatewayPageURL.
export const initiateOnlinePayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (paymentMethod !== 'SSLCommerz') {
      return badRequest(res, 'paymentMethod must be SSLCommerz for this endpoint.');
    }
    const draft = await buildOrderDraft({ ...req.body, userId: req.user ? req.user._id : null });
    // Server-generated idempotency key — the client never supplies tran_id
    const transactionId = `YB${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const order = await Order.create({
      ...draft,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', changedBy: 'system' }],
      paymentMethod: 'SSLCommerz',
      paymentStatus: 'pending',
      transactionId,
    });

    let gateway;
    try {
      gateway = await initPayment({
        tranId: transactionId,
        total: order.total,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        address: order.address,
      });
    } catch (e) {
      if (e.code === 'PAY_NOT_CONFIGURED') {
        await Order.findByIdAndDelete(order._id); // don't leave dead pending orders
        return res.status(503).json({ success: false, message: 'Online payment is not configured yet. Please choose Cash on Delivery.' });
      }
      await Order.findByIdAndUpdate(order._id, { paymentStatus: 'failed' });
      return res.status(502).json({ success: false, message: e.message || 'Payment gateway unreachable. Please try COD.' });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        transactionId,
        total: order.total,
        gatewayUrl: gateway.gatewayUrl,
      }
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    if (error.code === 'BAD_REQUEST') return badRequest(res, error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Shared verification core (used by success callback + IPN).
// Atomic: only a 'pending' order can transition to paid — repeated
// callbacks are safe no-ops (idempotent).
async function confirmOnlinePayment({ tranId, valId }) {
  const order = await Order.findOne({ transactionId: tranId });
  if (!order) return { outcome: 'unknown-order' };
  if (order.paymentStatus === 'paid') return { outcome: 'already-paid', order };

  let validation;
  try {
    validation = await validatePayment({ valId, expectedAmount: order.total });
  } catch (e) {
    if (e.code === 'PAY_NOT_CONFIGURED') return { outcome: 'not-configured', order };
    console.error('Gateway validation error:', e.message);
    return { outcome: 'error', order };
  }
  if (!validation.valid) {
    // Genuine gateway rejection — mark failed (only from pending)
    await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: 'pending' },
      { paymentStatus: 'failed', paymentDetails: safePaymentDetails(validation) }
    );
    return { outcome: 'invalid', order, reason: validation.reason };
  }
  if (validation.tranId && validation.tranId !== tranId) {
    return { outcome: 'invalid', order, reason: 'Transaction ID mismatch' };
  }

  // Atomic paid transition — first callback wins
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: 'pending' },
    {
      paymentStatus: 'paid',
      paidAt: new Date(),
      status: 'Confirmed',
      paymentDetails: safePaymentDetails(validation),
      $push: { statusHistory: { status: 'Confirmed', changedBy: 'system' } },
    },
    { new: true }
  );
  if (!updated) return { outcome: 'already-paid', order }; // lost the race safely
  notifyCustomer(updated);
  notifyStatusChange(updated, 'Confirmed');
  return { outcome: 'paid', order: updated };
}

function redirectToFrontend(res, path) {
  res.redirect(302, `${frontendBase()}${path}`);
}

// GET /api/payments/ssl/success — gateway redirects here after payment.
// Expects: tran_id, val_id (form-encoded or query).
export const sslSuccess = async (req, res) => {
  try {
    const data = { ...(req.query || {}), ...(req.body || {}) };
    const tranId = data.tran_id;
    const valId = data.val_id;
    if (!tranId || !valId) {
      return redirectToFrontend(res, '/order/failed?reason=missing-data');
    }
    const result = await confirmOnlinePayment({ tranId, valId });
    if (result.outcome === 'paid' || result.outcome === 'already-paid') {
      return redirectToFrontend(res, `/order/success?orderNumber=${result.order.orderNumber}&tran_id=${tranId}`);
    }
    if (result.outcome === 'unknown-order') {
      return redirectToFrontend(res, '/order/failed?reason=unknown-order');
    }
    return redirectToFrontend(res, '/order/failed?reason=verification-failed');
  } catch (error) {
    console.error('SSL success callback error:', error);
    return redirectToFrontend(res, '/order/failed?reason=server-error');
  }
};

// GET /api/payments/ssl/fail — customer payment failed at gateway
export const sslFail = async (req, res) => {
  try {
    const tranId = (req.query || {}).tran_id || (req.body || {}).tran_id;
    if (tranId) {
      await Order.findOneAndUpdate(
        { transactionId: tranId, paymentStatus: 'pending' },
        { paymentStatus: 'failed' }
      );
    }
    return redirectToFrontend(res, `/order/failed?reason=payment-failed${tranId ? `&tran_id=${tranId}` : ''}`);
  } catch (error) {
    console.error('SSL fail callback error:', error);
    return redirectToFrontend(res, '/order/failed?reason=payment-failed');
  }
};

// GET /api/payments/ssl/cancel — customer cancelled at gateway
export const sslCancel = async (req, res) => {
  try {
    const tranId = (req.query || {}).tran_id || (req.body || {}).tran_id;
    if (tranId) {
      await Order.findOneAndUpdate(
        { transactionId: tranId, paymentStatus: 'pending' },
        { paymentStatus: 'failed' }
      );
    }
    return redirectToFrontend(res, `/order/failed?reason=cancelled${tranId ? `&tran_id=${tranId}` : ''}`);
  } catch (error) {
    console.error('SSL cancel callback error:', error);
    return redirectToFrontend(res, '/order/failed?reason=cancelled');
  }
};

// POST /api/payments/ssl/ipn — server-to-server notification (no redirect)
export const sslIpn = async (req, res) => {
  try {
    const data = { ...(req.query || {}), ...(req.body || {}) };
    if (!data.tran_id || !data.val_id) {
      return res.status(400).json({ success: false, message: 'tran_id and val_id required' });
    }
    const result = await confirmOnlinePayment({ tranId: data.tran_id, valId: data.val_id });
    res.json({ success: true, outcome: result.outcome });
  } catch (error) {
    console.error('SSL IPN error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/orders/track/:orderNumber?phone=... — public order tracking.
// Phone must match (privacy: no order details without it).
export const trackOrder = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return badRequest(res, 'Phone number is required to track your order.');
    const order = await Order.findOne({ orderNumber: String(req.params.orderNumber).toUpperCase() })
      .select('-paymentDetails');
    if (!order || order.phone.replace(/\D/g, '') !== String(phone).replace(/\D/g, '')) {
      return res.status(404).json({ success: false, message: 'Order not found. Check the order number and phone.' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get invoice for an order (owner customer or admin only).
// Generates the invoice number once, atomically — repeated calls return
// the same number, never duplicates.
export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership: admins pass; customers must own the order; guest orders
    // (no user linked) are not viewable as invoices — log in first.
    if (!req.admin) {
      if (!order.user || String(order.user) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You can only view your own invoices' });
      }
    }

    // Atomic one-time invoice generation (first caller wins, no duplicates)
    let updated = order;
    if (!order.invoiceNumber) {
      const invoiceNumber = await nextInvoiceNumber();
      updated = await Order.findOneAndUpdate(
        { _id: order._id, invoiceNumber: { $exists: false } },
        { $set: { invoiceNumber, invoiceGeneratedAt: new Date() } },
        { new: true }
      ).populate('items.menuItem', 'name image');
      if (!updated) {
        updated = await Order.findById(order._id).populate('items.menuItem', 'name image');
      }
    }

    res.json({
      success: true,
      data: {
        invoiceNumber: updated.invoiceNumber,
        invoiceGeneratedAt: updated.invoiceGeneratedAt,
        order: updated,
      },
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all orders (Admin only)
export const getOrders = async (req, res) => {
  try {
    const { status, paymentMethod, paymentStatus, page, limit, sort } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('items.menuItem', 'name image');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single order (Admin only)
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update fulfillment status (Admin only).
// NOTE: this can NEVER change paymentStatus — online payments become paid
// only through server-side gateway verification.
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // No actual change -> no email, no duplicate notification
    if (order.status === status) {
      await order.populate('items.menuItem');
      return res.json({ success: true, data: order, unchanged: true });
    }

    order.status = status;
    order.statusHistory.push({ status, changedBy: 'admin' });
    await order.save();
    await order.populate('items.menuItem');

    notifyStatusChange(order, status);

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Record cash received (Admin only, COD orders only, audited).
// Online (SSLCommerz) orders are REJECTED here — they can only become
// paid via gateway verification, never by hand.
export const markCashReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentMethod !== 'COD') {
      return res.status(403).json({
        success: false,
        message: 'Online payments can only be marked paid by gateway verification, not manually.',
      });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    await order.save();
    await order.populate('items.menuItem');
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Mark cash received error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get order stats (Admin only)
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    const paidStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        paid: paidStats,
        today: todayStats[0] || { count: 0, totalRevenue: 0 }
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
