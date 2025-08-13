import sequelize from './connection.js';
import { User, Category, Product, ProductCategory } from '../models/index.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with industrial tools data...');

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Power Tools', slug: 'power-tools', description: 'Electric and battery-powered tools for heavy-duty work' },
      { name: 'Hand Tools', slug: 'hand-tools', description: 'Manual tools for everyday tasks and repairs' },
      { name: 'Safety Gear', slug: 'safety-gear', description: 'Protective equipment for workplace safety' },
      { name: 'Construction Equipment', slug: 'construction-equipment', description: 'Heavy machinery and site equipment' },
      { name: 'Measuring Instruments', slug: 'measuring-instruments', description: 'Precision measuring and testing tools' }
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create products
    const products = await Product.bulkCreate([
      {
        sku: 'PT-001',
        name: 'Cordless Drill Driver',
        description: 'High-performance cordless drill with 2-speed settings and lithium-ion battery.',
        short_description: 'Portable drill with powerful torque',
        image_url: 'https://images.unsplash.com/photo-1606813902919-56c5d31d86c8?w=400',
        price: 129.99,
        stock_qty: 40,
        featured: true,
        new_arrival: true
      },
      {
        sku: 'PT-002',
        name: 'Angle Grinder',
        description: 'Durable angle grinder for cutting, grinding, and polishing metal and masonry.',
        short_description: 'Versatile grinder with safety guard',
        image_url: 'https://images.unsplash.com/photo-1581092787763-0c7e9c08f74d?w=400',
        price: 89.99,
        stock_qty: 25,
        featured: true,
        new_arrival: false
      },
      {
        sku: 'HT-001',
        name: 'Adjustable Wrench Set',
        description: 'Chrome-vanadium steel adjustable wrenches in multiple sizes for general repairs.',
        short_description: 'Strong and corrosion-resistant wrenches',
        image_url: 'https://images.unsplash.com/photo-1581090464853-3d2d0f9b4fda?w=400',
        price: 34.99,
        stock_qty: 80,
        featured: false,
        new_arrival: true
      },
      {
        sku: 'SG-001',
        name: 'Safety Helmet',
        description: 'Impact-resistant construction helmet with adjustable headband for comfort.',
        short_description: 'Protective helmet for construction sites',
        image_url: 'https://images.unsplash.com/photo-1581092580480-c77c266dfec4?w=400',
        price: 19.99,
        stock_qty: 100,
        featured: false,
        new_arrival: false
      },
      {
        sku: 'CE-001',
        name: 'Portable Cement Mixer',
        description: 'Compact electric cement mixer for small-scale construction and repairs.',
        short_description: 'Efficient mixing for concrete projects',
        image_url: 'https://images.unsplash.com/photo-1625730549017-d8b5246a7d30?w=400',
        price: 399.99,
        stock_qty: 10,
        featured: true,
        new_arrival: false
      },
      {
        sku: 'MI-001',
        name: 'Laser Distance Measurer',
        description: 'High-precision laser measuring tool with up to 100m range and digital display.',
        short_description: 'Accurate distance measurement tool',
        image_url: 'https://images.unsplash.com/photo-1581092334739-1a88b1e3e6b1?w=400',
        price: 59.99,
        stock_qty: 50,
        featured: false,
        new_arrival: true
      }
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create product-category relationships
    const productCategories = [
      { product_id: 1, category_id: 1 }, // Cordless Drill -> Power Tools
      { product_id: 2, category_id: 1 }, // Angle Grinder -> Power Tools
      { product_id: 3, category_id: 2 }, // Adjustable Wrench -> Hand Tools
      { product_id: 4, category_id: 3 }, // Safety Helmet -> Safety Gear
      { product_id: 5, category_id: 4 }, // Cement Mixer -> Construction Equipment
      { product_id: 6, category_id: 5 }  // Laser Measurer -> Measuring Instruments
    ];

    await ProductCategory.bulkCreate(productCategories);
    console.log(`✅ Created ${productCategories.length} product-category relationships`);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@industrialtools.com',
      password_hash: 'AdminPass123',
      role: 'admin'
    });

    console.log('✅ Created admin user');

    // Create sample user
    const sampleUser = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password_hash: 'UserPass123'
    });

    console.log('✅ Created sample user');

    console.log('🎉 Industrial tools database seeding completed successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Admin User: ${adminUser.email} (password: AdminPass123)`);
    console.log(`   - Sample User: ${sampleUser.email} (password: UserPass123)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
