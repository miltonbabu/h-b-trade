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

router.post('/product-request', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
}, async (req, res) => {
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

    // Validate required fields
    if (!name || !email || !product_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'product_name']
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const id = uuidv4();
    const trackingNumber = `PR${Date.now().toString().slice(-10)}`;

    const values = [
      id,
      name || null,
      phone || null,
      whatsapp || null,
      email || null,
      product_name || null,
      product_link || null,
      quantity || null,
      shipping_method || null,
      message || null,
      imagePath,
      trackingNumber
    ];

    await db.run(
      `INSERT INTO product_requests
       (id, name, phone, whatsapp, email, product_name, product_link, quantity, shipping_method, message, image, tracking_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    logger.info(`New product request from: ${email} - ${product_name} - Tracking: ${trackingNumber}`);

    res.status(201).json({
      success: true,
      message: 'Product request submitted successfully',
      data: { 
        id, 
        name, 
        product_name,
        trackingNumber 
      }
    });
  } catch (error) {
    console.error('=== PRODUCT REQUEST ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Product request error:', error);
    res.status(500).json({
      error: 'Failed to submit request',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    const STATUS_INFO = {
      'pending': { label: 'Pending', description: 'Your order has been received and is awaiting processing.', icon: 'package', color: 'yellow' },
      'processing': { label: 'Processing', description: 'Your order is being prepared for shipment.', icon: 'cog', color: 'blue' },
      'guangzhou_warehouse': { label: 'Guangzhou Warehouse Received', description: 'Your package has been received at our Guangzhou warehouse in China.', icon: 'warehouse', color: 'purple' },
      'in_transit': { label: 'In Transit', description: 'Your package is in transit from China to Bangladesh.', icon: 'truck', color: 'indigo' },
      'dhaka_customs': { label: 'Dhaka Customs Clearance', description: 'Your package is going through customs clearance in Dhaka.', icon: 'clipboard', color: 'orange' },
      'dhaka_office': { label: 'Dhaka Office', description: 'Your package has arrived at our Dhaka office and is ready for delivery.', icon: 'building', color: 'teal' },
      'delivered': { label: 'Delivered To Customer', description: 'Your package has been successfully delivered.', icon: 'check-circle', color: 'green' },
      'cancelled': { label: 'Cancelled', description: 'This order has been cancelled.', icon: 'x-circle', color: 'red' },
    };

    const statusInfo = STATUS_INFO[order.status] || { label: order.status, description: '', icon: 'package', color: 'gray' };

    logger.http(`Tracking lookup: ${tracking_number}`);

    res.json({
      success: true,
      data: {
        order,
        tracking: trackingHistory,
        statusInfo,
        allStatuses: Object.entries(STATUS_INFO).map(([value, info]) => ({
          value,
          ...info,
          isCurrent: value === order.status,
        })),
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
        company_name,
        bkash,
        nagad,
        bank_account as bankAccount,
        wechat,
        alipay,
        wechat_qr as wechatQr,
        alipay_qr as alipayQr
       FROM settings
       LIMIT 1`
    );

    logger.info('Settings fetched - bankAccount:', settings?.bankAccount);

    res.json({
      success: true,
      data: settings || {}
    });
  } catch (error) {
    logger.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Public products endpoint for wholesale page
// Get product categories (must be before /products route)
router.get('/products/categories', async (req, res) => {
  try {
    const categories = await db.getMany(
      "SELECT DISTINCT category FROM products WHERE status = 'active' AND category IS NOT NULL AND category != '' ORDER BY category"
    );
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ 
      error: 'Failed to get categories'
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let queryStr = "SELECT id, product_code, name, category, price, moq, image, image2, image3, description FROM products WHERE status = 'active'";
    const params = [];

    if (category && category !== 'all') {
      queryStr += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      queryStr += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await db.getMany(queryStr, params);
    
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ 
      error: 'Failed to get products'
    });
  }
});

