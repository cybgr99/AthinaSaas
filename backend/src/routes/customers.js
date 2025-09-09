import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { auth } from '../middleware/auth.js';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get customers with pagination and search
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const where = search ? {
      [Op.or]: [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { vatNumber: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      customers: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση πελατών' });
  }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Ο πελάτης δεν βρέθηκε' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση πελάτη' });
  }
});

// Create customer
router.post('/', [
  auth,
  body('fullName').trim().notEmpty().withMessage('Το ονοματεπώνυμο είναι υποχρεωτικό'),
  body('vatNumber')
    .trim()
    .matches(/^\d{9}$/).withMessage('Το ΑΦΜ πρέπει να έχει 9 ψηφία'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Μη έγκυρη διεύθυνση email'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[+\d\s-()]{10,}$/).withMessage('Μη έγκυρος αριθμός τηλεφώνου')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Το ΑΦΜ χρησιμοποιείται ήδη' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία πελάτη' });
  }
});

// Update customer
router.put('/:id', [
  auth,
  body('fullName').trim().notEmpty().withMessage('Το ονοματεπώνυμο είναι υποχρεωτικό'),
  body('vatNumber')
    .trim()
    .matches(/^\d{9}$/).withMessage('Το ΑΦΜ πρέπει να έχει 9 ψηφία'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Μη έγκυρη διεύθυνση email'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[+\d\s-()]{10,}$/).withMessage('Μη έγκυρος αριθμός τηλεφώνου')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Ο πελάτης δεν βρέθηκε' });
    }

    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Το ΑΦΜ χρησιμοποιείται ήδη' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση πελάτη' });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Ο πελάτης δεν βρέθηκε' });
    }

    // Check if customer has any transactions
    const transactionCount = await Transaction.count({
      where: { customerId: req.params.id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        error: 'Δεν είναι δυνατή η διαγραφή του πελάτη. Υπάρχουν συνδεδεμένες συναλλαγές.'
      });
    }

    await customer.destroy();
    res.json({ message: 'Ο πελάτης διαγράφηκε επιτυχώς' });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή πελάτη' });
  }
});

// Get customer transactions
router.get('/:id/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: { customerId: req.params.id },
      limit,
      offset,
      order: [['date', 'DESC']]
    });

    res.json({
      transactions: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση συναλλαγών' });
  }
});

export default router;
