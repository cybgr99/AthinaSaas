import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const adminData = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      email: process.env.ADMIN_EMAIL || 'admin@athina-crm.local',
      fullName: 'System Administrator',
      role: 'διαχειριστής'
    };

    const [admin, created] = await User.findOrCreate({
      where: { username: adminData.username },
      defaults: adminData
    });

    if (created) {
      console.log('Admin user created successfully.');
      console.log('Username:', adminData.username);
      console.log('Password:', adminData.password);
      console.log('\nPlease change these credentials after first login!');
    } else {
      console.log('Admin user already exists.');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
};

createAdmin();
