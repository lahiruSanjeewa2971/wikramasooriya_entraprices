import { getClient, query } from '../db/simple-connection.js';
import { logger } from '../utils/logger.js';

export class simpleAdminService {
  // Product Management
  static async getAllProductsForAdmin(options = {}) {
    const { page = 1, limit = 50, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    try {
      let whereClause = 'WHERE p.is_active = true';
      const params = [];
      let paramCount = 0;

      if (category) {
        paramCount++;
        whereClause += ` AND c.name = $${paramCount}`;
        params.push(category);
      }

      if (search) {
        paramCount++;
        whereClause += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      const productsQuery = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.${sortBy} ${sortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      params.push(limit, offset);
      
      const productsResult = await query(productsQuery, params);
      const products = productsResult.rows;

      const totalPages = Math.ceil(total / limit);
      const pagination = {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      return { products, pagination, total };
    } catch (error) {
      logger.error('Error in getAllProductsForAdmin:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async createProduct(productData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const { sku, name, description, price, stock_qty, category_id } = productData;

      const insertQuery = `
        INSERT INTO products (sku, name, description, price, stock_qty, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [sku, name, description, price, stock_qty, category_id];
      const result = await client.query(insertQuery, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error in createProduct:', error);
      throw new Error('Failed to create product');
    } finally {
      client.release();
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

  static async updateProduct(id, updateData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updateData[field])];

      const updateQuery = `
        UPDATE products 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error in updateProduct:', error);
      throw new Error('Failed to update product');
    } finally {
      client.release();
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
        WHERE c.is_active = true
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
      const { name, description } = categoryData;
      
      const result = await query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING *
      `, [name, description]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error in createCategory:', error);
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
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteCategory:', error);
      throw new Error('Failed to delete category');
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
      const result = await query('SELECT COUNT(*) as count FROM products WHERE category_id = $1 AND is_active = true', [categoryId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error in getProductsCountByCategory:', error);
      throw new Error('Failed to get products count');
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
  static async getDashboardOverview() {
    try {
      const result = await query(`
        SELECT 
          (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
          (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
          (SELECT COUNT(*) FROM contacts WHERE status = 'unread') as unread_messages,
          (SELECT COUNT(*) FROM carts WHERE status = 'active') as active_carts,
          (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories
      `);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error in getDashboardOverview:', error);
      throw new Error('Failed to fetch dashboard overview');
    }
  }

  static async getProductAnalytics(period = '30d') {
    try {
      let dateFilter = '';
      if (period === '7d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (period === '30d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
      } else if (period === '90d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '90 days'";
      }

      const result = await query(`
        SELECT 
          c.name as category_name,
          COUNT(p.id) as product_count,
          AVG(p.price) as avg_price,
          SUM(p.stock_qty) as total_stock
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true ${dateFilter}
        WHERE c.is_active = true
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error in getProductAnalytics:', error);
      throw new Error('Failed to fetch product analytics');
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

  static async getUserAnalytics(period = '30d') {
    try {
      let dateFilter = '';
      if (period === '7d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (period === '30d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
      } else if (period === '90d') {
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '90 days'";
      }

      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          role
        FROM users
        WHERE is_active = true ${dateFilter}
        GROUP BY DATE(created_at), role
        ORDER BY date DESC, role
        LIMIT 90
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error in getUserAnalytics:', error);
      throw new Error('Failed to fetch user analytics');
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
