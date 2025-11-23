import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTeam,
  getMyTeam,
  addMember,
  getAllTeams,
  getTeamById,
  postTeamUpdate,
  leaveTeam,
  deleteTeam,
  updateTeam
} from '../controllers/teamController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', protect, createTeam); // Changed from /create to / (matches frontend POST /teams)
router.get('/', protect, getAllTeams); // Added GET /teams (matches frontend)
router.get('/me', protect, getMyTeam);
router.post('/join', protect, addMember); // Changed from /add-member to /join (matches frontend)
router.post('/leave', protect, leaveTeam); // Leave team
router.get('/:id', protect, getTeamById);
router.put('/:id', protect, updateTeam); // Update team details (leader only)
router.delete('/:id', protect, deleteTeam); // Delete team (leader only)
router.post('/:id/update', protect, postTeamUpdate); // Added team update endpoint
router.post('/:id/members', protect, addMember); // Add member by email (leader only)

export default router;
