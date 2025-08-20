import winston from 'winston';

// Custom format for better error readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: customFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: customFormat
    })
  ]
});

// Enhanced logging methods
export const logError = (message, error, context = {}) => {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    },
    context,
    timestamp: new Date().toISOString()
  });
};

export const logApiError = (req, error, context = {}) => {
  logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?.id || 'unauthenticated'
    },
    context,
    timestamp: new Date().toISOString()
  });
};

export const logDatabaseError = (operation, error, query = null, params = null) => {
  logger.error(`Database Error in ${operation}`, {
    error: {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      where: error.where,
      schema: error.schema,
      table: error.table,
      column: error.column,
      dataType: error.dataType,
      constraint: error.constraint
    },
    operation,
    query,
    params,
    timestamp: new Date().toISOString()
  });
};
