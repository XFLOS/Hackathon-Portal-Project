import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createSubmission,
  getMySubmission,
  getAllSubmissions,
  getSubmissionById
} from '../controllers/submissionController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', protect, createSubmission);
router.get('/me', protect, getMySubmission);
router.get('/all', protect, getAllSubmissions);
router.get('/:id', protect, getSubmissionById);

export default router;
