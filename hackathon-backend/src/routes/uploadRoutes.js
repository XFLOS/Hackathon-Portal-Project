import express from 'express';
import { uploadSingle, uploadMultiple, handleFileUpload, handleMultipleUploads } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected file upload routes
router.post('/single', authenticateToken, uploadSingle, handleFileUpload);
router.post('/multiple', authenticateToken, uploadMultiple, handleMultipleUploads);

export default router;
