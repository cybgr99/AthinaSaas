import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Customer from './Customer.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'customer_id',
    references: {
      model: Customer,
      key: 'id'
    }
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'order_date',
    comment: 'Ημερομηνία Παραγγελίας'
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_cost',
    comment: 'Κόστος Αποστολής'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    comment: 'Συνολικό Ποσό'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Κατάσταση'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Σημειώσεις'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    {
      fields: ['customer_id']
    },
    {
      fields: ['order_date']
    }
  ]
});

Order.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Order, { foreignKey: 'customerId' });

export default Order;
