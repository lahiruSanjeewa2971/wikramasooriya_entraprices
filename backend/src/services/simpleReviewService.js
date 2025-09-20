import { query } from '../db/simple-connection.js';

export const simpleReviewService = {
  // Create a new product review
  async createReview(productId, userId, reviewData) {
    const { rating, title, comment } = reviewData;

    // Validate review data
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (!title || title.length < 5) {
      throw new Error('Title must be at least 5 characters long');
    }
    if (!comment || comment.length < 10) {
      throw new Error('Comment must be at least 10 characters long');
    }

    // Check if user already reviewed this product
    const existingReview = await query(`
      SELECT id FROM product_reviews 
      WHERE product_id = $1 AND user_id = $2
    `, [productId, userId]);

    if (existingReview.rows.length > 0) {
      throw new Error('You have already reviewed this product');
    }

    // Verify product exists and is active
    const productCheck = await query(`
      SELECT id FROM products 
      WHERE id = $1 AND is_active = true
    `, [productId]);

    if (productCheck.rows.length === 0) {
      throw new Error('Product not found');
    }

    // Create review
    const result = await query(`
      INSERT INTO product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `, [productId, userId, rating, title, comment]);

    return result.rows[0];
  },

  // Update an existing review
  async updateReview(reviewId, userId, reviewData) {
    const { rating, title, comment } = reviewData;

    // Validate review data
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (title && title.length < 5) {
      throw new Error('Title must be at least 5 characters long');
    }
    if (comment && comment.length < 10) {
      throw new Error('Comment must be at least 10 characters long');
    }

    // Check if review exists and user owns it
    const existingReview = await query(`
      SELECT id, product_id FROM product_reviews 
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);

    if (existingReview.rows.length === 0) {
      throw new Error('Review not found or you do not have permission to update it');
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${paramCount++}`);
      values.push(rating);
    }
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (comment !== undefined) {
      updates.push(`comment = $${paramCount++}`);
      values.push(comment);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add review ID and user ID to values
    values.push(reviewId, userId);

    const result = await query(`
      UPDATE product_reviews 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING *
    `, values);

    return result.rows[0];
  },

  // Delete a review
  async deleteReview(reviewId, userId) {
    // Check if review exists and user owns it
    const existingReview = await query(`
      SELECT id, product_id FROM product_reviews 
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);

    if (existingReview.rows.length === 0) {
      throw new Error('Review not found or you do not have permission to delete it');
    }

    // Delete review
    const result = await query(`
      DELETE FROM product_reviews 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [reviewId, userId]);

    return result.rows[0];
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

  // Mark review as helpful/unhelpful
  async markReviewHelpful(reviewId, userId, isHelpful) {
    // Check if review exists
    const reviewCheck = await query(`
      SELECT id FROM product_reviews 
      WHERE id = $1 AND is_approved = true
    `, [reviewId]);

    if (reviewCheck.rows.length === 0) {
      throw new Error('Review not found');
    }

    // Check if user already voted on this review
    const existingVote = await query(`
      SELECT id, is_helpful FROM review_helpfulness 
      WHERE review_id = $1 AND user_id = $2
    `, [reviewId, userId]);

    if (existingVote.rows.length > 0) {
      // Update existing vote
      const vote = existingVote.rows[0];
      if (vote.is_helpful === isHelpful) {
        // User is removing their vote
        await query(`
          DELETE FROM review_helpfulness 
          WHERE review_id = $1 AND user_id = $2
        `, [reviewId, userId]);

        // Update helpful count
        await query(`
          UPDATE product_reviews 
          SET helpful_count = helpful_count - 1
          WHERE id = $1
        `, [reviewId]);
      } else {
        // User is changing their vote
        await query(`
          UPDATE review_helpfulness 
          SET is_helpful = $1
          WHERE review_id = $2 AND user_id = $3
        `, [isHelpful, reviewId, userId]);

        // Update helpful count (no change needed as it's just a flip)
      }
    } else {
      // Create new vote
      await query(`
        INSERT INTO review_helpfulness (review_id, user_id, is_helpful)
        VALUES ($1, $2, $3)
      `, [reviewId, userId, isHelpful]);

      // Update helpful count
      if (isHelpful) {
        await query(`
          UPDATE product_reviews 
          SET helpful_count = helpful_count + 1
          WHERE id = $1
        `, [reviewId]);
      }
    }

    // Get updated helpful count
    const updatedReview = await query(`
      SELECT helpful_count FROM product_reviews 
      WHERE id = $1
    `, [reviewId]);

    return {
      reviewId,
      userId,
      isHelpful,
      helpfulCount: updatedReview.rows[0].helpful_count
    };
  },

  // Get user's review for a specific product
  async getUserReviewForProduct(productId, userId) {
    const result = await query(`
      SELECT pr.*, u.name as user_name, u.email as user_email
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = $1 AND pr.user_id = $2
    `, [productId, userId]);

    return result.rows[0] || null;
  },

  // Get review by ID with user info
  async getReviewById(reviewId) {
    const result = await query(`
      SELECT 
        pr.*,
        u.name as user_name,
        u.email as user_email,
        p.name as product_name
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      JOIN products p ON pr.product_id = p.id
      WHERE pr.id = $1
    `, [reviewId]);

    return result.rows[0] || null;
  }
};
