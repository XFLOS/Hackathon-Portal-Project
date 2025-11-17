import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllTeams,
  getAllSubmissions,
  createScheduleEvent,
  getSchedule,
  updateScheduleEvent,
  deleteScheduleEvent,
  getLeaderboard,
  assignMentor,
  getAllUsers,
  getStats
} from '../controllers/coordinatorController.js';

const router = express.Router();

// Protected routes (require authentication + coordinator role)
router.get('/teams', protect, getAllTeams);
router.get('/submissions', protect, getAllSubmissions);
router.post('/schedule', protect, createScheduleEvent);
router.get('/schedule', protect, getSchedule);
router.put('/schedule/:id', protect, updateScheduleEvent);
router.delete('/schedule/:id', protect, deleteScheduleEvent);
router.get('/leaderboard', protect, getLeaderboard);
router.post('/assign-mentor', protect, assignMentor);
router.get('/users', protect, getAllUsers);
router.get('/stats', protect, getStats);

export default router;
