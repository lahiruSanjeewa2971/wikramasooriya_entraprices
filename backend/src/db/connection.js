import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables, but don't fail if .env doesn't exist
dotenv.config({ silent: true });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'wik_db',
  process.env.DB_USER || 'wikadmin',
  process.env.DB_PASSWORD || 'SecretPass123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Only sync if explicitly requested via environment variable
    if (process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database models synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
