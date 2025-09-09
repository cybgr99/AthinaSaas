import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  // Connect to postgres database to create our app database
  const adminDb = new Sequelize('postgres', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  });

  try {
    // Create database if it doesn't exist
    await adminDb.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created successfully`);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.parent.code === '42P04') {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await adminDb.close();
  }

  // Connect to our app database to create extensions
  const appDb = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    // Create unaccent extension for better Greek text search
    await appDb.query('CREATE EXTENSION IF NOT EXISTS unaccent');
    console.log('Database extensions installed successfully');
  } catch (error) {
    console.error('Error creating extensions:', error);
  } finally {
    await appDb.close();
  }
};

initDatabase();
