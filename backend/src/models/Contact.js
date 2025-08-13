import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'read', 'replied', 'archived'),
    defaultValue: 'pending'
  },
  ip_address: {
    type: DataTypes.STRING(45), // IPv6 compatible
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'contacts',
  timestamps: true
});

export default Contact;
