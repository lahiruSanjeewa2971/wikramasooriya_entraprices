import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  stock_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  new_arrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      fields: ['sku']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['new_arrival']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Virtual fields
Product.prototype.isInStock = function() {
  return this.stock_qty > 0;
};

Product.prototype.getStockStatus = function() {
  if (this.stock_qty === 0) return 'out_of_stock';
  if (this.stock_qty <= 5) return 'low_stock';
  return 'in_stock';
};

export default Product;
