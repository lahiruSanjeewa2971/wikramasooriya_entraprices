import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';

export const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new AppError('Failed to generate tokens', 500, 'TOKEN_GENERATION_ERROR');
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new AppError('Invalid token format', 400, 'INVALID_TOKEN_FORMAT');
  }
};
