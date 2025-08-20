import { logApiError } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error with enhanced context
  logApiError(req, err, {
    errorType: err.constructor.name,
    isOperational: err.isOperational
  });

  // Database errors
  if (err.code === '23502') {
    const message = `Missing required field: ${err.column}`;
    error = new AppError(message, 400, 'MISSING_REQUIRED_FIELD', {
      field: err.column,
      table: err.table,
      detail: err.detail
    });
  }

  if (err.code === '23503') {
    const message = `Foreign key constraint violation: ${err.detail}`;
    error = new AppError(message, 400, 'FOREIGN_KEY_VIOLATION', {
      detail: err.detail,
      table: err.table,
      constraint: err.constraint
    });
  }

  if (err.code === '23505') {
    const message = `Duplicate value: ${err.detail}`;
    error = new AppError(message, 409, 'DUPLICATE_VALUE', {
      detail: err.detail,
      table: err.table,
      constraint: err.constraint
    });
  }

  if (err.code === '23514') {
    const message = `Check constraint violation: ${err.detail}`;
    error = new AppError(message, 400, 'CHECK_CONSTRAINT_VIOLATION', {
      detail: err.detail,
      table: err.table,
      constraint: err.constraint
    });
  }

  if (err.code === '42P01') {
    const message = `Table not found: ${err.detail}`;
    error = new AppError(message, 500, 'TABLE_NOT_FOUND', {
      detail: err.detail,
      table: err.table
    });
  }

  if (err.code === '42703') {
    const message = `Column not found: ${err.detail}`;
    error = new AppError(message, 500, 'COLUMN_NOT_FOUND', {
      detail: err.detail,
      table: err.table,
      column: err.column
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    error = new AppError(message, 400, 'VALIDATION_ERROR', err.details);
  }

  // Cast errors (MongoDB)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID_FORMAT', {
      field: err.path,
      value: err.value
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';
  const details = error.details || null;

  // Enhanced error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        originalError: {
          name: err.name,
          code: err.code,
          detail: err.detail
        }
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
