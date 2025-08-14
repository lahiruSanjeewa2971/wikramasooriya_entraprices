import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'wik_db',
  password: 'Abcd@1234',
  port: 5432,
});

// Test the connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
};

// Execute a query
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

// Get a client for transactions
export const getClient = () => {
  return pool.connect();
};

export default pool;
