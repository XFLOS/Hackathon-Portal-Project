import express from 'express';
import { uploadSingle, uploadMultiple, handleFileUpload, handleMultipleUploads } from '../controllers/uploadController.js';
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// TEMPORARY: Auth removed to debug CORS/auth issues. Restore authenticateToken after verification.
router.post('/single', uploadSingle, handleFileUpload);
router.post('/multiple', uploadMultiple, handleMultipleUploads);

export default router;
