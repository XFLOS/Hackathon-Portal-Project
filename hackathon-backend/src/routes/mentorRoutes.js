import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAssignedTeams,
  provideFeedback,
  getTeamFeedback,
  getTeamDetails
} from '../controllers/mentorController.js';

const router = express.Router();

// Protected routes (require authentication + mentor role)
router.get('/teams', protect, getAssignedTeams);
router.post('/feedback/:teamId', protect, provideFeedback);
router.get('/feedback/:teamId', protect, getTeamFeedback);
router.get('/team/:teamId', protect, getTeamDetails);

export default router;
