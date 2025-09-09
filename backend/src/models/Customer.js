import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name',
    comment: 'Ονοματεπώνυμο'
  },
  companyName: {
    type: DataTypes.STRING,
    field: 'company_name',
    comment: 'Επωνυμία'
  },
  vatNumber: {
    type: DataTypes.STRING,
    field: 'vat_number',
    comment: 'ΑΦΜ',
    validate: {
      isNumeric: true,
      len: [9, 9]
    }
  },
  address: {
    type: DataTypes.STRING,
    comment: 'Διεύθυνση'
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    },
    comment: 'Email'
  },
  phone: {
    type: DataTypes.STRING,
    comment: 'Τηλέφωνο'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Σημειώσεις'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Τρέχον υπόλοιπο'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['vat_number']
    },
    {
      fields: ['email']
    }
  ]
});

export default Customer;
