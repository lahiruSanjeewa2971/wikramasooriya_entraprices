import { AppError } from '../middleware/errorHandler.js';
import { simpleAuthService } from '../services/simpleAuthService.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { name, email, mobile, location, password } = req.body;

      // Validate required fields
      if (!name || !email || !mobile || !location || !password) {
        throw new AppError('All fields are required', 400, 'MISSING_FIELDS');
      }

      // Register user using simple service
      const result = await simpleAuthService.register({
        name,
        email,
        mobile,
        location,
        password
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new AppError(error.message, 409, 'USER_EXISTS');
      }
      throw new AppError(error.message, 500, 'REGISTRATION_ERROR');
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'MISSING_FIELDS');
      }

      // Login user using simple service
      const result = await simpleAuthService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid credentials')) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      throw new AppError(error.message, 500, 'LOGIN_ERROR');
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const user = await simpleAuthService.getUserProfile(userId);
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PROFILE_FETCH_ERROR');
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400, 'REFRESH_TOKEN_MISSING');
      }

      // Verify refresh token
      const decoded = simpleAuthService.verifyToken(refreshToken);
      
      // Get user profile
      const user = await simpleAuthService.getUserProfile(decoded.userId);
      if (!user || !user.is_active) {
        throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
      }

      // Generate new tokens
      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '5h' });
      const newRefreshToken = jwt.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '7d' });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken
          }
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid token')) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }
      throw new AppError(error.message, 500, 'TOKEN_REFRESH_ERROR');
    }
  }

  static async logout(req, res) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}
