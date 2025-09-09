import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Op, Transaction as SequelizeTransaction } from 'sequelize';
import { auth } from '../middleware/auth.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import sequelize from '../config/database.js';

const router = express.Router();

// Get orders with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const customerId = req.query.customerId;
    const status = req.query.status;
    const offset = (page - 1) * limit;

    const where = {};
    if (customerId) {
      where.customerId = customerId;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          attributes: ['fullName', 'companyName']
        }
      ],
      limit,
      offset,
      order: [['orderDate', 'DESC']]
    });

    res.json({
      orders: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση παραγγελιών' });
  }
});

// Get single order with details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullName', 'companyName', 'vatNumber']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['name', 'sku']
            }
          ]
        },
        {
          model: Transaction,
          attributes: ['id', 'type', 'amount', 'date', 'paymentMethod']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Η παραγγελία δεν βρέθηκε' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση παραγγελίας' });
  }
});

// Create order
router.post('/', [
  auth,
  body('customerId').notEmpty().withMessage('Ο πελάτης είναι υποχρεωτικός'),
  body('items').isArray({ min: 1 }).withMessage('Η παραγγελία πρέπει να περιέχει τουλάχιστον ένα προϊόν'),
  body('items.*.productId').notEmpty().withMessage('Το προϊόν είναι υποχρεωτικό'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Η ποσότητα πρέπει να είναι θετικός αριθμός'),
  body('shippingCost').isFloat({ min: 0 }).withMessage('Το κόστος αποστολής πρέπει να είναι θετικός αριθμός')
], async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, items, shippingCost = 0, notes } = req.body;

    // Calculate total amount
    let totalAmount = parseFloat(shippingCost);
    const orderItems = [];

    // Validate products and calculate totals
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Το προϊόν με ID ${item.productId} δεν βρέθηκε` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Create order
    const order = await Order.create({
      customerId,
      shippingCost,
      totalAmount,
      notes,
      status: 'pending'
    }, { transaction: t });

    // Create order items
    await OrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, orderId: order.id })),
      { transaction: t }
    );

    // Update customer balance
    await Customer.increment(
      { balance: totalAmount },
      { where: { id: customerId }, transaction: t }
    );

    await t.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Customer,
          attributes: ['fullName', 'companyName']
        },
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία παραγγελίας' });
  }
});

// Add payment to order
router.post('/:id/payments', [
  auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Το ποσό πρέπει να είναι θετικός αριθμός'),
  body('paymentMethod').notEmpty().withMessage('Ο τρόπος πληρωμής είναι υποχρεωτικός')
], async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Η παραγγελία δεν βρέθηκε' });
    }

    const { amount, paymentMethod, notes } = req.body;

    // Create payment transaction
    const payment = await Transaction.create({
      customerId: order.customerId,
      orderId: order.id,
      type: 'payment',
      amount,
      paymentMethod,
      notes
    }, { transaction: t });

    // Update customer balance
    await Customer.decrement(
      { balance: amount },
      { where: { id: order.customerId }, transaction: t }
    );

    // Check if order is fully paid and update status
    const totalPaid = await Transaction.sum('amount', {
      where: {
        orderId: order.id,
        type: 'payment'
      }
    });

    if (totalPaid >= order.totalAmount) {
      await order.update({ status: 'completed' }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(payment);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Σφάλμα κατά την καταχώρηση πληρωμής' });
  }
});

// Process refund
router.post('/:id/refunds', [
  auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Το ποσό πρέπει να είναι θετικός αριθμός'),
  body('reason').notEmpty().withMessage('Ο λόγος επιστροφής είναι υποχρεωτικός')
], async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Η παραγγελία δεν βρέθηκε' });
    }

    const { amount, reason } = req.body;

    // Create refund transaction
    const refund = await Transaction.create({
      customerId: order.customerId,
      orderId: order.id,
      type: 'refund',
      amount: -amount,
      notes: reason
    }, { transaction: t });

    // Update customer balance
    await Customer.decrement(
      { balance: amount },
      { where: { id: order.customerId }, transaction: t }
    );

    await order.update({ status: 'cancelled' }, { transaction: t });

    await t.commit();
    res.status(201).json(refund);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Σφάλμα κατά την καταχώρηση επιστροφής' });
  }
});

export default router;
