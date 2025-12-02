import multer from 'multer';
import { storage } from '../config/cloudinary.js';

// Initialize multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload single file
export const uploadSingle = upload.single('file');

// Upload multiple files
export const uploadMultiple = upload.array('files', 5);

// Handle file upload
export const handleFileUpload = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user ? req.user.id : 'No user');
    
    if (!req.file) {
      console.error('❌ No file in request');
      console.log('Request keys:', Object.keys(req));
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'File was not received by server. Check multipart/form-data encoding.'
      });
    }

    console.log('✅ File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      filename: req.file.filename
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size,
        format: req.file.format
      }
    });
    console.log('=== UPLOAD REQUEST END ===');
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Handle multiple file uploads
export const handleMultipleUploads = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: file.path,
      filename: file.filename,
      size: file.size,
      format: file.format
    }));

    res.json({
      message: `${files.length} files uploaded successfully`,
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};
