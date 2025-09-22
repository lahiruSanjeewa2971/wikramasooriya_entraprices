import { query } from '../db/simple-connection.js';

export const simpleUserProfileService = {
  // Get user profile information
  async getUserProfile(userId) {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.mobile, u.location, u.avatar_url,
        u.profile_completion_percentage, u.last_activity_at, 
        CASE WHEN u.date_of_birth IS NOT NULL THEN u.date_of_birth::text ELSE NULL END as date_of_birth,
        u.gender, u.bio, u.created_at, u.updated_at,
        up.email_notifications, up.sms_notifications, up.marketing_communications,
        up.review_reminders, up.order_updates, up.profile_visibility,
        up.review_visibility, up.data_sharing, up.theme, up.language
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = $1 AND u.is_active = true
    `, [userId]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  },

  // Update user profile information
  async updateUserProfile(userId, profileData) {
    const { name, mobile, location, date_of_birth, gender, bio } = profileData;

    // Handle date_of_birth properly to avoid timezone issues
    let processedDateOfBirth = date_of_birth;
    if (date_of_birth && typeof date_of_birth === 'string' && date_of_birth.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD format, append time to avoid timezone conversion
      processedDateOfBirth = `${date_of_birth} 12:00:00`;
    }

    const result = await query(`
      UPDATE users 
      SET 
        name = COALESCE($2, name),
        mobile = COALESCE($3, mobile),
        location = COALESCE($4, location),
        date_of_birth = COALESCE($5::date, date_of_birth),
        gender = COALESCE($6, gender),
        bio = COALESCE($7, bio),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name, email, mobile, location, avatar_url,
                profile_completion_percentage, last_activity_at, 
                CASE WHEN date_of_birth IS NOT NULL THEN date_of_birth::text ELSE NULL END as date_of_birth,
                gender, bio, created_at, updated_at
    `, [userId, name, mobile, location, processedDateOfBirth, gender, bio]);

    if (result.rows.length === 0) {
      throw new Error('User not found or update failed');
    }

    // Recalculate profile completion
    await this.calculateProfileCompletion(userId);

    return result.rows[0];
  },

  // Get user's reviews
  async getUserReviews(userId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'newest' } = options;
    const offset = (page - 1) * limit;

    let orderBy = 'pr.created_at DESC';
    switch (sortBy) {
      case 'oldest':
        orderBy = 'pr.created_at ASC';
        break;
      case 'highest_rating':
        orderBy = 'pr.rating DESC';
        break;
      case 'lowest_rating':
        orderBy = 'pr.rating ASC';
        break;
      case 'most_helpful':
        orderBy = 'pr.helpful_count DESC';
        break;
    }

    const result = await query(`
      SELECT 
        pr.id, pr.product_id, pr.rating, pr.title, pr.comment,
        pr.is_verified_purchase, pr.is_approved, pr.helpful_count,
        pr.created_at, pr.updated_at,
        p.name as product_name, p.image_url as product_image,
        c.name as category_name
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pr.user_id = $1 AND pr.is_approved = true
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM product_reviews pr
      WHERE pr.user_id = $1 AND pr.is_approved = true
    `, [userId]);

    return {
      reviews: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  },

  // Update user's review
  async updateUserReview(userId, reviewId, reviewData) {
    const { rating, title, comment } = reviewData;

    // Check if review belongs to user
    const checkResult = await query(`
      SELECT id FROM product_reviews 
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Review not found or access denied');
    }

    const result = await query(`
      UPDATE product_reviews 
      SET 
        rating = $3,
        title = $4,
        comment = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id, product_id, rating, title, comment, is_verified_purchase,
                is_approved, helpful_count, created_at, updated_at
    `, [reviewId, userId, rating, title, comment]);

    return result.rows[0];
  },

  // Delete user's review
  async deleteUserReview(userId, reviewId) {
    // Check if review belongs to user
    const checkResult = await query(`
      SELECT id FROM product_reviews 
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Review not found or access denied');
    }

    await query(`
      DELETE FROM product_reviews 
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);

    return { success: true };
  },

  // Get user's order history (using carts with completed status)
  async getUserOrders(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT 
        c.id, c.status, c.created_at, c.updated_at,
        COUNT(ci.id) as item_count,
        COALESCE(SUM(ci.qty * p.price), 0) as total_amount,
        'Delivery' as delivery_method
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1 AND c.status = 'converted'
      GROUP BY c.id, c.status, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM carts
      WHERE user_id = $1 AND status = 'converted'
    `, [userId]);

    return {
      orders: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  },

  // Get user's order details (using carts with completed status)
  async getUserOrderDetails(userId, orderId) {
    const result = await query(`
      SELECT 
        c.id, c.status, c.created_at, c.updated_at,
        ci.id as item_id, ci.product_id, ci.qty as quantity, p.price,
        p.name as product_name, p.image_url as product_image,
        COALESCE(SUM(ci.qty * p.price), 0) as total_amount
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.id = $1 AND c.user_id = $2 AND c.status = 'converted'
      GROUP BY c.id, c.status, c.created_at, c.updated_at, ci.id, ci.product_id, ci.qty, p.price, p.name, p.image_url
      ORDER BY ci.id
    `, [orderId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Order not found or access denied');
    }

    // Group items
    const order = {
      id: result.rows[0].id,
      status: result.rows[0].status,
      total_amount: result.rows[0].total_amount,
      delivery_method: 'Delivery',
      shipping_address: 'Address not specified',
      billing_address: 'Address not specified',
      payment_method: 'Cash on Delivery',
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      items: result.rows.map(row => ({
        id: row.item_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.price,
        product_name: row.product_name,
        product_image: row.product_image
      })).filter(item => item.id !== null)
    };

    return order;
  },

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    const {
      email_notifications, sms_notifications, marketing_communications,
      review_reminders, order_updates, profile_visibility,
      review_visibility, data_sharing, theme, language
    } = preferences;

    const result = await query(`
      INSERT INTO user_preferences (
        user_id, email_notifications, sms_notifications, marketing_communications,
        review_reminders, order_updates, profile_visibility, review_visibility,
        data_sharing, theme, language, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        email_notifications = EXCLUDED.email_notifications,
        sms_notifications = EXCLUDED.sms_notifications,
        marketing_communications = EXCLUDED.marketing_communications,
        review_reminders = EXCLUDED.review_reminders,
        order_updates = EXCLUDED.order_updates,
        profile_visibility = EXCLUDED.profile_visibility,
        review_visibility = EXCLUDED.review_visibility,
        data_sharing = EXCLUDED.data_sharing,
        theme = EXCLUDED.theme,
        language = EXCLUDED.language,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      userId, email_notifications, sms_notifications, marketing_communications,
      review_reminders, order_updates, profile_visibility, review_visibility,
      data_sharing, theme, language
    ]);

    return result.rows[0];
  },

  // Get user addresses
  async getUserAddresses(userId) {
    const result = await query(`
      SELECT 
        id, address_type, is_default, full_name, address_line_1,
        address_line_2, city, state_province, postal_code, country,
        phone, email, delivery_instructions, created_at, updated_at
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    return result.rows;
  },

  // Add user address
  async addUserAddress(userId, addressData) {
    const {
      address_type, is_default, full_name, address_line_1, address_line_2,
      city, state_province, postal_code, country, phone, email, delivery_instructions
    } = addressData;

    // If this is set as default, unset other defaults
    if (is_default) {
      await query(`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = $1 AND address_type = $2
      `, [userId, address_type]);
    }

    const result = await query(`
      INSERT INTO user_addresses (
        user_id, address_type, is_default, full_name, address_line_1,
        address_line_2, city, state_province, postal_code, country,
        phone, email, delivery_instructions, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      userId, address_type, is_default, full_name, address_line_1,
      address_line_2, city, state_province, postal_code, country,
      phone, email, delivery_instructions
    ]);

    return result.rows[0];
  },

  // Set default address
  async setDefaultAddress(userId, addressId) {
    // Check if address belongs to user
    const checkResult = await query(`
      SELECT id, address_type FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Address not found or access denied');
    }

    const addressType = checkResult.rows[0].address_type;

    // Unset other defaults of the same type
    await query(`
      UPDATE user_addresses 
      SET is_default = false 
      WHERE user_id = $1 AND address_type = $2 AND id != $3
    `, [userId, addressType, addressId]);

    // Set this address as default
    const result = await query(`
      UPDATE user_addresses 
      SET is_default = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [addressId, userId]);

    return result.rows[0];
  },

  // Update user address
  async updateUserAddress(userId, addressId, addressData) {
    const {
      address_type, is_default, full_name, address_line_1, address_line_2,
      city, state_province, postal_code, country, phone, email, delivery_instructions
    } = addressData;

    // Check if address belongs to user
    const checkResult = await query(`
      SELECT id FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Address not found or access denied');
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await query(`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = $1 AND address_type = $2 AND id != $3
      `, [userId, address_type, addressId]);
    }

    const result = await query(`
      UPDATE user_addresses 
      SET 
        address_type = $3,
        is_default = $4,
        full_name = $5,
        address_line_1 = $6,
        address_line_2 = $7,
        city = $8,
        state_province = $9,
        postal_code = $10,
        country = $11,
        phone = $12,
        email = $13,
        delivery_instructions = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [
      addressId, userId, address_type, is_default, full_name, address_line_1,
      address_line_2, city, state_province, postal_code, country,
      phone, email, delivery_instructions
    ]);

    return result.rows[0];
  },

  // Delete user address
  async deleteUserAddress(userId, addressId) {
    // Check if address belongs to user
    const checkResult = await query(`
      SELECT id FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Address not found or access denied');
    }

    await query(`
      DELETE FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    return { success: true };
  },

  // Calculate profile completion percentage
  async calculateProfileCompletion(userId) {
    const result = await query(`
      SELECT 
        CASE WHEN name IS NOT NULL AND LENGTH(name) > 0 THEN 1 ELSE 0 END +
        CASE WHEN email IS NOT NULL AND LENGTH(email) > 0 THEN 1 ELSE 0 END +
        CASE WHEN mobile IS NOT NULL AND LENGTH(mobile) > 0 THEN 1 ELSE 0 END +
        CASE WHEN location IS NOT NULL AND LENGTH(location) > 0 THEN 1 ELSE 0 END +
        CASE WHEN avatar_url IS NOT NULL AND LENGTH(avatar_url) > 0 THEN 1 ELSE 0 END +
        CASE WHEN date_of_birth IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN gender IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 0 THEN 1 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM user_addresses WHERE user_id = $1 AND is_default = true) THEN 1 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM user_preferences WHERE user_id = $1) THEN 1 ELSE 0 END as completion_score
      FROM users WHERE id = $1
    `, [userId]);

    const completionPercentage = Math.round((result.rows[0].completion_score * 100) / 10);

    await query(`
      UPDATE users 
      SET profile_completion_percentage = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId, completionPercentage]);

    return completionPercentage;
  },

  // Update last activity
  async updateLastActivity(userId) {
    await query(`
      UPDATE users 
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);
  },

  // Upload user avatar
  async uploadAvatar(userId, avatarUrl) {
    const result = await query(`
      UPDATE users 
      SET avatar_url = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name, email, avatar_url, profile_completion_percentage
    `, [userId, avatarUrl]);

    if (result.rows.length === 0) {
      throw new Error('User not found or update failed');
    }

    return result.rows[0];
  },

  // Remove user avatar
  async removeAvatar(userId) {
    const result = await query(`
      UPDATE users 
      SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name, email, avatar_url, profile_completion_percentage
    `, [userId]);

    if (result.rows.length === 0) {
      throw new Error('User not found or update failed');
    }

    return result.rows[0];
  }
};
