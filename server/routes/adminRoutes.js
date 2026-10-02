import express from 'express';
import { getOverview, listUsers, getUserDetail, setUserActive } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All admin analytics/user-management routes require an admin JWT.
// Customer tokens never pass `protect` (it looks up the Admin collection).
router.use(protect);

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/status', setUserActive);

export default router;
