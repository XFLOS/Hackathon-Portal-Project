import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
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

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hackathon-uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'zip'],
    resource_type: 'auto', // Automatically detect file type
  },
});

if (isConfigured) {
  console.log('SUCCESS: Cloudinary configured');
}

export { cloudinary, storage };
export default cloudinary;
