const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../config/database');
const { handleValidationErrors, xssProtection } = require('../middleware/validation');
const { protect, customerOnly } = require('../middleware/auth');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

router.use(xssProtection);

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('whatsapp').optional().trim(),
  body('company').optional().trim(),
  handleValidationErrors
];

// Login accepts either an email or a phone number as the identifier
const loginValidation = [
  body('identifier').optional().trim(),
  body('email').optional().trim(),
  body('phone').optional().trim(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const id = req.body.identifier || req.body.email || req.body.phone;
    if (!id || !String(id).trim()) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }
    next();
  },
  handleValidationErrors
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('whatsapp').optional().trim(),
  body('company').optional().trim(),
  handleValidationErrors
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
];

router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, company } = req.body;

    const existing = await db.getOne(
      'SELECT id FROM customers WHERE email = ? AND deleted_at IS NULL',
      [email.toLowerCase()]
    );

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    if (phone) {
      const existingPhone = await db.getOne(
        'SELECT id FROM customers WHERE phone = ? AND deleted_at IS NULL',
        [phone]
      );
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this phone number already exists' });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    await db.run(
      `INSERT INTO customers (id, name, email, phone, whatsapp, company, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email.toLowerCase(), phone || null, whatsapp || null, company || null, hashedPassword]
    );

    const token = jwt.sign(
      { id, email: email.toLowerCase(), role: 'customer' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    logger.info(`Customer registered: ${email}`);

    res.status(201).json({
      success: true,
      token,
      user: { id, name, email: email.toLowerCase(), phone: phone || null, whatsapp: whatsapp || null, company: company || null, role: 'customer' }
    });
  } catch (error) {
    logger.error('Customer registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const raw = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { password } = req.body;
    // If it contains "@" treat as email, otherwise look up by phone
    const isEmail = raw.includes('@');
    const lookupQuery = isEmail
      ? 'SELECT * FROM customers WHERE email = ? AND deleted_at IS NULL'
      : 'SELECT * FROM customers WHERE phone = ? AND deleted_at IS NULL';
    const lookupValue = isEmail ? raw.toLowerCase() : raw;

    const customer = await db.getOne(lookupQuery, [lookupValue]);

    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, customer.password);

    if (!isMatch) {
      logger.warn(`Failed customer login attempt: ${raw}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    logger.info(`Customer logged in: ${customer.email}`);

    res.json({
      success: true,
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        company: customer.company,
        role: 'customer'
      }
    });
  } catch (error) {
    logger.error('Customer login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', protect, customerOnly, async (req, res) => {
  try {
    const customer = await db.getOne(
      'SELECT id, name, email, phone, whatsapp, company, created_at FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.user.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ user: { ...customer, role: 'customer' } });
  } catch (error) {
    logger.error('Get customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', protect, customerOnly, updateProfileValidation, async (req, res) => {
  try {
    const { name, phone, whatsapp, company } = req.body;

    if (phone) {
      const existing = await db.getOne(
        'SELECT id FROM customers WHERE phone = ? AND id != ? AND deleted_at IS NULL',
        [phone, req.user.id]
      );
      if (existing) {
        return res.status(400).json({ error: 'This phone number is already in use' });
      }
    }

    const current = await db.getOne(
      'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.user.id]
    );

    if (!current) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.run(
      `UPDATE customers SET name = ?, phone = ?, whatsapp = ?, company = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name || current.name, phone !== undefined ? phone : current.phone, whatsapp !== undefined ? whatsapp : current.whatsapp, company !== undefined ? company : current.company, req.user.id]
    );

    const updated = await db.getOne(
      'SELECT id, name, email, phone, whatsapp, company, created_at FROM customers WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, user: { ...updated, role: 'customer' } });
  } catch (error) {
    logger.error('Update customer profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/change-password', protect, customerOnly, changePasswordValidation, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await db.getOne(
      'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.user.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, customer.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.run(
      'UPDATE customers SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, customer.id]
    );

    logger.info(`Password changed for customer: ${customer.email}`);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Customer change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/orders', protect, customerOnly, async (req, res) => {
  try {
    const orders = await db.getMany(
      `SELECT id, order_number, customer_name, product_name, product_codes, items_info, quantity, shipping_method, price, net_weight, status, tracking_number, payment_info, created_at, updated_at
       FROM orders WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/product-requests', protect, customerOnly, async (req, res) => {
  try {
    const requests = await db.getMany(
      `SELECT id, name, phone, whatsapp, email, company, product_name, product_link, target_price, quantity, shipping_method, specifications, message, image, tracking_number, status, created_at
       FROM product_requests WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: requests });
  } catch (error) {
    logger.error('Get customer product requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/service-requests', protect, customerOnly, async (req, res) => {
  try {
    const requests = await db.getMany(
      `SELECT id, service_type, name, phone, whatsapp, email, company, details, message, status, tracking_number, admin_notes, price, created_at, updated_at
       FROM service_requests WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: requests });
  } catch (error) {
    logger.error('Get customer service requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/tracking/:tracking_number', protect, customerOnly, async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const tracking = await db.getMany(
      `SELECT status, location, note, created_at FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC`,
      [tracking_number]
    );

    res.json({ success: true, data: tracking });
  } catch (error) {
    logger.error('Get customer tracking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/orders/:id', protect, customerOnly, async (req, res) => {
  try {
    const order = await db.getOne(
      'SELECT id FROM orders WHERE id = ? AND customer_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run(
      'UPDATE orders SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    logger.info(`Customer ${req.user.id} deleted order ${req.params.id}`);

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    logger.error('Customer delete order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/product-requests/:id', protect, customerOnly, async (req, res) => {
  try {
    const request = await db.getOne(
      'SELECT id FROM product_requests WHERE id = ? AND customer_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await db.run(
      'UPDATE product_requests SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    logger.info(`Customer ${req.user.id} deleted product request ${req.params.id}`);

    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    logger.error('Customer delete product request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/service-requests/:id', protect, customerOnly, async (req, res) => {
  try {
    const request = await db.getOne(
      'SELECT id FROM service_requests WHERE id = ? AND customer_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await db.run(
      'UPDATE service_requests SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    logger.info(`Customer ${req.user.id} deleted service request ${req.params.id}`);

    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    logger.error('Customer delete service request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/event-registrations', protect, customerOnly, async (req, res) => {
  try {
    const registrations = await db.getMany(
      `SELECT id, event_title, full_name, email, phone, whatsapp_number, passport_number, age, profession, division, district, business_type, business_name, business_certificate_number, passport_images, business_certificate_images, additional_message, status, admin_notes, created_at, updated_at
       FROM event_registrations WHERE email = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [req.user.email]
    );

    res.json({ success: true, data: registrations });
  } catch (error) {
    logger.error('Get customer event registrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
