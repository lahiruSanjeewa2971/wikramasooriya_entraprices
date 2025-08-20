import express from 'express';
import upload, { handleUploadError } from '../middleware/upload.js';
import UploadController from '../controllers/uploadController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticateToken);

// Upload single image
router.post('/image', 
  upload.single('image'), 
  handleUploadError,
  asyncHandler(UploadController.uploadImage)
);

// Delete image
router.delete('/image/:publicId', 
  asyncHandler(UploadController.deleteImage)
);

// Get image info
router.get('/image/:publicId', 
  asyncHandler(UploadController.getImageInfo)
);

export default router;
