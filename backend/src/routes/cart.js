import express from 'express';
import { validateRequest, cartSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { CartController } from '../controllers/cartController.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user cart
router.get('/',
  asyncHandler(CartController.getCart)
);

// POST /api/cart/add - Add item to cart
router.post('/add',
  validateRequest(cartSchemas.addItem),
  asyncHandler(CartController.addItem)
);

// PUT /api/cart/item/:id - Update cart item quantity
router.put('/item/:id',
  validateRequest(cartSchemas.updateItem),
  asyncHandler(CartController.updateItem)
);

// DELETE /api/cart/item/:id - Remove item from cart
router.delete('/item/:id',
  asyncHandler(CartController.removeItem)
);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear',
  asyncHandler(CartController.clearCart)
);

export default router;