// Public order creation endpoint
router.post('/orders', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('customerInfo').isObject().withMessage('Customer information is required'),
  body('shippingMethod').notEmpty().withMessage('Shipping method is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { items, status, customerInfo, payment, shippingMethod } = req.body;
    
    const productIds = items.map(item => item.productId).filter(Boolean);
    const productCodes = items.map(item => item.productCode).filter(Boolean);
    
    let products = [];
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      products = await db.getMany(
        `SELECT id, product_code, name, price, moq FROM products WHERE id IN (${placeholders})`,
        productIds
      );
    } else if (productCodes.length > 0) {
      const placeholders = productCodes.map(() => '?').join(',');
      products = await db.getMany(
        `SELECT id, product_code, name, price, moq FROM products WHERE product_code IN (${placeholders})`,
        productCodes
      );
    }
    
    const productMap = new Map();
    products.forEach(p => {
      productMap.set(p.id, p);
      if (p.product_code) productMap.set(p.product_code, p);
    });
    
    let serverTotal = 0;
    let serverTotalUnits = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = productMap.get(item.productId) || productMap.get(item.productCode);
      
      if (!product) {
        return res.status(400).json({ 
          error: `Product not found: ${item.productName || item.productId || item.productCode}` 
        });
      }
      
      const unitPrice = parseFloat(product.price);
      const moq = parseInt(product.moq) || 1;
      const quantity = parseInt(item.quantity) || 1;
      
      const totalUnits = moq * quantity;
      const itemTotalPrice = totalUnits * unitPrice;
      
      serverTotal += itemTotalPrice;
      serverTotalUnits += totalUnits;
      
      validatedItems.push({
        productId: product.id,
        productCode: product.product_code,
        productName: product.name,
        quantity: quantity,
        moq: moq,
        unitPrice: unitPrice,
        totalUnits: totalUnits,
        totalPrice: itemTotalPrice
      });
    }
    
    const id = uuidv4();
    const orderNumber = `HB${Date.now().toString().slice(-8)}`;
    const trackingNumber = `TRK${Date.now().toString().slice(-10)}`;
    
    const productNames = validatedItems.map(item => item.productName).join(', ');
    const productCodesStr = validatedItems.map(item => item.productCode).filter(Boolean).join(', ');
    
    const customerInfoJson = JSON.stringify(customerInfo);
    const paymentInfoJson = payment ? JSON.stringify(payment) : null;
    const itemsJson = JSON.stringify(validatedItems);
    
    const shippingMethodMap = {
      'air': 'Air Cargo',
      'sea': 'Sea Freight',
      'hand': 'Hand Carry'
    };
    const shippingMethodName = shippingMethodMap[shippingMethod] || shippingMethod;
    
    await db.run(
      `INSERT INTO orders 
       (id, order_number, tracking_number, customer_name, customer_info, product_name, product_codes, items_info, quantity, shipping_method, price, status, payment_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        orderNumber, 
        trackingNumber,
        customerInfo.name || 'Guest Customer', 
        customerInfoJson,
        productNames,
        productCodesStr,
        itemsJson, 
        serverTotalUnits,
        shippingMethodName,
        serverTotal, 
        status || 'pending',
        paymentInfoJson
      ]
    );

    logger.info(`New order created: ${orderNumber} - Tracking: ${trackingNumber} - Shipping: ${shippingMethodName} - Total Units: ${serverTotalUnits} - Total: ${serverTotal}`);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { 
        id, 
        orderId: orderNumber,
        orderNumber,
        trackingNumber,
        totalAmount: serverTotal,
        totalUnits: serverTotalUnits,
        itemCount: validatedItems.length 
      }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({ 
      error: 'Failed to place order'
    });
  }
});

// Public videos endpoint
router.get('/videos', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const videos = await db.getMany(
      'SELECT id, title, youtube_url, description, created_at FROM videos WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      ['active', parseInt(limit), offset]
    );
    
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: videos.length
      }
    });
  } catch (error) {
    logger.error('Get videos error:', error);
    res.status(500).json({ 
      error: 'Failed to get videos'
    });
  }
});

// Featured videos endpoint (for homepage - limit 2)
router.get('/videos/featured', async (req, res) => {
  try {
    const videos = await db.getMany(
      'SELECT id, title, youtube_url, description, created_at FROM videos WHERE status = ? ORDER BY created_at DESC LIMIT 2',
      ['active']
    );
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    logger.error('Get featured videos error:', error);
    res.status(500).json({ 
      error: 'Failed to get featured videos'
    });
  }
});

module.exports = router;
