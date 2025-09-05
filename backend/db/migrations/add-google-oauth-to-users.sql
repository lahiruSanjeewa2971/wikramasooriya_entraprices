-- Migration: Add Google OAuth fields to users table
-- Date: 2024-08-25
-- Description: Add Google OAuth support fields to users table

-- Connect to the wik_db database
\c wik_db;

-- Add Google OAuth fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'email' CHECK (provider IN ('email', 'google')),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create index for google_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index for provider for better performance
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- Update existing users to have email_verified = true (since they registered with email)
UPDATE users SET email_verified = true WHERE provider = 'email' OR provider IS NULL;

-- Verify the changes
\d users

-- Show the new columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'avatar_url', 'provider', 'email_verified')
ORDER BY ordinal_position;
