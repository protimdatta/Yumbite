import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, updateSettings);

export default router;
