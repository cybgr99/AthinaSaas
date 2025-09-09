import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const migrate = async () => {
  try {
    // Sync all models with force:true in development only
    const force = process.env.NODE_ENV === 'development' && process.argv.includes('--force');
    
    console.log(`Running migrations (force: ${force})`);
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');

    // Add demo data in development if --seed flag is provided
    if (process.env.NODE_ENV === 'development' && process.argv.includes('--seed')) {
      console.log('Seeding demo data...');

      // Create demo admin user
      const [admin] = await User.findOrCreate({
        where: { username: 'admin' },
        defaults: {
          username: 'admin',
          password: 'admin123',
          email: 'admin@athina-saas.local',
          fullName: 'System Administrator',
          role: 'διαχειριστής'
        }
      });

      // Create demo products
      const products = await Product.bulkCreate([
        {
          name: 'Προϊόν 1',
          category: 'Κατηγορία 1',
          description: 'Περιγραφή προϊόντος 1',
          price: 100,
          sku: 'PRD001'
        },
        {
          name: 'Προϊόν 2',
          category: 'Κατηγορία 1',
          description: 'Περιγραφή προϊόντος 2',
          price: 200,
          sku: 'PRD002'
        },
        {
          name: 'Υπηρεσία 1',
          category: 'Υπηρεσίες',
          description: 'Περιγραφή υπηρεσίας 1',
          price: 150,
          sku: 'SRV001'
        }
      ]);

      // Create demo customers
      const customers = await Customer.bulkCreate([
        {
          fullName: 'Γεώργιος Παπαδόπουλος',
          companyName: 'ΓΠ ΕΠΕ',
          vatNumber: '123456789',
          email: 'gp@example.com',
          phone: '2101234567'
        },
        {
          fullName: 'Μαρία Κωνσταντίνου',
          vatNumber: '987654321',
          email: 'mk@example.com',
          phone: '2109876543'
        }
      ]);

      // Create demo orders
      const order = await Order.create({
        customerId: customers[0].id,
        shippingCost: 10,
        totalAmount: 310,
        status: 'completed'
      });

      // Add order items
      await OrderItem.bulkCreate([
        {
          orderId: order.id,
          productId: products[0].id,
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200
        },
        {
          orderId: order.id,
          productId: products[2].id,
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100
        }
      ]);

      // Add payment transaction
      await Transaction.create({
        customerId: customers[0].id,
        orderId: order.id,
        type: 'payment',
        amount: 310,
        paymentMethod: 'card',
        date: new Date()
      });

      console.log('Demo data seeded successfully');
    }

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

migrate();
