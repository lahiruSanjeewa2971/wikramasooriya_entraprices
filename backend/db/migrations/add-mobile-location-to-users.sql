-- Migration: Add mobile and location fields to users table
-- Date: 2025-01-13
-- Description: Adds mobile number and location fields to support enhanced user registration

-- Add mobile field
ALTER TABLE users 
ADD COLUMN mobile VARCHAR(20) NOT NULL DEFAULT '';

-- Add location field
ALTER TABLE users 
ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT '';

-- Add unique constraint on mobile (optional - uncomment if you want unique mobile numbers)
-- ALTER TABLE users ADD CONSTRAINT unique_mobile UNIQUE (mobile);

-- Add indexes for better query performance
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_location ON users(location);

-- Update existing users with placeholder values (if needed)
-- UPDATE users SET mobile = 'N/A', location = 'N/A' WHERE mobile = '' OR location = '';

-- Remove default constraints after migration
ALTER TABLE users ALTER COLUMN mobile DROP DEFAULT;
ALTER TABLE users ALTER COLUMN location DROP DEFAULT;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('mobile', 'location');
