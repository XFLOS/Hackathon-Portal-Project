import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Check if Cloudinary credentials are configured
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  !process.env.CLOUDINARY_CLOUD_NAME.includes('<') &&
  process.env.CLOUDINARY_API_KEY && 
  !process.env.CLOUDINARY_API_KEY.includes('<');

if (!isConfigured) {
  console.warn('WARNING: Cloudinary credentials not properly configured in .env');
  console.warn('WARNING: File upload features will not work until configured\n');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Create storage for multer
// If Cloudinary is not configured on the server (e.g., Render env vars missing),
// fall back to in-memory storage so uploads won't 500. The API will still return
// a dummy URL so the frontend flow can proceed during demos.
let storage;
if (isConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'hackathon-uploads', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'zip'],
      resource_type: 'auto', // Automatically detect file type
    },
  });
} else {
  storage = multer.memoryStorage();
}

if (isConfigured) {
  console.log('SUCCESS: Cloudinary configured');
} else {
  console.log('INFO: Using in-memory storage for uploads (no Cloudinary config)');
}

export { cloudinary, storage };
export default cloudinary;
