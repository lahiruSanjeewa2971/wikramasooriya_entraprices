-- Migration: Add image_public_id field to products table
-- This field stores the Cloudinary public ID for proper image deletion

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN products.image_public_id IS 'Cloudinary public ID for image deletion';
