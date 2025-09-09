import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Customer from './Customer.js';
import Order from './Order.js';

const Transaction = sequelize.define('Transaction', {
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
  orderId: {
    type: DataTypes.UUID,
    field: 'order_id',
    references: {
      model: Order,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('payment', 'refund', 'return'),
    allowNull: false,
    comment: 'Τύπος Συναλλαγής'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Ποσό'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Ημερομηνία'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Σημειώσεις'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    field: 'payment_method',
    comment: 'Τρόπος Πληρωμής'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['customer_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['date']
    }
  ]
});

Transaction.belongsTo(Customer, { foreignKey: 'customerId' });
Transaction.belongsTo(Order, { foreignKey: 'orderId' });
Customer.hasMany(Transaction, { foreignKey: 'customerId' });
Order.hasMany(Transaction, { foreignKey: 'orderId' });

export default Transaction;
