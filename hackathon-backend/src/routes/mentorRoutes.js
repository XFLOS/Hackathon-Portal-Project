import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAssignedTeams,
  provideFeedback,
  getTeamFeedback,
  getTeamDetails
} from '../controllers/mentorController.js';
import {
  uploadResource,
  getMyResources,
  getTeamResources,
  getStudentResources,
  deleteResource
} from '../controllers/mentorResourceController.js';

const router = express.Router();

// Protected routes (require authentication + mentor role)
router.get('/teams', protect, getAssignedTeams);
router.post('/feedback/:teamId', protect, provideFeedback);
router.get('/feedback/:teamId', protect, getTeamFeedback);
router.get('/team/:teamId', protect, getTeamDetails);

// Resource routes
router.post('/resources/upload', protect, uploadResource);
router.get('/resources', protect, getMyResources);
router.get('/resources/team/:teamId', protect, getTeamResources);
router.get('/resources/student', protect, getStudentResources);
router.delete('/resources/:id', protect, deleteResource);

export default router;
