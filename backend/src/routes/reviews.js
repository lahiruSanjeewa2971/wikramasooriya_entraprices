import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ReviewController } from '../controllers/reviewController.js';

const router = express.Router();

// GET /api/reviews/product/:id - Get product reviews with pagination and sorting
router.get('/product/:id',
  asyncHandler(ReviewController.getProductReviews)
);

// GET /api/reviews/:reviewId - Get review by ID
router.get('/:reviewId',
  asyncHandler(ReviewController.getReviewById)
);

// GET /api/reviews/user/:id - Get user's review for a specific product
router.get('/user/:id',
  authenticateToken,
  asyncHandler(ReviewController.getUserReview)
);

// POST /api/reviews/product/:id - Create a new product review
router.post('/product/:id',
  authenticateToken,
  asyncHandler(ReviewController.createReview)
);

// PUT /api/reviews/product/:id/:reviewId - Update an existing review
router.put('/product/:id/:reviewId',
  authenticateToken,
  asyncHandler(ReviewController.updateReview)
);

// DELETE /api/reviews/product/:id/:reviewId - Delete a review
router.delete('/product/:id/:reviewId',
  authenticateToken,
  asyncHandler(ReviewController.deleteReview)
);

// POST /api/reviews/product/:id/:reviewId/helpful - Mark review as helpful/unhelpful
router.post('/product/:id/:reviewId/helpful',
  authenticateToken,
  asyncHandler(ReviewController.markHelpful)
);

export default router;
