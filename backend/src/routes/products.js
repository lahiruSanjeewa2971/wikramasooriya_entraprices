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

// GET /api/products/:id - Get product details
router.get('/:id',
  optionalAuth,
  asyncHandler(ProductController.getProduct)
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

export default router;
