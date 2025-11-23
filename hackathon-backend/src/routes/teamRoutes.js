import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTeam,
  getMyTeam,
  addMember,
  getAllTeams,
  getTeamById,
  postTeamUpdate
} from '../controllers/teamController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', protect, createTeam); // Changed from /create to / (matches frontend POST /teams)
router.get('/', protect, getAllTeams); // Added GET /teams (matches frontend)
router.get('/me', protect, getMyTeam);
router.post('/join', protect, addMember); // Changed from /add-member to /join (matches frontend)
router.get('/:id', protect, getTeamById);
router.post('/:id/update', protect, postTeamUpdate); // Added team update endpoint

export default router;
