import pg from 'pg';
import { logger, logDatabaseError } from '../utils/logger.js';

const { Pool } = pg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wik_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Abcd@1234',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test the connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('✅ Database connection successful');
    return true;
  } catch (err) {
    logDatabaseError('testConnection', err);
    return false;
  }
};

// Get a client from the pool
export const getClient = async () => {
  return await pool.connect();
};

// Execute a query
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query execution for monitoring (only in development)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (err) {
    logDatabaseError('query', err, text, params);
    throw err;
  }
};

// Close the pool
export const closePool = async () => {
  await pool.end();
};

export default pool;
