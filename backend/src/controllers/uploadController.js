import { AppError } from '../middleware/errorHandler.js';
import { logApiError } from '../utils/logger.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

export default class UploadController {
  /**
   * Configure Cloudinary
   */
  static configureCloudinary() {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  /**
   * Upload a single image
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400, 'MISSING_FILE');
      }

      // Configure Cloudinary before use
      UploadController.configureCloudinary();

      // Upload to Cloudinary using file path
      const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      // Get file information
      const fileInfo = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        original_name: req.file.originalname,
        size: req.file.size,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        folder: 'products',
        created_at: new Date().toISOString()
      };

      // Clean up the temporary file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: fileInfo
      });

    } catch (error) {
      // Clean up the temporary file on error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      logApiError(req, error, { operation: 'uploadImage' });
      throw error;
    }
  }

  /**
   * Delete an uploaded image
   */
  static async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError('Public ID is required', 400, 'MISSING_PUBLIC_ID');
      }

      // Configure Cloudinary before use
      UploadController.configureCloudinary();

      // Delete from Cloudinary
      const result = await cloudinary.v2.uploader.destroy(publicId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      } else {
        throw new AppError('Failed to delete image', 500, 'DELETE_FAILED');
      }

    } catch (error) {
      logApiError(req, error, { operation: 'deleteImage' });
      throw error;
    }
  }

  /**
   * Get image information
   */
  static async getImageInfo(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError('Public ID is required', 400, 'MISSING_PUBLIC_ID');
      }

      // Configure Cloudinary before use
      UploadController.configureCloudinary();

      // Get image info from Cloudinary
      const result = await cloudinary.v2.api.resource(publicId);

      const imageInfo = {
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_name: result.original_filename,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        created_at: result.created_at
      };

      res.json({
        success: true,
        data: imageInfo
      });

    } catch (error) {
      logApiError(req, error, { operation: 'getImageInfo' });
      throw error;
    }
  }
}
