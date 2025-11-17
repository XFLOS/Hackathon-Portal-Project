import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTeam,
  getMyTeam,
  addMember,
  getAllTeams,
  getTeamById
} from '../controllers/teamController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/create', protect, createTeam);
router.get('/me', protect, getMyTeam);
router.post('/add-member', protect, addMember);
router.get('/all', protect, getAllTeams);
router.get('/:id', protect, getTeamById);

export default router;
