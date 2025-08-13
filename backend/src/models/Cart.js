import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'abandoned', 'converted'),
    defaultValue: 'active'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  item_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'carts',
  timestamps: true,
  hooks: {
    beforeUpdate: (cart) => {
      // Recalculate totals when cart items change
      if (cart.changed('item_count') || cart.changed('total_amount')) {
        // This will be handled by CartItem hooks
      }
    }
  }
});

export default Cart;
