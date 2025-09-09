import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Όνομα'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Κατηγορία'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'Περιγραφή'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Τιμή',
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Κωδικός (SKU)'
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['sku']
    },
    {
      fields: ['category']
    }
  ]
});

export default Product;
