import express from 'express';
import passport from '../middleware/googleAuth.js';
import { generateTokens } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { simpleAuthService } from '../services/simpleAuthService.js';

const router = express.Router();

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
router.get('/google', (req, res, next) => {
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Google OAuth is not configured',
          code: 'GOOGLE_OAUTH_NOT_CONFIGURED'
        }
      });
    }

    // Store the redirect URL in session if provided
    if (req.query.redirect) {
      req.session.redirectUrl = req.query.redirect;
    }
    
    // Initiate Google OAuth
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  } catch (error) {
    logger.error('Google OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to initiate Google authentication',
        code: 'GOOGLE_AUTH_ERROR'
      }
    });
  }
});

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback
 */
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.GOOGLE_CALLBACK_URL}?error=auth_failed` }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        logger.error('No user found after Google authentication');
        return res.redirect(`${process.env.GOOGLE_CALLBACK_URL}?error=no_user`);
      }

      // Generate JWT tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Update last login
      await updateLastLogin(user.id);

      // Redirect to frontend with tokens
      const redirectUrl = new URL(process.env.GOOGLE_CALLBACK_URL);
      redirectUrl.searchParams.set('token', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      redirectUrl.searchParams.set('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        provider: user.provider
      }));

      logger.info(`Google OAuth success: User ${user.email} authenticated`);
      res.redirect(redirectUrl.toString());

    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.GOOGLE_CALLBACK_URL}?error=callback_failed`);
    }
  }
);

/**
 * Update user's last login timestamp
 */
const updateLastLogin = async (userId) => {
  try {
    const { query } = await import('../db/simple-connection.js');
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  } catch (error) {
    logger.error('Error updating last login:', error);
    // Don't throw error as this is not critical
  }
};

/**
 * Handle Google OAuth callback from frontend
 * POST /api/auth/google/callback
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { googleId, name, email, avatarUrl } = req.body;

    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required Google user data',
          code: 'MISSING_GOOGLE_DATA'
        }
      });
    }

    // Create or update Google user
    const user = await simpleAuthService.createOrUpdateGoogleUser({
      googleId,
      name,
      email,
      avatarUrl
    });

    // Generate JWT tokens
    const tokens = generateTokens(user.id);

    // Update last login
    await updateLastLogin(user.id);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    logger.info(`Google OAuth success: User ${user.email} authenticated`);

    res.json({
      success: true,
      user: userWithoutPassword,
      tokens
    });

  } catch (error) {
    logger.error('Google OAuth callback error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process Google authentication',
        code: 'GOOGLE_CALLBACK_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * Get Google OAuth status (for frontend to check if user is authenticated)
 * GET /api/auth/google/status
 */
router.get('/google/status', (req, res) => {
  try {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    res.json({
      success: true,
      message: isConfigured ? 'Google OAuth is configured and ready' : 'Google OAuth is not configured',
      configured: isConfigured,
      clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not_configured',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'not_configured'
    });
  } catch (error) {
    logger.error('Google OAuth status error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get Google OAuth status',
        code: 'GOOGLE_STATUS_ERROR'
      }
    });
  }
});

export default router;
