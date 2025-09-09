import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { auth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import OrderItem from '../models/OrderItem.js';

const router = express.Router();

// Get products with pagination and search
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) {
      where.category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    // Get unique categories for filter dropdown
    const categories = await Product.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    res.json({
      products: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση προϊόντων' });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση προϊόντος' });
  }
});

// Create product
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Το όνομα είναι υποχρεωτικό'),
  body('category').trim().notEmpty().withMessage('Η κατηγορία είναι υποχρεωτική'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Η τιμή πρέπει να είναι θετικός αριθμός'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('Ο κωδικός SKU είναι υποχρεωτικός')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ο κωδικός SKU χρησιμοποιείται ήδη' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία προϊόντος' });
  }
});

// Update product
router.put('/:id', [
  auth,
  body('name').trim().notEmpty().withMessage('Το όνομα είναι υποχρεωτικό'),
  body('category').trim().notEmpty().withMessage('Η κατηγορία είναι υποχρεωτική'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Η τιμή πρέπει να είναι θετικός αριθμός'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('Ο κωδικός SKU είναι υποχρεωτικός')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ο κωδικός SKU χρησιμοποιείται ήδη' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση προϊόντος' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε' });
    }

    // Check if product is used in any orders
    const orderItemCount = await OrderItem.count({
      where: { productId: req.params.id }
    });

    if (orderItemCount > 0) {
      return res.status(400).json({
        error: 'Δεν είναι δυνατή η διαγραφή του προϊόντος. Υπάρχουν συνδεδεμένες παραγγελίες.'
      });
    }

    await product.destroy();
    res.json({ message: 'Το προϊόν διαγράφηκε επιτυχώς' });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή προϊόντος' });
  }
});

export default router;
