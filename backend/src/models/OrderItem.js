import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';
import Product from './Product.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: Order,
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    },
    comment: 'Ποσότητα'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
    comment: 'Τιμή Μονάδας'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
    comment: 'Συνολική Τιμή'
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['product_id']
    }
  ]
});

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

export default OrderItem;
