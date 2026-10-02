import express from 'express';
import {
  createOrder,
  initiateOnlinePayment,
  trackOrder,
  getInvoice,
  getOrders,
  getOrder,
  updateOrderStatus,
  markCashReceived,
  getOrderStats
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { optionalUser, flexAuth } from '../middleware/userAuth.js';

const router = express.Router();

// Public (guests welcome) — attaches user when a valid customer token is sent
router.post('/', optionalUser, createOrder);
router.post('/initiate', optionalUser, initiateOnlinePayment);
router.get('/track/:orderNumber', trackOrder);

// Invoice (owner customer or admin — ownership enforced in controller)
router.get('/:id/invoice', flexAuth, getInvoice);

// Protected routes (Admin only)
router.get('/', protect, getOrders);
router.get('/stats', protect, getOrderStats);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/cash-received', protect, markCashReceived);

export default router;