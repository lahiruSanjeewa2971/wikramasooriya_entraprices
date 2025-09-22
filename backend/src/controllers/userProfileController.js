import { simpleUserProfileService } from '../services/simpleUserProfileService.js';
import { AppError } from '../middleware/errorHandler.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

export class UserProfileController {
  // GET /api/users/profile - Get user profile information
  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await simpleUserProfileService.getUserProfile(userId);
      
      // Update last activity
      await simpleUserProfileService.updateLastActivity(userId);

      res.json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_PROFILE_ERROR');
    }
  }

  // PUT /api/users/profile - Update user profile information
  static async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      // Validate required fields
      if (!profileData.name && !profileData.mobile && !profileData.location && 
          !profileData.date_of_birth && !profileData.gender && !profileData.bio) {
        throw new AppError('At least one field must be provided for update', 400, 'VALIDATION_ERROR');
      }

      const updatedProfile = await simpleUserProfileService.updateUserProfile(userId, profileData);

      res.json({
        success: true,
        data: { profile: updatedProfile },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_PROFILE_ERROR');
    }
  }

  // GET /api/users/reviews - Get user's reviews
  static async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

      const reviews = await simpleUserProfileService.getUserReviews(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy
      });

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_REVIEWS_ERROR');
    }
  }

  // PUT /api/users/reviews/:reviewId - Update user's review
  static async updateUserReview(req, res) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;

      // Validate required fields
      if (!rating || !title || !comment) {
        throw new AppError('Rating, title, and comment are required', 400, 'VALIDATION_ERROR');
      }

      if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR');
      }

      if (title.length < 5) {
        throw new AppError('Title must be at least 5 characters long', 400, 'VALIDATION_ERROR');
      }

      if (comment.length < 10) {
        throw new AppError('Comment must be at least 10 characters long', 400, 'VALIDATION_ERROR');
      }

      const updatedReview = await simpleUserProfileService.updateUserReview(userId, reviewId, {
        rating, title, comment
      });

      res.json({
        success: true,
        data: { review: updatedReview },
        message: 'Review updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_REVIEW_ERROR');
    }
  }

  // DELETE /api/users/reviews/:reviewId - Delete user's review
  static async deleteUserReview(req, res) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;

      await simpleUserProfileService.deleteUserReview(userId, reviewId);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'DELETE_REVIEW_ERROR');
    }
  }

  // GET /api/users/orders - Get user's order history
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const orders = await simpleUserProfileService.getUserOrders(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_ORDERS_ERROR');
    }
  }

  // GET /api/users/orders/:orderId - Get specific order details
  static async getUserOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await simpleUserProfileService.getUserOrderDetails(userId, orderId);

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_ORDER_DETAILS_ERROR');
    }
  }

  // PUT /api/users/preferences - Update user preferences
  static async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const updatedPreferences = await simpleUserProfileService.updateUserPreferences(userId, preferences);

      res.json({
        success: true,
        data: { preferences: updatedPreferences },
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_PREFERENCES_ERROR');
    }
  }

  // GET /api/users/addresses - Get user addresses
  static async getUserAddresses(req, res) {
    try {
      const userId = req.user.id;

      const addresses = await simpleUserProfileService.getUserAddresses(userId);

      res.json({
        success: true,
        data: { addresses }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_ADDRESSES_ERROR');
    }
  }

  // POST /api/users/addresses - Add user address
  static async addUserAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = req.body;

      // Validate required fields
      const requiredFields = ['address_type', 'full_name', 'address_line_1', 'city', 'state_province', 'postal_code', 'country'];
      for (const field of requiredFields) {
        if (!addressData[field]) {
          throw new AppError(`${field} is required`, 400, 'VALIDATION_ERROR');
        }
      }

      const newAddress = await simpleUserProfileService.addUserAddress(userId, addressData);

      res.json({
        success: true,
        data: { address: newAddress },
        message: 'Address added successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'ADD_ADDRESS_ERROR');
    }
  }

  // PUT /api/users/addresses/:addressId - Update user address
  static async updateUserAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const addressData = req.body;

      const updatedAddress = await simpleUserProfileService.updateUserAddress(userId, addressId, addressData);

      res.json({
        success: true,
        data: { address: updatedAddress },
        message: 'Address updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_ADDRESS_ERROR');
    }
  }

  // PUT /api/users/addresses/:addressId/default - Set address as default
  static async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      const updatedAddress = await simpleUserProfileService.setDefaultAddress(userId, addressId);

      res.json({
        success: true,
        data: { address: updatedAddress },
        message: 'Address set as default successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'SET_DEFAULT_ADDRESS_ERROR');
    }
  }

  // DELETE /api/users/addresses/:addressId - Delete user address
  static async deleteUserAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      await simpleUserProfileService.deleteUserAddress(userId, addressId);

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'DELETE_ADDRESS_ERROR');
    }
  }

  // PUT /api/users/password - Change user password
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
      }

      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400, 'VALIDATION_ERROR');
      }

      // Get user with password hash for verification
      const { query } = await import('../db/simple-connection.js');
      const userResult = await query(
        'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current password using bcrypt.compare (same pattern as auth service)
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await query(`
        UPDATE users 
        SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId, newPasswordHash]);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CHANGE_PASSWORD_ERROR');
    }
  }

  // POST /api/users/profile/avatar - Upload user avatar
  static async uploadAvatar(req, res) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        throw new AppError('No image file provided', 400, 'MISSING_FILE');
      }

      // Configure Cloudinary
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      // Upload to Cloudinary
      const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'avatars',
        resource_type: 'image',
        transformation: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      // Update user avatar URL in database
      const updatedProfile = await simpleUserProfileService.uploadAvatar(userId, uploadResult.secure_url);

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        data: { 
          profile: updatedProfile,
          avatar_url: uploadResult.secure_url
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      // Clean up temporary file on error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup temp file:', cleanupError);
        }
      }

      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPLOAD_AVATAR_ERROR');
    }
  }

  // DELETE /api/users/profile/avatar - Remove user avatar
  static async removeAvatar(req, res) {
    try {
      const userId = req.user.id;

      const updatedProfile = await simpleUserProfileService.removeAvatar(userId);

      res.json({
        success: true,
        data: { profile: updatedProfile },
        message: 'Avatar removed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'REMOVE_AVATAR_ERROR');
    }
  }
}
