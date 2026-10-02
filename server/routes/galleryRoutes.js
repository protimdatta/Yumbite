import express from 'express';
import {
  getGalleryImages,
  getAllGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../controllers/galleryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getGalleryImages);

// Admin only
router.get('/all', protect, getAllGalleryImages);
router.post('/', protect, createGalleryImage);
router.put('/:id', protect, updateGalleryImage);
router.delete('/:id', protect, deleteGalleryImage);

export default router;