const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const db = require('../config/database');
const { handleValidationErrors, xssProtection } = require('../middleware/validation');
const { upload, handleUploadError } = require('../config/multer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

router.use(xssProtection);

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  handleValidationErrors
];

const productRequestValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('product_name').trim().notEmpty().withMessage('Product name is required'),
  handleValidationErrors
];

router.post('/product-request', upload.single('image'), handleUploadError, productRequestValidation, async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      whatsapp, 
      email, 
      product_name, 
      product_link, 
      quantity, 
      shipping_method, 
      message 
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const id = uuidv4();

    await db.run(
      `INSERT INTO product_requests 
       (id, name, phone, whatsapp, email, product_name, product_link, quantity, shipping_method, message, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, phone, whatsapp, email, product_name, product_link, quantity, shipping_method, message, imagePath]
    );

    logger.info(`New product request from: ${email} - ${product_name}`);

    res.status(201).json({
      success: true,
      message: 'Product request submitted successfully',
      data: { id, name, product_name }
    });
  } catch (error) {
    logger.error('Product request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

router.post('/contact', contactValidation, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const id = uuidv4();

    await db.run(
      `INSERT INTO messages (id, name, email, subject, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, subject || 'Contact Form Submission', message]
    );

    logger.info(`New contact message from: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { id, name, email }
    });
  } catch (error) {
    logger.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/track/:tracking_number', async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const order = await db.getOne(
      `SELECT 
        order_number, 
        customer_name, 
        product_name, 
        quantity, 
        shipping_method, 
        status, 
        tracking_number,
        created_at
       FROM orders 
       WHERE tracking_number = ?`,
      [tracking_number]
    );

    if (!order) {
      return res.status(404).json({ 
        error: 'No shipment found with this tracking number' 
      });
    }

    const trackingHistory = await db.getMany(
      `SELECT status, location, note, created_at 
       FROM tracking 
       WHERE tracking_number = ? 
       ORDER BY created_at DESC`,
      [tracking_number]
    );

    logger.http(`Tracking lookup: ${tracking_number}`);

    res.json({
      success: true,
      data: {
        order,
        tracking: trackingHistory
      }
    });
  } catch (error) {
    logger.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getOne(
      `SELECT 
        phone, 
        email, 
        whatsapp_link, 
        facebook_page, 
        facebook_group, 
        office_address, 
        company_name 
       FROM settings 
       LIMIT 1`
    );

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

module.exports = router;
