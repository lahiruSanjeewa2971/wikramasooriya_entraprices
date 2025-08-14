import { query, getClient } from '../db/simple-connection.js';

export const simpleCartService = {
  // Get user's cart with items
  async getUserCart(userId) {
    // Get cart
    const cartResult = await query(`
      SELECT * FROM carts 
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    if (cartResult.rows.length === 0) {
      return null;
    }

    const cart = cartResult.rows[0];

    // Get cart items with product details
    const itemsResult = await query(`
      SELECT 
        ci.*,
        p.id as product_id,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image,
        p.price as product_price,
        p.stock_qty as product_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 AND p.is_active = true
    `, [cart.id]);

    cart.items = itemsResult.rows;
    cart.item_count = itemsResult.rows.length;

    // Calculate total
    const total = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    cart.total_amount = total;

    return cart;
  },

  // Add item to cart
  async addItemToCart(userId, productId, qty) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get or create cart
      let cartResult = await client.query(`
        SELECT * FROM carts 
        WHERE user_id = $1 AND status = 'active'
      `, [userId]);

      let cart;
      if (cartResult.rows.length === 0) {
        const newCartResult = await client.query(`
          INSERT INTO carts (user_id, status, created_at, updated_at)
          VALUES ($1, 'active', $2, $2)
          RETURNING *
        `, [userId, new Date().toISOString()]);
        cart = newCartResult.rows[0];
      } else {
        cart = cartResult.rows[0];
      }

      // Check if product exists and has stock
      const productResult = await client.query(`
        SELECT * FROM products WHERE id = $1 AND is_active = true
      `, [productId]);

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = productResult.rows[0];
      if (product.stock_qty < qty) {
        throw new Error(`Only ${product.stock_qty} left in stock`);
      }

      // Check if item already exists in cart
      const existingItemResult = await client.query(`
        SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2
      `, [cart.id, productId]);

      if (existingItemResult.rows.length > 0) {
        // Update quantity
        const existingItem = existingItemResult.rows[0];
        const newQty = existingItem.qty + qty;
        
        if (product.stock_qty < newQty) {
          throw new Error(`Only ${product.stock_qty} left in stock`);
        }

        const subtotal = newQty * parseFloat(product.price);
        
        await client.query(`
          UPDATE cart_items 
          SET qty = $1, subtotal = $2, updated_at = $3
          WHERE id = $4
        `, [newQty, subtotal, new Date().toISOString(), existingItem.id]);
      } else {
        // Create new cart item
        const subtotal = qty * parseFloat(product.price);
        
        await client.query(`
          INSERT INTO cart_items (cart_id, product_id, qty, price_at_add, subtotal, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $6)
        `, [cart.id, productId, qty, product.price, subtotal, new Date().toISOString()]);
      }

      // Update cart totals
      const totalResult = await client.query(`
        SELECT SUM(subtotal) as total, COUNT(*) as item_count
        FROM cart_items WHERE cart_id = $1
      `, [cart.id]);

      const { total, item_count } = totalResult.rows[0];
      
      await client.query(`
        UPDATE carts 
        SET total_amount = $1, item_count = $2, updated_at = $3
        WHERE id = $4
      `, [total || 0, item_count || 0, new Date().toISOString(), cart.id]);

      await client.query('COMMIT');

      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Remove item from cart
  async removeItemFromCart(userId, itemId) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get cart item
      const itemResult = await client.query(`
        SELECT ci.*, c.user_id 
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = $1 AND c.user_id = $2
      `, [itemId, userId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      // Remove item
      await client.query(`
        DELETE FROM cart_items WHERE id = $1
      `, [itemId]);

      // Update cart totals
      const totalResult = await client.query(`
        SELECT SUM(subtotal) as total, COUNT(*) as item_count
        FROM cart_items WHERE cart_id = $1
      `, [itemResult.rows[0].cart_id]);

      const { total, item_count } = totalResult.rows[0];
      
      await client.query(`
        UPDATE carts 
        SET total_amount = $1, item_count = $2, updated_at = $3
        WHERE id = $4
      `, [total || 0, item_count || 0, new Date().toISOString(), itemResult.rows[0].cart_id]);

      await client.query('COMMIT');

      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Clear cart
  async clearCart(userId) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get cart
      const cartResult = await client.query(`
        SELECT id FROM carts WHERE user_id = $1 AND status = 'active'
      `, [userId]);

      if (cartResult.rows.length === 0) {
        return null;
      }

      const cartId = cartResult.rows[0].id;

      // Remove all items
      await client.query(`
        DELETE FROM cart_items WHERE cart_id = $1
      `, [cartId]);

      // Reset cart totals
      await client.query(`
        UPDATE carts 
        SET total_amount = 0, item_count = 0, updated_at = $1
        WHERE id = $2
      `, [new Date().toISOString(), cartId]);

      await client.query('COMMIT');

      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
