import multer from 'multer';
import cloudinary from 'cloudinary';
import { AppError } from './errorHandler.js';
import path from 'path';
import fs from 'fs';

// Cloudinary configuration will be done when needed
let cloudinaryConfigured = false;

function configureCloudinary() {
  if (!cloudinaryConfigured) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
  }
}

// Use disk storage for file processing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG, PNG, and WebP are allowed.', 400, 'INVALID_FILE_TYPE'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size too large. Maximum size is 10MB.', 400, 'FILE_TOO_LARGE'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Only one file is allowed.', 400, 'TOO_MANY_FILES'));
    }
    return next(new AppError('File upload error: ' + error.message, 400, 'UPLOAD_ERROR'));
  }
  
  if (error instanceof AppError) {
    return next(error);
  }
  
  return next(new AppError('File upload failed: ' + error.message, 500, 'UPLOAD_FAILED'));
};

export { configureCloudinary };
export default upload;
