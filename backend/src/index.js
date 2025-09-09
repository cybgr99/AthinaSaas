import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import productRoutes from './routes/products.js';
import statsRoutes from './routes/stats.js';
import importRoutes from './routes/imports.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/imports', importRoutes);

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
