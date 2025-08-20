import { getClient, query } from '../db/simple-connection.js';
import { logger, logDatabaseError } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { simpleProductService } from './simpleProductService.js';

export class simpleAdminService {
  /**
   * Get dashboard overview
   */
  static async getDashboardOverview() {
    try {
      const totalProducts = await this.getTotalProducts();
      const totalUsers = await this.getTotalUsers();
      const totalOrders = await this.getTotalOrders();
      const totalRevenue = await this.getTotalRevenue();
      const unreadMessages = await this.getUnreadMessages();
      const totalCategories = await this.getTotalCategories();
      const recentUsers = await this.getRecentUsers();
      const topProducts = await this.getTopProducts();
      const recentActivity = await this.getRecentActivity();

      return {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        unreadMessages,
        totalCategories,
        recentUsers,
        topProducts,
        recentActivity
      };
    } catch (error) {
      logDatabaseError('getDashboardOverview', error);
      throw error;
    }
  }

  /**
   * Get product analytics
   */
  static async getProductAnalytics() {
    try {
      const categoryAnalytics = await this.getCategoryAnalytics();
      const topProducts = await this.getTopProducts();
      const period = 'last_30_days';

      return {
        categoryAnalytics,
        topProducts,
        period
      };
    } catch (error) {
      logDatabaseError('getProductAnalytics', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  static async getUserAnalytics() {
    try {
      const userGrowth = await this.getUserGrowth();
      const userRoleDistribution = await this.getUserRoleDistribution();

      return {
        userGrowth,
        userRoleDistribution
      };
    } catch (error) {
      logDatabaseError('getUserAnalytics', error);
      throw error;
    }
  }

  /**
   * Get all products for admin view
   */
  static async getAllProductsForAdmin(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', category = '', sortBy = 'created_at', sortOrder = 'DESC' } = options;
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereClause += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      if (category) {
        paramCount++;
        whereClause += ` AND c.name ILIKE $${paramCount}`;
        queryParams.push(`%${category}%`);
      }

      const sqlQuery = `
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(p.stock_qty, 0) as stock_qty
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.${sortBy} ${sortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(limit, offset);
      const result = await query(sqlQuery, queryParams);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
      `;
      
      const countResult = await query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      return {
        products: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        total
      };
    } catch (error) {
      logDatabaseError('getAllProductsForAdmin', error, { options });
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(productData) {
    try {
      // Clean and validate data
      const {
        name, sku, description, short_description, image_url,
        price, stock_qty, category_id, featured, new_arrival,
        weight, dimensions, is_active
      } = productData;

      // Clean short description (remove HTML tags)
      const cleanShortDescription = short_description ? short_description.replace(/<[^>]*>/g, '') : null;
      
      // Clean image URL (remove HTML tags)
      const cleanImageUrl = image_url ? image_url.replace(/<[^>]*>/g, '') : null;
      
      // Clean and validate price
      const cleanPrice = parseFloat(price);
      if (isNaN(cleanPrice) || cleanPrice < 0) {
        throw new AppError('Invalid price value', 400, 'INVALID_PRICE');
      }
      
      // Clean and validate stock quantity
      const cleanStockQty = parseInt(stock_qty);
      if (isNaN(cleanStockQty) || cleanStockQty < 0) {
        throw new AppError('Invalid stock quantity', 400, 'INVALID_STOCK_QTY');
      }
      
      // Clean and validate category ID
      const cleanCategoryId = category_id ? parseInt(category_id) : null;
      if (category_id && (isNaN(cleanCategoryId) || cleanCategoryId <= 0)) {
        throw new AppError('Invalid category ID', 400, 'INVALID_CATEGORY_ID');
      }
      
      // Clean and validate weight
      const cleanWeight = weight ? parseFloat(weight) : null;
      if (weight && (isNaN(cleanWeight) || cleanWeight < 0)) {
        throw new AppError('Invalid weight value', 400, 'INVALID_WEIGHT');
      }
      
      // Clean dimensions (allow any value)
      const cleanDimensions = dimensions;

      // Check if SKU already exists
      const existingProduct = await simpleProductService.getProductBySku(sku);
      if (existingProduct) {
        throw new AppError('Product with this SKU already exists', 409, 'DUPLICATE_SKU');
      }

      const insertQuery = `
        INSERT INTO products (
          sku, name, description, short_description, image_url,
          price, stock_qty, category_id, featured, new_arrival,
          weight, dimensions, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        sku, name, description, cleanShortDescription, cleanImageUrl,
        cleanPrice, cleanStockQty, cleanCategoryId, featured, new_arrival,
        cleanWeight, cleanDimensions, is_active
      ];

      const result = await query(insertQuery, values);
      
      if (result.rows.length === 0) {
        throw new AppError('Failed to create product', 500, 'PRODUCT_CREATION_FAILED');
      }

      return result.rows[0];
    } catch (error) {
      logDatabaseError('createProduct', error, { productData });
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId, productData) {
    try {
      // Clean and validate data
      const {
        name, sku, description, short_description, image_url,
        price, stock_qty, category_id, featured, new_arrival,
        weight, dimensions, is_active
      } = productData;

      // Clean short description (remove HTML tags)
      const cleanShortDescription = short_description ? short_description.replace(/<[^>]*>/g, '') : null;
      
      // Clean image URL (remove HTML tags)
      const cleanImageUrl = image_url ? image_url.replace(/<[^>]*>/g, '') : null;
      
      // Clean and validate price
      const cleanPrice = parseFloat(price);
      if (isNaN(cleanPrice) || cleanPrice < 0) {
        throw new AppError('Invalid price value', 400, 'INVALID_PRICE');
      }
      
      // Clean and validate stock quantity
      const cleanStockQty = parseInt(stock_qty);
      if (isNaN(cleanStockQty) || cleanStockQty < 0) {
        throw new AppError('Invalid stock quantity', 400, 'INVALID_STOCK_QTY');
      }
      
      // Clean and validate category ID
      const cleanCategoryId = category_id ? parseInt(category_id) : null;
      if (category_id && (isNaN(cleanCategoryId) || cleanCategoryId <= 0)) {
        throw new AppError('Invalid category ID', 400, 'INVALID_CATEGORY_ID');
      }
      
      // Clean and validate weight
      const cleanWeight = weight ? parseFloat(weight) : null;
      if (weight && (isNaN(cleanWeight) || cleanWeight < 0)) {
        throw new AppError('Invalid weight value', 400, 'INVALID_WEIGHT');
      }
      
      // Clean dimensions (allow any value)
      const cleanDimensions = dimensions;

      // Check if SKU already exists for other products
      if (sku) {
        const existingProduct = await simpleProductService.getProductBySku(sku);
        if (existingProduct && existingProduct.id !== parseInt(productId)) {
          throw new AppError('Product with this SKU already exists', 409, 'DUPLICATE_SKU');
        }
      }

      const updateQuery = `
        UPDATE products 
        SET 
          name = COALESCE($1, name),
          sku = COALESCE($2, sku),
          description = COALESCE($3, description),
          short_description = COALESCE($4, short_description),
          image_url = COALESCE($5, image_url),
          price = COALESCE($6, price),
          stock_qty = COALESCE($7, stock_qty),
          category_id = COALESCE($8, category_id),
          featured = COALESCE($9, featured),
          new_arrival = COALESCE($10, new_arrival),
          weight = COALESCE($11, weight),
          dimensions = COALESCE($12, dimensions),
          is_active = COALESCE($13, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *
      `;

      const values = [
        name, sku, description, cleanShortDescription, cleanImageUrl,
        cleanPrice, cleanStockQty, cleanCategoryId, featured, new_arrival,
        cleanWeight, cleanDimensions, is_active, productId
      ];

      const result = await query(updateQuery, values);
      
      if (result.rows.length === 0) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      return result.rows[0];
    } catch (error) {
      logDatabaseError('updateProduct', error, { productId, productData });
      throw error;
    }
  }

  static async getProductForAdmin(id) {
    try {
      const result = await query(`
        SELECT 
          p.*,
          c.name as category_name,
          c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getProductForAdmin:', error);
      throw new Error('Failed to fetch product');
    }
  }

  static async deleteProduct(id) {
    try {
      const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteProduct:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Category Management
  static async getAllCategoriesForAdmin() {
    try {
      const result = await query(`
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        GROUP BY c.id
        ORDER BY c.name
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error in getAllCategoriesForAdmin:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  static async createCategory(categoryData) {
    try {
      const { name, description, is_active = true } = categoryData;
      
      const insertQuery = `
        INSERT INTO categories (name, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const result = await query(insertQuery, [name, description, is_active]);
      
      return result.rows[0];
    } catch (error) {
      logDatabaseError('createCategory', error, 
        'INSERT INTO categories (name, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [name, description, is_active]
      );
      throw new Error('Failed to create category');
    }
  }

  static async updateCategory(id, updateData) {
    try {
      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updateData[field])];

      const result = await query(`
        UPDATE categories 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error in updateCategory:', error);
      throw new Error('Failed to update category');
    }
  }

  static async deleteCategory(id) {
    try {
      // First check if category has any products (active or inactive)
      const productsCount = await this.getProductsCountByCategory(id);
      
      if (productsCount > 0) {
        throw new Error(`Cannot delete category. It has ${productsCount} product(s) associated with it. Please reassign or delete the products first.`);
      }
      
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteCategory:', error);
      throw new Error(error.message || 'Failed to delete category');
    }
  }

  static async getCategoryByName(name) {
    try {
      const result = await query('SELECT * FROM categories WHERE name = $1', [name]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getCategoryByName:', error);
      throw new Error('Failed to fetch category');
    }
  }

  static async getProductsCountByCategory(categoryId) {
    try {
      // Count ALL products in the category (active and inactive)
      const result = await query('SELECT COUNT(*) as count FROM products WHERE category_id = $1', [categoryId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error in getProductsCountByCategory:', error);
      throw new Error('Failed to get products count');
    }
  }

  static async getProductsByCategory(categoryId) {
    try {
      // Get detailed information about products in the category (active and inactive)
      const result = await query(`
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.is_active,
          p.created_at
        FROM products p
        WHERE p.category_id = $1
        ORDER BY p.name
      `, [categoryId]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error in getProductsByCategory:', error);
      throw new Error('Failed to get products by category');
    }
  }

  // User Management
  static async getAllUsersForAdmin(options = {}) {
    const { page = 1, limit = 50, search, role } = options;
    const offset = (page - 1) * limit;
    
    try {
      let whereClause = 'WHERE u.is_active = true';
      const params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        whereClause += ` AND u.role = $${paramCount}`;
        params.push(role);
      }

      if (search) {
        paramCount++;
        whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      const usersQuery = `
        SELECT u.*, COUNT(c.id) as cart_count
        FROM users u
        LEFT JOIN carts c ON u.id = c.user_id
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      params.push(limit, offset);
      
      const usersResult = await query(usersQuery, params);
      const users = usersResult.rows;

      const totalPages = Math.ceil(total / limit);
      const pagination = {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      return { users, pagination, total };
    } catch (error) {
      logger.error('Error in getAllUsersForAdmin:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async updateUser(id, updateData) {
    try {
      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updateData[field])];

      const result = await query(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error in updateUser:', error);
      throw new Error('Failed to update user');
    }
  }

  static async getUserForAdmin(id) {
    try {
      const result = await query(`
        SELECT 
          u.*,
          COUNT(c.id) as cart_count,
          COUNT(ci.id) as cart_items_count
        FROM users u
        LEFT JOIN carts c ON u.id = c.user_id
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        WHERE u.id = $1
        GROUP BY u.id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getUserForAdmin:', error);
      throw new Error('Failed to fetch user');
    }
  }

  static async deleteUser(id) {
    try {
      const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteUser:', error);
      throw new Error('Failed to delete user');
    }
  }

  static async checkUserActiveData(userId) {
    try {
      const result = await query(`
        SELECT 
          (SELECT COUNT(*) FROM carts WHERE user_id = $1 AND status = 'active') as active_carts,
          (SELECT COUNT(*) FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = $1 AND c.status = 'active') as cart_items
      `, [userId]);
      
      const { active_carts, cart_items } = result.rows[0];
      return parseInt(active_carts) > 0 || parseInt(cart_items) > 0;
    } catch (error) {
      logger.error('Error in checkUserActiveData:', error);
      throw new Error('Failed to check user active data');
    }
  }

  // Contact Messages Management
  static async getAllContactsForAdmin(options = {}) {
    const { page = 1, limit = 50, status, search } = options;
    const offset = (page - 1) * limit;
    
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        whereClause += ` AND c.status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        whereClause += ` AND (c.email ILIKE $${paramCount} OR c.title ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM contacts c ${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      const contactsQuery = `
        SELECT * FROM contacts c
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      params.push(limit, offset);
      
      const contactsResult = await query(contactsQuery, params);
      const contacts = contactsResult.rows;

      const totalPages = Math.ceil(total / limit);
      const pagination = {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      return { contacts, pagination, total };
    } catch (error) {
      logger.error('Error in getAllContactsForAdmin:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  static async updateContact(id, updateData) {
    try {
      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updateData[field])];

      const result = await query(`
        UPDATE contacts 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error in updateContact:', error);
      throw new Error('Failed to update contact');
    }
  }

  static async replyToContact(id, replyMessage, adminNotes) {
    try {
      const result = await query(`
        UPDATE contacts 
        SET 
          status = 'replied',
          admin_notes = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id, adminNotes]);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error in replyToContact:', error);
      throw new Error('Failed to reply to contact');
    }
  }

  static async getContactForAdmin(id) {
    try {
      const result = await query('SELECT * FROM contacts WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getContactForAdmin:', error);
      throw new Error('Failed to fetch contact');
    }
  }

  static async deleteContact(id) {
    try {
      const result = await query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteContact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  // Analytics & Dashboard
  static async getTotalProducts() {
    try {
      const result = await query('SELECT COUNT(*) as total FROM products WHERE is_active = true');
      return parseInt(result.rows[0].total);
    } catch (error) {
      logDatabaseError('getTotalProducts', error);
      throw error;
    }
  }

  static async getTotalUsers() {
    try {
      const result = await query('SELECT COUNT(*) as total FROM users WHERE is_active = true');
      return parseInt(result.rows[0].total);
    } catch (error) {
      logDatabaseError('getTotalUsers', error);
      throw error;
    }
  }

  static async getTotalOrders() {
    try {
      const result = await query('SELECT COUNT(*) as total FROM carts WHERE status = \'active\'');
      return parseInt(result.rows[0].total);
    } catch (error) {
      logDatabaseError('getTotalOrders', error);
      throw error;
    }
  }

  static async getTotalRevenue() {
    try {
      const result = await query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM carts WHERE status = \'active\'');
      return parseFloat(result.rows[0].total_revenue);
    } catch (error) {
      logDatabaseError('getTotalRevenue', error);
      throw error;
    }
  }

  static async getUnreadMessages() {
    try {
      const result = await query('SELECT COUNT(*) as total FROM contacts WHERE status = \'unread\'');
      return parseInt(result.rows[0].total);
    } catch (error) {
      logDatabaseError('getUnreadMessages', error);
      throw error;
    }
  }

  static async getTotalCategories() {
    try {
      const result = await query('SELECT COUNT(*) as total FROM categories WHERE is_active = true');
      return parseInt(result.rows[0].total);
    } catch (error) {
      logDatabaseError('getTotalCategories', error);
      throw error;
    }
  }

  static async getRecentUsers() {
    try {
      const result = await query(`
        SELECT id, name, email, created_at, role
        FROM users 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      return result.rows;
    } catch (error) {
      logDatabaseError('getRecentUsers', error);
      throw error;
    }
  }

  static async getTopProducts() {
    try {
      const result = await query(`
        SELECT id, name, stock_qty, price, created_at
        FROM products 
        WHERE is_active = true 
        ORDER BY stock_qty DESC 
        LIMIT 5
      `);
      return result.rows;
    } catch (error) {
      logDatabaseError('getTopProducts', error);
      throw error;
    }
  }

  static async getRecentActivity() {
    try {
      const result = await query(`
        SELECT 
          'New user registered' as description,
          created_at as timestamp,
          'user' as type
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        UNION ALL
        SELECT 
          'New product added' as description,
          created_at as timestamp,
          'product' as type
        FROM products 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY timestamp DESC 
        LIMIT 10
      `);
      return result.rows;
    } catch (error) {
      logDatabaseError('getRecentActivity', error);
      throw error;
    }
  }

  static async getCategoryAnalytics() {
    try {
      const result = await query(`
        SELECT 
          c.name as category_name,
          COUNT(p.id) as product_count,
          AVG(p.price) as avg_price,
          SUM(p.stock_qty) as total_stock
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
      `);
      return result.rows;
    } catch (error) {
      logDatabaseError('getCategoryAnalytics', error);
      throw error;
    }
  }

  static async getUserGrowth() {
    try {
      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          role
        FROM users
        WHERE is_active = true
        GROUP BY DATE(created_at), role
        ORDER BY date DESC, role
        LIMIT 90
      `);
      return result.rows;
    } catch (error) {
      logDatabaseError('getUserGrowth', error);
      throw error;
    }
  }

  static async getUserRoleDistribution() {
    try {
      const result = await query(`
        SELECT 
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
        FROM users
        WHERE is_active = true
      `);
      return result.rows[0];
    } catch (error) {
      logDatabaseError('getUserRoleDistribution', error);
      throw error;
    }
  }

  static async getSalesAnalytics(period = '30d') {
    try {
      let dateFilter = '';
      if (period === '7d') {
        dateFilter = "AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (period === '30d') {
        dateFilter = "AND c.created_at >= CURRENT_DATE - INTERVAL '30 days'";
      } else if (period === '90d') {
        dateFilter = "AND c.created_at >= CURRENT_DATE - INTERVAL '90 days'";
      }

      const result = await query(`
        SELECT 
          DATE(c.created_at) as date,
          COUNT(DISTINCT c.id) as cart_count,
          SUM(c.total_amount) as total_amount,
          AVG(c.total_amount) as avg_cart_value
        FROM carts c
        WHERE c.status = 'active' ${dateFilter}
        GROUP BY DATE(c.created_at)
        ORDER BY date DESC
        LIMIT 30
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error in getSalesAnalytics:', error);
      throw new Error('Failed to fetch sales analytics');
    }
  }

  // Excel Upload Processing
  static async processExcelData(data) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const results = {
        processed: 0,
        updated: 0,
        created: 0,
        errors: [],
        total: data.length
      };

      for (const row of data) {
        try {
          if (!row.sku || !row.name || !row.price || !row.stock_qty) {
            results.errors.push({
              row: row,
              error: 'Missing required fields (SKU, name, price, stock_qty)'
            });
            continue;
          }

          const { sku, name, price, stock_qty, category_name } = row;

          // Check if product exists by SKU
          const existingProduct = await client.query('SELECT id, category_id FROM products WHERE sku = $1', [sku]);
          
          if (existingProduct.rows.length > 0) {
            // Update existing product
            const product = existingProduct.rows[0];
            
            // Get category ID if category_name is provided
            let categoryId = product.category_id;
            if (category_name) {
              const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category_name]);
              if (categoryResult.rows.length > 0) {
                categoryId = categoryResult.rows[0].id;
              }
            }

            // Check if category matches
            if (category_name && categoryId !== product.category_id) {
              results.errors.push({
                sku,
                error: 'Category mismatch with existing product'
              });
              continue;
            }

            // Update quantity
            await client.query(
              'UPDATE products SET stock_qty = stock_qty + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [stock_qty, product.id]
            );
            results.updated++;
          } else {
            // Create new product
            let categoryId = null;
            if (category_name) {
              const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category_name]);
              if (categoryResult.rows.length > 0) {
                categoryId = categoryResult.rows[0].id;
              } else {
                // Create new category if it doesn't exist
                const newCategoryResult = await client.query(`
                  INSERT INTO categories (name, description) 
                  VALUES ($1, $2) 
                  RETURNING id
                `, [category_name, `Category for ${name}`]);
                categoryId = newCategoryResult.rows[0].id;
              }
            }

            await client.query(`
              INSERT INTO products (sku, name, price, stock_qty, category_id, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [sku, name, price, stock_qty, categoryId]);
            
            results.created++;
          }

          results.processed++;
        } catch (error) {
          results.errors.push({
            row: row,
            error: error.message
          });
        }
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error in processExcelData:', error);
      throw new Error('Failed to process Excel data');
    } finally {
      client.release();
    }
  }
}
