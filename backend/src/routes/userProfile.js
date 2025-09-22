import express from 'express';
import { UserProfileController } from '../controllers/userProfileController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile management routes
router.get('/profile', UserProfileController.getUserProfile);
router.put('/profile', UserProfileController.updateUserProfile);

// Avatar management routes
router.post('/profile/avatar', uploadImage.single('avatar'), UserProfileController.uploadAvatar);
router.delete('/profile/avatar', UserProfileController.removeAvatar);

// Review management routes
router.get('/reviews', UserProfileController.getUserReviews);
router.put('/reviews/:reviewId', UserProfileController.updateUserReview);
router.delete('/reviews/:reviewId', UserProfileController.deleteUserReview);

// Order management routes
router.get('/orders', UserProfileController.getUserOrders);
router.get('/orders/:orderId', UserProfileController.getUserOrderDetails);

// Preferences management routes
router.put('/preferences', UserProfileController.updateUserPreferences);

// Address management routes
router.get('/addresses', UserProfileController.getUserAddresses);
router.post('/addresses', UserProfileController.addUserAddress);
router.put('/addresses/:addressId', UserProfileController.updateUserAddress);
router.put('/addresses/:addressId/default', UserProfileController.setDefaultAddress);
router.delete('/addresses/:addressId', UserProfileController.deleteUserAddress);

// Security routes
router.put('/password', UserProfileController.changePassword);

export default router;
