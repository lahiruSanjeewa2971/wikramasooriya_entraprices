import { query } from '../db/simple-connection.js';

export const simpleProductService = {
  // Get all products with optional filtering
  async getAllProducts(options = {}) {
    const {
      page = 1,
      limit = 12,
      category,
      featured,
      new_arrival,
      search,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND c.name ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (featured === 'true') {
      whereClause += ` AND p.featured = true`;
    }

    if (new_arrival === 'true') {
      whereClause += ` AND p.new_arrival = true`;
    }

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (minPrice) {
      whereClause += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get products with pagination
    const offset = (page - 1) * limit;
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const productsResult = await query(productsQuery, params);

    const totalPages = Math.ceil(total / limit);

    return {
      products: productsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    };
  },

  // Get product by ID
  async getProductById(id) {
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);

    return result.rows[0] || null;
  },

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = true AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  },

  // Get new arrival products
  async getNewArrivals(limit = 8) {
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.new_arrival = true AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  },

  // Get all categories
  async getAllCategories() {
    const result = await query(`
      SELECT id, name, description, image_url
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `);

    return result.rows;
  }
};
