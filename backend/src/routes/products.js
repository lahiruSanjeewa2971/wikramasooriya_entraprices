import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ProductController } from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - List products with filters
router.get('/',
  optionalAuth,
  asyncHandler(ProductController.listProducts)
);

// GET /api/products/categories - Get all categories
router.get('/categories',
  asyncHandler(ProductController.getCategories)
);

// GET /api/products/featured - Get featured products
router.get('/featured',
  optionalAuth,
  asyncHandler(ProductController.getFeaturedProducts)
);

// GET /api/products/new - Get new arrival products
router.get('/new',
  optionalAuth,
  asyncHandler(ProductController.getNewArrivals)
);

// GET /api/products/:id/details - Get comprehensive product details with reviews and related products
router.get('/:id/details',
  optionalAuth,
  asyncHandler(ProductController.getProductDetails)
);

// GET /api/products/:id/reviews - Get product reviews with pagination and sorting
router.get('/:id/reviews',
  optionalAuth,
  asyncHandler(ProductController.getProductReviews)
);

// GET /api/products/:id/related - Get related products
router.get('/:id/related',
  optionalAuth,
  asyncHandler(ProductController.getRelatedProducts)
);

// GET /api/products/:id - Get basic product details (must be last)
router.get('/:id',
  optionalAuth,
  asyncHandler(ProductController.getProduct)
);

export default router;
