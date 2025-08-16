import { testConnection, query } from './src/db/simple-connection.js';

const validateDatabaseConnection = async () => {
  try {
    console.log('🔍 Validating database connection...');
    
    // Test basic connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful');
    
    // Test database name
    const dbResult = await query('SELECT current_database(), current_user');
    console.log(`📊 Connected to database: ${dbResult.rows[0].current_database}`);
    console.log(`👤 Connected as user: ${dbResult.rows[0].current_user}`);
    
    // Check if required tables exist
    const tablesResult = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'products', 'categories', 'carts', 'cart_items', 'contacts')
      ORDER BY tablename
    `);
    
    const requiredTables = ['users', 'products', 'categories', 'carts', 'cart_items', 'contacts'];
    const existingTables = tablesResult.rows.map(r => r.tablename);
    
    console.log('\n📋 Required tables check:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });
    
    if (existingTables.length < requiredTables.length) {
      throw new Error(`Missing required tables. Found: ${existingTables.join(', ')}`);
    }
    
    // Check if users exist
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  No users found. You may need to run the seed script.');
    }
    
    // Check if products exist
    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(productsResult.rows[0].count);
    console.log(`📦 Products in database: ${productCount}`);
    
    if (productCount === 0) {
      console.log('⚠️  No products found. You may need to run the seed script.');
    }
    
    console.log('\n🎉 Database validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. If tables are missing, run: node setup-simple-db.js');
    console.log('  2. If no data exists, run: node seed-simple-db.js');
    console.log('  3. Start the server: npm start');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Database validation failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('  1. Check if PostgreSQL is running');
    console.log('  2. Verify database credentials in .env file');
    console.log('  3. Ensure database "wik_db" exists');
    console.log('  4. Check if user has proper permissions');
    console.log('\n📋 Current database configuration:');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  Database: ${process.env.DB_NAME || 'wik_db'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
    
    return false;
  }
};

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDatabaseConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default validateDatabaseConnection;
