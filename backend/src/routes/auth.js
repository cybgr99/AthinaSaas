import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Login route
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Λάθος στοιχεία σύνδεσης' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά τη σύνδεση' });
  }
});

// Create new user (admin only)
router.post('/users', [
  auth,
  checkRole(['διαχειριστής']),
  body('username').trim().notEmpty(),
  body('password').trim().isLength({ min: 6 }),
  body('email').trim().isEmail(),
  body('fullName').trim().notEmpty(),
  body('role').isIn(['διαχειριστής', 'χρήστης'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, fullName, role } = req.body;
    
    const user = await User.create({
      username,
      password,
      email,
      fullName,
      role
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Το όνομα χρήστη ή το email χρησιμοποιείται ήδη' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία χρήστη' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    fullName: req.user.fullName,
    email: req.user.email
  });
});

export default router;
