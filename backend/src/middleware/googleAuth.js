import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../db/simple-connection.js';
import { generateTokens } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Configure Google OAuth Strategy
 */
export const configureGoogleStrategy = () => {
  // Check if Google OAuth credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    logger.warn('Google OAuth credentials not configured. Google login will not be available.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_PREFIX || '/api'}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { id: googleId, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const avatarUrl = photos[0]?.value || null;

      // Check if user already exists by Google ID
      let user = await getUserByGoogleId(googleId);
      
      if (user) {
        // Update existing user's profile picture if it changed
        if (user.avatar_url !== avatarUrl) {
          await updateUserAvatar(user.id, avatarUrl);
          user.avatar_url = avatarUrl;
        }
        
        logger.info(`Google login: Existing user ${user.email} logged in`);
        return done(null, user);
      }

      // Check if user exists by email (for users who registered with email first)
      user = await getUserByEmail(email);
      
      if (user) {
        // Link Google account to existing email account
        await linkGoogleAccount(user.id, googleId, avatarUrl);
        user.google_id = googleId;
        user.avatar_url = avatarUrl;
        user.provider = 'google';
        user.email_verified = true;
        
        logger.info(`Google login: Linked Google account to existing user ${user.email}`);
        return done(null, user);
      }

      // Create new user
      user = await createGoogleUser({
        googleId,
        name: displayName,
        email,
        avatarUrl
      });

      logger.info(`Google login: New user ${user.email} created`);
      return done(null, user);

    } catch (error) {
      logger.error('Google OAuth strategy error:', error);
      return done(error, null);
    }
  }));
};

/**
 * Get user by Google ID
 */
const getUserByGoogleId = async (googleId) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by Google ID:', error);
    throw error;
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Link Google account to existing user
 */
const linkGoogleAccount = async (userId, googleId, avatarUrl) => {
  try {
    await query(
      'UPDATE users SET google_id = $1, avatar_url = $2, provider = $3, email_verified = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
      [googleId, avatarUrl, 'google', true, userId]
    );
  } catch (error) {
    logger.error('Error linking Google account:', error);
    throw error;
  }
};

/**
 * Create new Google user
 */
const createGoogleUser = async (userData) => {
  try {
    const { googleId, name, email, avatarUrl } = userData;
    
    // Generate a random password for Google users (they won't use it)
    const randomPassword = Math.random().toString(36).slice(-12);
    
    const result = await query(
      `INSERT INTO users (
        google_id, name, email, mobile, location, password_hash, 
        role, is_active, provider, email_verified, avatar_url, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        googleId,
        name,
        email,
        '0000000000', // Default mobile for Google users
        'Not specified', // Default location for Google users
        randomPassword, // Random password (won't be used)
        'user',
        true,
        'google',
        true,
        avatarUrl
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating Google user:', error);
    throw error;
  }
};

/**
 * Update user avatar URL
 */
const updateUserAvatar = async (userId, avatarUrl) => {
  try {
    await query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [avatarUrl, userId]
    );
  } catch (error) {
    logger.error('Error updating user avatar:', error);
    throw error;
  }
};

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

export default passport;
