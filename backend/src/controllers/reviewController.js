import { AppError } from '../middleware/errorHandler.js';
import { simpleReviewService } from '../services/simpleReviewService.js';

export class ReviewController {
  // Get product reviews with pagination and sorting
  static async getProductReviews(req, res) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = 'newest'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
      };

      const result = await simpleReviewService.getProductReviews(id, options);

      res.json({
        success: true,
        data: {
          reviews: result.reviews,
          pagination: result.pagination
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'REVIEWS_FETCH_ERROR');
    }
  }

  // Create a new product review
  static async createReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, title, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      if (!rating || !title || !comment) {
        throw new AppError('Rating, title, and comment are required', 400, 'MISSING_FIELDS');
      }

      const review = await simpleReviewService.createReview(id, userId, {
        rating,
        title,
        comment
      });

      res.status(201).json({
        success: true,
        data: {
          review
        },
        message: 'Review created successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400, 'REVIEW_CREATE_ERROR');
    }
  }

  // Update an existing review
  static async updateReview(req, res) {
    try {
      const { id, reviewId } = req.params;
      const { rating, title, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      if (!rating && !title && !comment) {
        throw new AppError('At least one field (rating, title, comment) must be provided', 400, 'NO_FIELDS_TO_UPDATE');
      }

      const review = await simpleReviewService.updateReview(reviewId, userId, {
        rating,
        title,
        comment
      });

      res.json({
        success: true,
        data: {
          review
        },
        message: 'Review updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400, 'REVIEW_UPDATE_ERROR');
    }
  }

  // Delete a review
  static async deleteReview(req, res) {
    try {
      const { id, reviewId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      const review = await simpleReviewService.deleteReview(reviewId, userId);

      res.json({
        success: true,
        data: {
          review
        },
        message: 'Review deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400, 'REVIEW_DELETE_ERROR');
    }
  }

  // Mark review as helpful/unhelpful
  static async markHelpful(req, res) {
    try {
      const { id, reviewId } = req.params;
      const { is_helpful } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      if (typeof is_helpful !== 'boolean') {
        throw new AppError('is_helpful must be a boolean value', 400, 'INVALID_HELPFUL_VALUE');
      }

      const result = await simpleReviewService.markReviewHelpful(reviewId, userId, is_helpful);

      res.json({
        success: true,
        data: result,
        message: `Review marked as ${is_helpful ? 'helpful' : 'not helpful'}`
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400, 'REVIEW_HELPFUL_ERROR');
    }
  }

  static async getUserVoteStatus(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      const result = await simpleReviewService.getUserVoteStatus(reviewId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'GET_VOTE_STATUS_ERROR');
    }
  }

  // Get user's review for a specific product
  static async getUserReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      const review = await simpleReviewService.getUserReviewForProduct(id, userId);

      res.json({
        success: true,
        data: {
          review
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'USER_REVIEW_FETCH_ERROR');
    }
  }

  // Get review by ID
  static async getReviewById(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await simpleReviewService.getReviewById(reviewId);

      if (!review) {
        throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          review
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'REVIEW_FETCH_ERROR');
    }
  }
}
