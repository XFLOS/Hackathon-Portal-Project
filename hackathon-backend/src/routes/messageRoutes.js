import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getConversation,
  getTeamMessages,
  markAsRead,
  getUserConversations
} from '../controllers/messageController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/send', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.get('/team/:teamId', protect, getTeamMessages);
router.get('/conversations', protect, getUserConversations);
router.patch('/:messageId/read', protect, markAsRead);

export default router;
