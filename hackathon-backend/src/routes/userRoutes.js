import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getSchedule,
  getAnnouncements,
  getLeaderboard,
  getCertificatesForUser
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/me/certificates', protect, getCertificatesForUser);

// Public routes (available to all authenticated users)
router.get('/schedule', protect, getSchedule);
router.get('/announcements', protect, getAnnouncements);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
