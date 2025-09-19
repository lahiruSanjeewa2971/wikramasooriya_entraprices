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
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(parseInt(category));
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

  // Get product by SKU
  async getProductBySku(sku) {
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.sku = $1
    `, [sku]);

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
  },

  // Get comprehensive product details with reviews and related products
  async getProductDetails(id) {
    // Get product with category info
    const productResult = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);

    if (productResult.rows.length === 0) {
      return null;
    }

    const product = productResult.rows[0];

    // Get average rating and review count
    const reviewStatsResult = await query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as review_count
      FROM product_reviews 
      WHERE product_id = $1 AND is_approved = true
    `, [id]);

    const reviewStats = reviewStatsResult.rows[0];
    product.average_rating = parseFloat(reviewStats.average_rating);
    product.review_count = parseInt(reviewStats.review_count);

    // Get recent reviews (limit 5)
    const recentReviewsResult = await query(`
      SELECT 
        pr.*,
        u.name as user_name,
        u.email as user_email
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = $1 AND pr.is_approved = true
      ORDER BY pr.created_at DESC
      LIMIT 5
    `, [id]);

    product.recent_reviews = recentReviewsResult.rows;

    // Get product images
    const imagesResult = await query(`
      SELECT image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, sort_order ASC
    `, [id]);

    product.images = imagesResult.rows;

    // If no additional images, use the main product image
    if (product.images.length === 0 && product.image_url) {
      product.images = [{
        image_url: product.image_url,
        alt_text: product.name,
        is_primary: true,
        sort_order: 0
      }];
    }

    // Get related products (same category, limit 4)
    const relatedProductsResult = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1 
        AND p.id != $2 
        AND p.is_active = true
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT 4
    `, [product.category_id, id]);

    product.related_products = relatedProductsResult.rows;

    return product;
  },

  // Get product reviews with pagination and sorting
  async getProductReviews(productId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = 'newest'
    } = options;

    let orderClause = 'ORDER BY pr.created_at DESC';
    if (sort === 'oldest') {
      orderClause = 'ORDER BY pr.created_at ASC';
    } else if (sort === 'highest_rating') {
      orderClause = 'ORDER BY pr.rating DESC, pr.created_at DESC';
    } else if (sort === 'lowest_rating') {
      orderClause = 'ORDER BY pr.rating ASC, pr.created_at DESC';
    } else if (sort === 'most_helpful') {
      orderClause = 'ORDER BY pr.helpful_count DESC, pr.created_at DESC';
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM product_reviews pr
      WHERE pr.product_id = $1 AND pr.is_approved = true
    `, [productId]);

    const total = parseInt(countResult.rows[0].total);

    // Get reviews with pagination
    const offset = (page - 1) * limit;
    const reviewsResult = await query(`
      SELECT 
        pr.*,
        u.name as user_name,
        u.email as user_email
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = $1 AND pr.is_approved = true
      ${orderClause}
      LIMIT $2 OFFSET $3
    `, [productId, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviewsResult.rows,
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

  // Get related products for a specific product
  async getRelatedProducts(productId, limit = 4) {
    // First get the product's category
    const productResult = await query(`
      SELECT category_id
      FROM products
      WHERE id = $1 AND is_active = true
    `, [productId]);

    if (productResult.rows.length === 0) {
      return [];
    }

    const categoryId = productResult.rows[0].category_id;

    // Get related products from same category
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1 
        AND p.id != $2 
        AND p.is_active = true
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT $3
    `, [categoryId, productId, limit]);

    return result.rows;
  }
};
