import express from 'express';
import { auth } from '../middleware/auth.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { Sequelize } from 'sequelize';

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const [totalCustomers, totalOrders, totalBalance] = await Promise.all([
      Customer.count(),
      Order.count(),
      Customer.sum('balance')
    ]);

    res.json({
      totalCustomers,
      totalOrders,
      totalBalance: totalBalance || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση στατιστικών' });
  }
});

export default router;
