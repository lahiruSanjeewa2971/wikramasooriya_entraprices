import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price_at_add: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'cart_items',
  timestamps: true,
  hooks: {
    beforeCreate: (cartItem) => {
      cartItem.subtotal = cartItem.price_at_add * cartItem.qty;
    },
    beforeUpdate: (cartItem) => {
      if (cartItem.changed('qty') || cartItem.changed('price_at_add')) {
        cartItem.subtotal = cartItem.price_at_add * cartItem.qty;
      }
    },
    afterCreate: async (cartItem) => {
      await updateCartTotals(cartItem.cart_id);
    },
    afterUpdate: async (cartItem) => {
      await updateCartTotals(cartItem.cart_id);
    },
    afterDestroy: async (cartItem) => {
      await updateCartTotals(cartItem.cart_id);
    }
  }
});

// Helper function to update cart totals
async function updateCartTotals(cartId) {
  const { Cart } = await import('./index.js');
  const cart = await Cart.findByPk(cartId);
  if (cart) {
    const items = await CartItem.findAll({
      where: { cart_id: cartId }
    });
    
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    
    await cart.update({
      total_amount: totalAmount,
      item_count: itemCount
    });
  }
}

export default CartItem;
