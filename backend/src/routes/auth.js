import express from 'express';
import { validateRequest, authSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', 
  validateRequest(authSchemas.register),
  asyncHandler(AuthController.register)
);

// POST /api/auth/login
router.post('/login',
  validateRequest(authSchemas.login),
  asyncHandler(AuthController.login)
);

// GET /api/auth/me
router.get('/me',
  authenticateToken,
  asyncHandler(AuthController.getProfile)
);

// POST /api/auth/refresh
router.post('/refresh',
  asyncHandler(AuthController.refreshToken)
);

// POST /api/auth/logout
router.post('/logout',
  authenticateToken,
  asyncHandler(AuthController.logout)
);

export default router;
