import { AppError } from '../middleware/errorHandler.js';
import { simpleCartService } from '../services/simpleCartService.js';

export class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const cart = await simpleCartService.getUserCart(userId);

      res.json({
        success: true,
        data: {
          cart
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CART_FETCH_ERROR');
    }
  }

  static async getCartCount(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const cart = await simpleCartService.getUserCart(userId);
      const count = cart ? cart.item_count || 0 : 0;

      res.json({
        success: true,
        data: {
          count
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      // Return 0 count if there's an error
      res.json({
        success: true,
        data: {
          count: 0
        }
      });
    }
  }

  static async addItem(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const { productId, qty } = req.body;

      if (!productId || !qty) {
        throw new AppError('Product ID and quantity are required', 400, 'MISSING_FIELDS');
      }

      if (qty <= 0) {
        throw new AppError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
      }

      const cart = await simpleCartService.addItemToCart(userId, productId, qty);

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        data: {
          cart
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      if (error.message.includes('Product not found')) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
      if (error.message.includes('Only')) {
        throw new AppError(error.message, 400, 'INSUFFICIENT_STOCK');
      }
      
      throw new AppError(error.message, 500, 'ADD_ITEM_ERROR');
    }
  }

  static async removeItem(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const { itemId } = req.params;

      if (!itemId) {
        throw new AppError('Item ID is required', 400, 'MISSING_ITEM_ID');
      }

      const cart = await simpleCartService.removeItemFromCart(userId, itemId);

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        data: {
          cart
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      if (error.message.includes('Cart item not found')) {
        throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
      }
      
      throw new AppError(error.message, 500, 'REMOVE_ITEM_ERROR');
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const cart = await simpleCartService.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: {
          cart
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CLEAR_CART_ERROR');
    }
  }

  static async updateItemQuantity(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const { itemId } = req.params;
      const { qty } = req.body;

      if (!itemId || qty === undefined) {
        throw new AppError('Item ID and quantity are required', 400, 'MISSING_FIELDS');
      }

      if (qty <= 0) {
        // If quantity is 0 or negative, remove the item
        const cart = await simpleCartService.removeItemFromCart(userId, itemId);
        
        res.json({
          success: true,
          message: 'Item removed from cart successfully',
          data: {
            cart
          }
        });
      } else {
        // Update quantity by removing and re-adding with new quantity
        const cart = await simpleCartService.removeItemFromCart(userId, itemId);
        
        // Get the product ID from the removed item (we'll need to store this temporarily)
        // For now, we'll require the product ID in the request body
        const { productId } = req.body;
        
        if (!productId) {
          throw new AppError('Product ID is required for quantity update', 400, 'MISSING_PRODUCT_ID');
        }

        const updatedCart = await simpleCartService.addItemToCart(userId, productId, qty);

        res.json({
          success: true,
          message: 'Item quantity updated successfully',
          data: {
            cart: updatedCart
          }
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_QUANTITY_ERROR');
    }
  }
}
