import sequelize from './connection.js';
import '../models/index.js';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Sync all models (creates tables)
    await sequelize.sync({ force: true });
    
    console.log('✅ Database tables created successfully');
    console.log('📊 Database schema initialized');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
