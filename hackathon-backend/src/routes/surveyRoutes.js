import express from 'express';
import { submitSurvey, getSurveys } from '../controllers/surveyController.js';

const router = express.Router();

// POST /surveys - submit a survey response
router.post('/', submitSurvey);

// GET /surveys - get all survey responses (admin only)
router.get('/', getSurveys);

export default router;
