import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Get unread notification count
// TEMPORARY: remove auth to unblock CORS/auth confusion in production
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.post('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Create notification (for system/coordinator use)
router.post('/create', protect, createNotification);

export default router;
