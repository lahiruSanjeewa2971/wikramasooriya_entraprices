import { testConnection, query } from './src/db/simple-connection.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    console.log('🔧 Seeding database...');
    
    // Create categories
    const now = new Date().toISOString();
    const categories = await query(`
      INSERT INTO categories (name, description, created_at, updated_at) VALUES
        ('Bearings', 'High-quality industrial bearings for various applications', $1, $1),
        ('Fasteners', 'Industrial fasteners including bolts, nuts, and washers', $1, $1),
        ('Hydraulics', 'Hydraulic systems and components', $1, $1),
        ('Electrical', 'Electrical components and equipment', $1, $1),
        ('Tools', 'Industrial tools and equipment', $1, $1)
      RETURNING id, name
    `, [now]);
    console.log('✅ Categories created:', categories.rows.length);
    
    // Create products
    const products = await query(`
      INSERT INTO products (name, description, price, category_id, image_url, stock_qty, sku, featured, new_arrival, created_at, updated_at) VALUES
        ('Precision Ball Bearings', 'High-precision ball bearings for industrial applications', 1800.00, $1, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 200, 'BEAR-BALL-001', true, true, $6, $6),
        ('Industrial Seal Kit', 'Complete seal kit for hydraulic systems', 1200.00, $1, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 60, 'SEAL-KIT-001', true, false, $6, $6),
        ('Stainless Steel Fastener Set', 'Premium stainless steel fasteners', 950.00, $2, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 150, 'FAST-SS-001', true, true, $6, $6),
        ('High-Pressure Hydraulic Hose', 'Reinforced hydraulic hose for extreme pressure', 2500.00, $3, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 50, 'HYD-HOSE-001', true, false, $6, $6),
        ('Industrial Circuit Breaker', 'High-capacity circuit breaker for industrial systems', 3200.00, $4, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 30, 'ELEC-CB-001', false, true, $6, $6),
        ('Professional Drill Set', 'Complete set of professional drilling tools', 950.00, $5, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', 100, 'TOOL-DRILL-001', false, true, $6, $6)
      RETURNING id, name
    `, [categories.rows[0].id, categories.rows[1].id, categories.rows[2].id, categories.rows[3].id, categories.rows[4].id, now]);
    console.log('✅ Products created:', products.rows.length);
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);
    
    // Create users
    const users = await query(`
      INSERT INTO users (name, email, mobile, location, password_hash, role, created_at, updated_at) VALUES
        ('Admin User', 'admin@wikramasooriya.com', '+94 71 123 4567', 'Colombo, Sri Lanka', $1, 'admin', $3, $3),
        ('John Smith', 'john@example.com', '+94 77 987 6543', 'Kandy, Sri Lanka', $2, 'user', $3, $3)
      RETURNING id, name, email, role
    `, [adminPassword, userPassword, now]);
    console.log('✅ Users created:', users.rows.length);
    
    // Create carts for users
    const carts = await query(`
      INSERT INTO carts (user_id, status, created_at, updated_at) VALUES
        ($1, 'active', $3, $3),
        ($2, 'active', $3, $3)
      RETURNING id, user_id
    `, [users.rows[0].id, users.rows[1].id, now]);
    console.log('✅ Carts created:', carts.rows.length);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${categories.rows.length} categories`);
    console.log(`📦 Created ${products.rows.length} products`);
    console.log(`👥 Created ${users.rows.length} users`);
    console.log(`🛒 Created ${carts.rows.length} carts`);
    
    // Display sample data
    console.log('\n📋 Sample Categories:');
    categories.rows.forEach(cat => console.log(`  - ${cat.id}: ${cat.name}`));
    
    console.log('\n📋 Sample Products:');
    products.rows.forEach(prod => console.log(`  - ${prod.id}: ${prod.name}`));
    
    console.log('\n📋 Sample Users:');
    users.rows.forEach(user => console.log(`  - ${user.id}: ${user.name} (${user.email}) - ${user.role}`));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
