import { AppError } from '../middleware/errorHandler.js';
import { Cart, CartItem, Product } from '../models/index.js';

export class CartController {
  static async getCart(req, res) {
    const userId = req.user.id;

    // Get or create cart
    let cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'image_url', 'price', 'stock_qty']
            }
          ]
        }
      ]
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        status: 'active'
      });
    }

    res.json({
      success: true,
      data: {
        cart
      }
    });
  }

  static async addItem(req, res) {
    const userId = req.user.id;
    const { productId, qty } = req.body;

    // Get or create cart
    let cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        status: 'active'
      });
    }

    // Check if product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product || !product.is_active) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock_qty < qty) {
      throw new AppError(
        `Only ${product.stock_qty} left in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId }
    });

    if (cartItem) {
      // Update quantity
      const newQty = cartItem.qty + qty;
      if (product.stock_qty < newQty) {
        throw new AppError(
          `Only ${product.stock_qty} left in stock`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      await cartItem.update({ qty: newQty });
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        qty,
        price_at_add: product.price
      });
    }

    // Refresh cart data
    await cart.reload({
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'image_url', 'price', 'stock_qty']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart
      }
    });
  }

  static async updateItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { qty } = req.body;

    // Get cart item
    const cartItem = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: userId, status: 'active' }
        },
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Check stock availability
    if (cartItem.product.stock_qty < qty) {
      throw new AppError(
        `Only ${cartItem.product.stock_qty} left in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Update quantity
    await cartItem.update({ qty });

    // Refresh cart data
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'image_url', 'price', 'stock_qty']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart
      }
    });
  }

  static async removeItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    // Get cart item
    const cartItem = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: userId, status: 'active' }
        }
      ]
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Remove item
    await cartItem.destroy();

    // Refresh cart data
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'image_url', 'price', 'stock_qty']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart
      }
    });
  }

  static async clearCart(req, res) {
    const userId = req.user.id;

    // Get cart
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (cart) {
      // Remove all cart items
      await CartItem.destroy({
        where: { cart_id: cart.id }
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: cart || { items: [], total_amount: 0, item_count: 0 }
      }
    });
  }
}
