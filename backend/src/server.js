import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';

import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { testConnection } from './db/simple-connection.js';
import passport, { configureGoogleStrategy } from './middleware/googleAuth.js';
import { modelService } from './services/modelService.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import excelRoutes from './routes/excel.js';
import googleAuthRoutes from './routes/googleAuth.js';
import reviewRoutes from './routes/reviews.js';
import userProfileRoutes from './routes/userProfile.js';
import searchRoutes from './routes/search.js';
import { SearchController } from './controllers/searchController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Test database connection
testConnection().then(connected => {
  if (connected) {
    logger.info('SUCCESS: Database connection successful');
  } else {
    logger.error('ERROR: Database connection failed');
  }
}).catch(err => {
  logger.error('ERROR: Database connection error:', err);
});

// Test Docker semantic search container connection
SearchController.testDockerConnection().then(status => {
  if (status.available) {
    logger.info('SUCCESS: Docker semantic search container is ready!');
    logger.info('AI-powered semantic search functionality is available');
    
    // Preload the AI model for instant responses
    logger.info('Initializing AI model for semantic search...');
    modelService.preloadModel().then(() => {
      const cacheStatus = modelService.getCacheStatus();
      if (cacheStatus.isLoaded) {
        logger.info('🎉 AI Search system fully operational!');
        logger.info('✅ Model loaded and ready for semantic search');
      }
    }).catch(error => {
      logger.error('Failed to preload AI model:', error.message);
      logger.warn('AI Search will be unavailable until model loads');
    });
  } else {
    logger.warn('WARNING: Docker semantic search container is not available');
    logger.info('Semantic search will use fallback mode');
    logger.info('TIP: Run "npm run docker:start" to enable AI search functionality');
  }
}).catch(err => {
  logger.error('ERROR: Docker container check error:', err);
});

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? corsOrigins
    : ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes (reduced from 15)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // limit each IP to 500 requests per windowMs (increased from 100)
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  // Add headers to show rate limit info
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health'
});
app.use(limiter);

// Upload routes (must come BEFORE body parsing middleware)
app.use(`${API_PREFIX}/upload`, uploadRoutes);

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure Google OAuth strategy
configureGoogleStrategy();

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  const modelStatus = modelService.getCacheStatus();
  
  res.json({
    success: true,
    message: 'Wikramasooriya Enterprises API is running',
    timestamp: new Date().toISOString(),
    aiSearch: {
      available: modelStatus.isLoaded,
      modelCached: modelStatus.isCached,
      modelLoading: modelStatus.isLoading,
      modelName: modelStatus.modelName
    }
  });
});

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/auth`, googleAuthRoutes); // Google OAuth routes
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/excel`, excelRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/users`, userProfileRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server with error handling
const server = app.listen(PORT, () => {
  logger.info(`SUCCESS: Server running on port ${PORT}`);
  logger.info(`API Documentation available at ${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : `http://localhost:${PORT}`}${API_PREFIX}`);
  logger.info(`Health check: ${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : `http://localhost:${PORT}`}/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`ERROR: Port ${PORT} is already in use`);
    logger.info(`TIP: Please stop the existing server or use a different port`);
    logger.info(`TIP: You can kill the process using: netstat -ano | findstr :${PORT}`);
    logger.info(`TIP: Or run: npm run kill:port`);
    logger.info(`TIP: Or restart your terminal and try again`);
    process.exit(1);
  } else {
    logger.error('ERROR: Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('SUCCESS: Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('SUCCESS: Server closed');
    process.exit(0);
  });
});

export default app;
