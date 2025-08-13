import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  hooks: {
    beforeCreate: (category) => {
      if (!category.slug) {
        category.slug = category.name.toLowerCase().replace(/\s+/g, '-');
      }
    },
    beforeUpdate: (category) => {
      if (category.changed('name') && !category.changed('slug')) {
        category.slug = category.name.toLowerCase().replace(/\s+/g, '-');
      }
    }
  }
});

export default Category;
