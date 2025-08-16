import { testConnection, query } from './src/db/simple-connection.js';

console.log('🔍 Testing database connection...');

try {
  // Test connection
  const connected = await testConnection();
  if (connected) {
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await query('SELECT current_database(), current_user');
    console.log(`📊 Database: ${result.rows[0].current_database}`);
    console.log(`👤 User: ${result.rows[0].current_user}`);
    
    // Check tables
    const tables = await query('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
    console.log(`📋 Tables found: ${tables.rows.length}`);
    
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Database connection failed');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}

process.exit(0);
