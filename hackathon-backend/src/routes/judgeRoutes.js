import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSubmissions,
  evaluateSubmission,
  getEvaluationHistory,
  getEvaluationBySubmission,
  getJudgeAssignments,
  getMyJudgeAssignments
} from '../controllers/judgeController.js';

const router = express.Router();

// Protected routes (require authentication + judge role)
router.get('/submissions', protect, getSubmissions);
router.post('/evaluate/:submissionId', protect, evaluateSubmission);
router.get('/history', protect, getEvaluationHistory);
router.get('/evaluation/:submissionId', protect, getEvaluationBySubmission);
router.get('/assignments/:judgeId', protect, getJudgeAssignments);
router.get('/assignments/me', protect, getMyJudgeAssignments);

export default router;
