import { query } from '../db/simple-connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const simpleAuthService = {
  // Register a new user
  async register(userData) {
    const { name, email, mobile, location, password } = userData;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR mobile = $2',
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email or mobile already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await query(`
      INSERT INTO users (name, email, mobile, location, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $6)
      RETURNING id, name, email, mobile, location, role, is_active, created_at
    `, [name, email, mobile, location, passwordHash, new Date().toISOString()]);

    const user = userResult.rows[0];

    // Create cart for user
    await query(`
      INSERT INTO carts (user_id, status, created_at, updated_at)
      VALUES ($1, 'active', $2, $2)
    `, [user.id, new Date().toISOString()]);

    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user,
      tokens: { accessToken, refreshToken }
    };
  },

  // Login user
  async login(email, password) {
    // Find user
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date().toISOString(), user.id]
    );

    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from user object
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken }
    };
  },

  // Get user profile
  async getUserProfile(userId) {
    const result = await query(
      'SELECT id, name, email, mobile, location, role, is_active, last_login, created_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};
