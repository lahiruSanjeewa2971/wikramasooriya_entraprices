import sequelize from '../db/connection.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Contact from './Contact.js';

// User - Cart relationship (One-to-One)
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart - CartItem relationship (One-to-Many)
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// Product - CartItem relationship (One-to-Many)
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product - Category relationship (Many-to-Many)
const ProductCategory = sequelize.define('ProductCategory', {}, {
  tableName: 'product_categories',
  timestamps: false
});

Product.belongsToMany(Category, { 
  through: ProductCategory, 
  foreignKey: 'product_id',
  otherKey: 'category_id',
  as: 'categories'
});

Category.belongsToMany(Product, { 
  through: ProductCategory, 
  foreignKey: 'category_id',
  otherKey: 'product_id',
  as: 'products'
});

export {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Contact,
  ProductCategory
};
