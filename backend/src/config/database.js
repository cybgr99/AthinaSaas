import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'athina_crm',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: 'Europe/Athens',
  }
);

export default sequelize;
