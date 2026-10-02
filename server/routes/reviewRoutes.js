import express from 'express';
import {
  getReviews,
  createReview,
  getAllReviews,
  toggleReviewApproval,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { protectUser } from '../middleware/userAuth.js';

const router = express.Router();

// Public
router.get('/', getReviews);

// Logged-in customers
router.post('/', protectUser, createReview);

// Admin only
router.get('/all', protect, getAllReviews);
router.patch('/:id/toggle', protect, toggleReviewApproval);
router.delete('/:id', protect, deleteReview);

export default router;