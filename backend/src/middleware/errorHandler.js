import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = null;

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    message = 'Resource already exists';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'FOREIGN_KEY_ERROR';
    message = 'Invalid reference';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or expired token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
    details = err.details;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = null;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
