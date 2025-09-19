-- Migration: Add Product Reviews System
-- Description: Creates tables for product reviews, images, and helpfulness tracking
-- Date: 2024-01-09
-- Version: 1.0.0

-- Connect to the wik_db database
\c wik_db;

-- =====================================================
-- 1. CREATE PRODUCT_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200) NOT NULL CHECK (LENGTH(title) >= 5),
    comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10),
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- =====================================================
-- 2. CREATE PRODUCT_IMAGES TABLE (Optional Enhancement)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. CREATE REVIEW_HELPFULNESS TABLE (Optional Enhancement)
-- =====================================================
CREATE TABLE IF NOT EXISTS review_helpfulness (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id) -- One vote per user per review
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Product Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_product_reviews_helpful_count ON product_reviews(helpful_count);

-- Product Images Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(sort_order);

-- Review Helpfulness Indexes
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user_id ON review_helpfulness(user_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_is_helpful ON review_helpfulness(is_helpful);

-- =====================================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create trigger for product_reviews updated_at
CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON product_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant all privileges to wikadmin user
GRANT ALL PRIVILEGES ON TABLE product_reviews TO wikadmin;
GRANT ALL PRIVILEGES ON TABLE product_images TO wikadmin;
GRANT ALL PRIVILEGES ON TABLE review_helpfulness TO wikadmin;

-- Grant privileges on sequences
GRANT ALL PRIVILEGES ON SEQUENCE product_reviews_id_seq TO wikadmin;
GRANT ALL PRIVILEGES ON SEQUENCE product_images_id_seq TO wikadmin;
GRANT ALL PRIVILEGES ON SEQUENCE review_helpfulness_id_seq TO wikadmin;

-- =====================================================
-- 7. INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample product reviews (only if products and users exist)
INSERT INTO product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase) 
SELECT 
    p.id as product_id,
    u.id as user_id,
    CASE (random() * 4)::int + 1
        WHEN 1 THEN 5
        WHEN 2 THEN 4
        WHEN 3 THEN 3
        WHEN 4 THEN 2
        ELSE 1
    END as rating,
    CASE (random() * 5)::int
        WHEN 0 THEN 'Excellent product!'
        WHEN 1 THEN 'Great quality and fast delivery'
        WHEN 2 THEN 'Good value for money'
        WHEN 3 THEN 'Works as expected'
        WHEN 4 THEN 'Could be better'
        ELSE 'Not bad'
    END as title,
    CASE (random() * 5)::int
        WHEN 0 THEN 'This product exceeded my expectations. The quality is outstanding and it works perfectly for my needs. Highly recommended!'
        WHEN 1 THEN 'Good product overall. Fast shipping and good packaging. The item arrived in perfect condition.'
        WHEN 2 THEN 'Decent product for the price. Does what it''s supposed to do. Would consider buying again.'
        WHEN 3 THEN 'Average product. Nothing special but gets the job done. Could be improved in some areas.'
        WHEN 4 THEN 'Not the best quality but acceptable for the price. Might look for alternatives next time.'
        ELSE 'Product is okay but has some issues. Customer service was helpful though.'
    END as comment,
    (random() > 0.3) as is_verified_purchase
FROM products p
CROSS JOIN users u
WHERE p.is_active = true 
    AND u.is_active = true
    AND random() < 0.3  -- Only 30% chance of review per user-product combination
ON CONFLICT (product_id, user_id) DO NOTHING;

-- Insert sample product images (only if products exist)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
    p.id as product_id,
    'https://via.placeholder.com/600x600/2563EB/FFFFFF?text=' || REPLACE(p.name, ' ', '+') as image_url,
    p.name || ' - Product Image' as alt_text,
    true as is_primary,
    0 as sort_order
FROM products p
WHERE p.is_active = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VERIFY TABLES WERE CREATED
-- =====================================================

-- Show table information
\dt product_reviews;
\dt product_images;
\dt review_helpfulness;

-- Show table structures
\d product_reviews;
\d product_images;
\d review_helpfulness;

-- Show sample data
SELECT 'Product Reviews Count:' as info, COUNT(*) as count FROM product_reviews
UNION ALL
SELECT 'Product Images Count:' as info, COUNT(*) as count FROM product_images
UNION ALL
SELECT 'Review Helpfulness Count:' as info, COUNT(*) as count FROM review_helpfulness;

-- Show sample reviews
SELECT 
    pr.id,
    p.name as product_name,
    u.name as user_name,
    pr.rating,
    pr.title,
    pr.is_verified_purchase,
    pr.created_at
FROM product_reviews pr
JOIN products p ON pr.product_id = p.id
JOIN users u ON pr.user_id = u.id
ORDER BY pr.created_at DESC
LIMIT 5;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT 'Product Reviews System Migration Completed Successfully!' as status;
