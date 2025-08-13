import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';
import { generateTokens } from '../utils/jwt.js';
import { User, Cart } from '../models/index.js';

export class AuthController {
  static async register(req, res) {
    const { name, email, mobile, location, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Check if mobile number already exists
    const existingMobile = await User.findOne({ where: { mobile } });
    if (existingMobile) {
      throw new AppError('User with this mobile number already exists', 409, 'MOBILE_EXISTS');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      location,
      password_hash: password // Will be hashed by model hook
    });

    // Create cart for user
    await Cart.create({
      user_id: user.id,
      status: 'active'
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    await user.update({ last_login: new Date() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    await user.update({ last_login: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  }

  static async getProfile(req, res) {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  }

  static async refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400, 'REFRESH_TOKEN_MISSING');
    }

    try {
      // Verify refresh token
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
      }

      // Check if user exists and is active
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      } else if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
      }
      throw error;
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
