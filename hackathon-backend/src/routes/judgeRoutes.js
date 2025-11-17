import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSubmissions,
  evaluateSubmission,
  getEvaluationHistory,
  getEvaluationBySubmission
} from '../controllers/judgeController.js';

const router = express.Router();

// Protected routes (require authentication + judge role)
router.get('/submissions', protect, getSubmissions);
router.post('/evaluate/:submissionId', protect, evaluateSubmission);
router.get('/history', protect, getEvaluationHistory);
router.get('/evaluation/:submissionId', protect, getEvaluationBySubmission);

export default router;
