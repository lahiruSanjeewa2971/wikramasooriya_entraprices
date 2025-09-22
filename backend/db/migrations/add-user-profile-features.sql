-- Migration: Add User Profile Features
-- Date: 2025-01-20
-- Description: Add profile completion, activity tracking, and user preferences for profile page

-- Connect to the wik_db database
\c wik_db;

-- Add profile completion and activity tracking to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS bio TEXT CHECK (LENGTH(bio) <= 500);

-- Create user_preferences table for notification and privacy settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_communications BOOLEAN DEFAULT false,
    review_reminders BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends_only')),
    review_visibility VARCHAR(20) DEFAULT 'public' CHECK (review_visibility IN ('public', 'private', 'friends_only')),
    data_sharing BOOLEAN DEFAULT true,
    
    -- UI preferences
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'si', 'ta')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Create user_addresses table for multiple address support
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Address details
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('shipping', 'billing', 'home', 'work', 'other')),
    is_default BOOLEAN DEFAULT false,
    
    -- Address fields
    full_name VARCHAR(100) NOT NULL CHECK (LENGTH(full_name) >= 2),
    address_line_1 VARCHAR(255) NOT NULL CHECK (LENGTH(address_line_1) >= 5),
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL CHECK (LENGTH(city) >= 2),
    state_province VARCHAR(100) NOT NULL CHECK (LENGTH(state_province) >= 2),
    postal_code VARCHAR(20) NOT NULL CHECK (LENGTH(postal_code) >= 3),
    country VARCHAR(100) NOT NULL DEFAULT 'Sri Lanka' CHECK (LENGTH(country) >= 2),
    
    -- Contact details
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Additional info
    delivery_instructions TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session details
    session_token VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Session status
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_completion ON users(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_notifications ON user_preferences(email_notifications, sms_notifications);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_type ON user_addresses(address_type);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(is_default);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Create trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 10; -- Total fields to check
BEGIN
    -- Check each field and add to completion score
    -- Basic info (40 points)
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND name IS NOT NULL AND LENGTH(name) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND email IS NOT NULL AND LENGTH(email) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND mobile IS NOT NULL AND LENGTH(mobile) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND location IS NOT NULL AND LENGTH(location) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Profile details (30 points)
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND avatar_url IS NOT NULL AND LENGTH(avatar_url) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND date_of_birth IS NOT NULL) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND gender IS NOT NULL) THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id_param AND bio IS NOT NULL AND LENGTH(bio) > 0) THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Address info (20 points)
    IF EXISTS (SELECT 1 FROM user_addresses WHERE user_id = user_id_param AND is_default = true) THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Preferences (10 points)
    IF EXISTS (SELECT 1 FROM user_preferences WHERE user_id = user_id_param) THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Calculate percentage
    RETURN (completion_score * 100) / total_fields;
END;
$$ LANGUAGE plpgsql;

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, email_notifications, sms_notifications, marketing_communications, review_reminders, order_updates, profile_visibility, review_visibility, data_sharing, theme, language)
SELECT 
    id as user_id,
    true as email_notifications,
    false as sms_notifications,
    false as marketing_communications,
    true as review_reminders,
    true as order_updates,
    'public' as profile_visibility,
    'public' as review_visibility,
    true as data_sharing,
    'light' as theme,
    'en' as language
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences);

-- Update profile completion for existing users
UPDATE users 
SET profile_completion_percentage = calculate_profile_completion(id),
    last_activity_at = COALESCE(last_login, created_at)
WHERE profile_completion_percentage = 0;

-- Verify the changes
SELECT 'Users table updated with profile features' as status;

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('profile_completion_percentage', 'last_activity_at', 'date_of_birth', 'gender', 'bio')
ORDER BY ordinal_position;

SELECT 'User preferences table created' as status;
SELECT COUNT(*) as user_preferences_count FROM user_preferences;

SELECT 'User addresses table created' as status;
SELECT COUNT(*) as user_addresses_count FROM user_addresses;

SELECT 'User sessions table created' as status;
SELECT COUNT(*) as user_sessions_count FROM user_sessions;

SELECT 'User Profile Features Migration Completed Successfully!' as status;
