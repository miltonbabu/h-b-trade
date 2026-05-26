const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const db = require('../config/database');
const { handleValidationErrors, xssProtection } = require('../middleware/validation');
const { upload, handleUploadError, MAX_FILES } = require('../config/multer');
const { uploadMultipleToCloudinary } = require('../config/cloudinary');
const { optionalAuth } = require('../middleware/auth');
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

router.post('/product-request', optionalAuth, (req, res, next) => {
  upload.array('images', MAX_FILES)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
}, productRequestValidation, async (req, res) => {
  try {
    const {
      name,
      phone,
      whatsapp,
      email,
      company,
      product_name,
      product_link,
      target_price,
      quantity,
      sample_needed,
      shipping_method,
      specifications,
      message
    } = req.body;

    let imageJson = null;
    if (req.files && req.files.length > 0) {
      try {
        const urls = await uploadMultipleToCloudinary(req.files, 'hbtrade/product-requests');
        if (urls.length > 0) {
          imageJson = JSON.stringify(urls);
        }
      } catch (cloudErr) {
        logger.error('Cloudinary upload failed for product-request:', cloudErr);
      }
    }

    const id = uuidv4();
    const trackingNumber = `PR${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
    const customerId = (req.user && req.user.role === 'customer') ? req.user.id : null;

    const values = [
      id,
      name || null,
      phone || null,
      whatsapp || null,
      email || null,
      company || null,
      product_name || null,
      product_link || null,
      target_price || null,
      quantity || null,
      sample_needed || null,
      shipping_method || null,
      specifications || null,
      message || null,
      imageJson,
      trackingNumber,
      customerId
    ];

    await db.run(
      `INSERT INTO product_requests
       (id, name, phone, whatsapp, email, company, product_name, product_link, target_price, quantity, sample_needed, shipping_method, specifications, message, image, tracking_number, customer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    logger.error('Product request error:', error);
    res.status(500).json({
      error: 'Failed to submit request'
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

    const STATUS_INFO = {
      'pending': { label: 'Pending', description: 'Your order has been received and is awaiting processing.', icon: 'package', color: 'yellow' },
      'processing': { label: 'Processing', description: 'Your order is being prepared for shipment.', icon: 'cog', color: 'blue' },
      'guangzhou_warehouse': { label: 'Guangzhou Warehouse Received', description: 'Your package has been received at our Guangzhou warehouse in China.', icon: 'warehouse', color: 'purple' },
      'in_transit': { label: 'In Transit', description: 'Your package is in transit from China to Bangladesh.', icon: 'truck', color: 'indigo' },
      'dhaka_customs': { label: 'Dhaka Customs Clearance', description: 'Your package is going through customs clearance in Dhaka.', icon: 'clipboard', color: 'orange' },
      'dhaka_office': { label: 'Dhaka Office', description: 'Your package has arrived at our Dhaka office and is ready for delivery.', icon: 'building', color: 'teal' },
      'delivered': { label: 'Delivered To Customer', description: 'Your package has been successfully delivered.', icon: 'check-circle', color: 'green' },
      'cancelled': { label: 'Cancelled', description: 'This order has been cancelled.', icon: 'x-circle', color: 'red' },
      // Product request statuses
      'received': { label: 'Received', description: 'Your request has been received. Our team will review it shortly.', icon: 'inbox', color: 'blue' },
      'in_progress': { label: 'In Progress', description: 'Our team is working on your request.', icon: 'cog', color: 'yellow' },
      'completed': { label: 'Completed', description: 'Your request has been completed successfully.', icon: 'check-circle', color: 'green' },
      'converted': { label: 'Converted to Order', description: 'Your request has been converted to an order. Use the same tracking number to track your order.', icon: 'refresh', color: 'purple' },
    };

    // 1. Search in orders table first
    const order = await db.getOne(
      `SELECT 
        order_number, customer_name, product_name, quantity, shipping_method, 
        status, tracking_number, price, created_at
       FROM orders 
       WHERE tracking_number = ? AND deleted_at IS NULL`,
      [tracking_number]
    );

    if (order) {
      const trackingHistory = await db.getMany(
        `SELECT status, location, note, created_at 
         FROM tracking 
         WHERE tracking_number = ? 
         ORDER BY created_at DESC`,
        [tracking_number]
      );

      const statusInfo = STATUS_INFO[order.status] || { label: order.status, description: '', icon: 'package', color: 'gray' };

      logger.http(`Tracking lookup (order): ${tracking_number}`);

      return res.json({
        success: true,
        type: 'order',
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
    }

    // 2. Search in product_requests table
    const productRequest = await db.getOne(
      `SELECT id, name, email, phone, product_name, quantity, shipping_method,
              status, tracking_number, created_at
       FROM product_requests 
       WHERE tracking_number = ? AND deleted_at IS NULL`,
      [tracking_number]
    );

    if (productRequest) {
      const trackingHistory = await db.getMany(
        `SELECT status, location, note, created_at 
         FROM tracking 
         WHERE tracking_number = ? 
         ORDER BY created_at DESC`,
        [tracking_number]
      );

      // If converted, also fetch the linked order
      let linkedOrder = null;
      if (productRequest.status === 'converted') {
        const fullRequest = await db.getOne(
          `SELECT converted_to_order FROM product_requests WHERE id = ?`,
          [productRequest.id]
        );
        if (fullRequest && fullRequest.converted_to_order) {
          linkedOrder = await db.getOne(
            `SELECT order_number, status, tracking_number FROM orders WHERE id = ? AND deleted_at IS NULL`,
            [fullRequest.converted_to_order]
          );
        }
      }

      const statusInfo = STATUS_INFO[productRequest.status] || { label: productRequest.status, description: '', icon: 'package', color: 'gray' };

      logger.http(`Tracking lookup (product request): ${tracking_number}`);

      return res.json({
        success: true,
        type: 'product_request',
        data: {
          request: productRequest,
          linkedOrder,
          tracking: trackingHistory,
          statusInfo,
          allStatuses: Object.entries(STATUS_INFO).map(([value, info]) => ({
            value,
            ...info,
            isCurrent: value === productRequest.status,
          })),
        }
      });
    }

    // 3. Search in service_requests table
    const serviceRequest = await db.getOne(
      `SELECT id, service_type, name, email, phone, whatsapp, company, details, message,
              status, tracking_number, admin_notes, price, created_at, updated_at
       FROM service_requests
       WHERE tracking_number = ? AND deleted_at IS NULL`,
      [tracking_number]
    );

    if (serviceRequest) {
      const trackingHistory = await db.getMany(
        `SELECT status, location, note, created_at
         FROM tracking
         WHERE tracking_number = ?
         ORDER BY created_at DESC`,
        [tracking_number]
      );

      // If converted, also fetch the linked order
      let linkedOrder = null;
      if (serviceRequest.status === 'completed') {
        const fullRequest = await db.getOne(
          `SELECT converted_order_id FROM service_requests WHERE id = ?`,
          [serviceRequest.id]
        );
        if (fullRequest && fullRequest.converted_order_id) {
          linkedOrder = await db.getOne(
            `SELECT order_number, status, tracking_number FROM orders WHERE id = ? AND deleted_at IS NULL`,
            [fullRequest.converted_order_id]
          );
        }
      }

      // Parse details JSON
      let parsedDetails = null;
      if (serviceRequest.details) {
        try { parsedDetails = JSON.parse(serviceRequest.details); } catch (e) { parsedDetails = serviceRequest.details; }
      }

      const statusInfo = STATUS_INFO[serviceRequest.status] || { label: serviceRequest.status, description: '', icon: 'package', color: 'gray' };

      logger.http(`Tracking lookup (service request): ${tracking_number}`);

      return res.json({
        success: true,
        type: 'service_request',
        data: {
          serviceRequest: { ...serviceRequest, parsedDetails },
          linkedOrder,
          tracking: trackingHistory,
          statusInfo,
          allStatuses: Object.entries(STATUS_INFO).map(([value, info]) => ({
            value,
            ...info,
            isCurrent: value === serviceRequest.status,
          })),
        }
      });
    }

    // Not found in any table
    return res.status(404).json({ 
      error: 'No shipment or request found with this tracking number' 
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

    if (settings) {
      settings.bankAccount = settings.bankAccount || null;
    }

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

    let countStr = "SELECT COUNT(*) as total FROM products WHERE status = 'active'";
    const countParams = [];

    if (category && category !== 'all') {
      countStr += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countStr += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await db.getOne(countStr, countParams);
    const total = countResult ? countResult.total : 0;
    const products = await db.getMany(queryStr, params);
    
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to get products'
    });
  }
});

// Public single-product endpoint - powers the product detail page
router.get('/products/:id', async (req, res) => {
  try {
    // Reject malformed IDs up-front - Postgres `id` is UUID and would otherwise
    // throw a type error that surfaces as a 500 instead of the intended 404.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await db.getOne(
      "SELECT id, product_code, name, category, price, moq, image, image2, image3, description, created_at FROM products WHERE id = ? AND status = 'active'",
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch up to 4 related products from the same category
    let related = [];
    if (product.category) {
      related = await db.getMany(
        "SELECT id, product_code, name, category, price, moq, image FROM products WHERE category = ? AND id != ? AND status = 'active' ORDER BY created_at DESC LIMIT 4",
        [product.category, product.id]
      );
    }

    res.set('Cache-Control', 'public, max-age=60');
    res.json({ success: true, data: product, related });
  } catch (error) {
    logger.error('Get product detail error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Public order creation endpoint
router.post('/orders', optionalAuth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('customerInfo').isObject().withMessage('Customer information is required'),
  body('shippingMethod').notEmpty().withMessage('Shipping method is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { items, status, customerInfo, payment, shippingMethod } = req.body;

    // Filter to valid-shape UUIDs before querying — Postgres `id` is UUID type
    // and would throw a 500 type error on malformed strings, which masks the
    // intended "Product not found" 400 response further down.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const productIds = items.map(item => item.productId).filter(id => id && UUID_RE.test(id));
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
    const orderNumber = `HB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2,5)}`;
    const trackingNumber = `TRK${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
    
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
    const customerId = (req.user && req.user.role === 'customer') ? req.user.id : null;
    
    await db.run(
      `INSERT INTO orders 
       (id, order_number, tracking_number, customer_name, customer_info, product_name, product_codes, items_info, quantity, shipping_method, price, status, payment_info, customer_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        paymentInfoJson,
        customerId
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
    
    const videos = await db.safeGetMany(
      'SELECT id, title, youtube_url, description, created_at FROM videos WHERE status = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
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

// Featured videos endpoint (for homepage)
router.get('/videos/featured', async (req, res) => {
  try {
    const videos = await db.safeGetMany(
      'SELECT id, title, youtube_url, description, created_at FROM videos WHERE status = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 6',
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

// Service Request submission (public)
router.post('/service-request', optionalAuth, (req, res, next) => {
  upload.array('images', MAX_FILES)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
}, [
  body('service_type').trim().notEmpty().withMessage('Service type is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      service_type,
      name,
      phone,
      whatsapp,
      email,
      company,
      details,
      message
    } = req.body;

    let imageJson = null;
    if (req.files && req.files.length > 0) {
      try {
        const urls = await uploadMultipleToCloudinary(req.files, 'hbtrade/service-requests');
        if (urls.length > 0) {
          imageJson = JSON.stringify(urls);
        }
      } catch (cloudErr) {
        logger.error('Cloudinary upload failed for service-request:', cloudErr);
      }
    }

    const id = uuidv4();
    const TRACKING_PREFIXES = {
      'product_sourcing': 'PS',
      'wholesale_supply': 'WS',
      'air_cargo': 'AC',
      'sea_shipping': 'SS',
      'hand_carry': 'HC',
      'canton_fair': 'CF',
    };
    const prefix = TRACKING_PREFIXES[service_type] || 'SR';
    const trackingNumber = `${prefix}${Date.now().toString().slice(-10)}`;
    let detailsJson = null;
    if (details) {
      try {
        const parsed = typeof details === 'string' ? JSON.parse(details) : details;
        detailsJson = JSON.stringify(parsed);
      } catch {
        detailsJson = typeof details === 'string' ? details : JSON.stringify(details);
      }
    }
    const customerId = (req.user && req.user.role === 'customer') ? req.user.id : null;

    await db.run(
      `INSERT INTO service_requests
       (id, service_type, name, phone, whatsapp, email, company, details, message, image, tracking_number, customer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, service_type, name, phone || null, whatsapp || null, email, company || null, detailsJson, message || null, imageJson, trackingNumber, customerId]
    );

    logger.info(`New service request: ${service_type} from ${email} - Tracking: ${trackingNumber}`);

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      data: { id, service_type, name, trackingNumber }
    });
  } catch (error) {
    logger.error('Service request error:', error);
    res.status(500).json({ error: 'Failed to submit service request' });
  }
});

// Track a service request (public)
router.get('/service-request/track/:tracking_number', async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const serviceRequest = await db.getOne(
      `SELECT id, service_type, name, email, phone, whatsapp, company, details, message,
              status, tracking_number, admin_notes, price, created_at, updated_at
       FROM service_requests
       WHERE tracking_number = ?`,
      [tracking_number]
    );

    if (!serviceRequest) {
      return res.status(404).json({ error: 'No service request found with this tracking number' });
    }

    const trackingHistory = await db.getMany(
      `SELECT status, location, note, created_at
       FROM tracking
       WHERE tracking_number = ?
       ORDER BY created_at DESC`,
      [tracking_number]
    );

    const SERVICE_STATUS_INFO = {
      'received': { label: 'Received', description: 'Your service request has been received. Our team will review it shortly.', icon: 'inbox', color: 'blue' },
      'in_progress': { label: 'In Progress', description: 'Our team is working on your service request.', icon: 'cog', color: 'yellow' },
      'completed': { label: 'Completed', description: 'Your service request has been completed successfully.', icon: 'check-circle', color: 'green' },
      'cancelled': { label: 'Cancelled', description: 'This service request has been cancelled.', icon: 'x-circle', color: 'red' },
    };

    const statusInfo = SERVICE_STATUS_INFO[serviceRequest.status] || { label: serviceRequest.status, description: '', icon: 'package', color: 'gray' };

    // Parse details JSON
    let parsedDetails = null;
    if (serviceRequest.details) {
      try {
        parsedDetails = JSON.parse(serviceRequest.details);
      } catch (e) {
        parsedDetails = serviceRequest.details;
      }
    }

    logger.http(`Service tracking lookup: ${tracking_number}`);

    res.json({
      success: true,
      data: {
        serviceRequest: { ...serviceRequest, parsedDetails },
        tracking: trackingHistory,
        statusInfo,
        allStatuses: Object.entries(SERVICE_STATUS_INFO).map(([value, info]) => ({
          value,
          ...info,
          isCurrent: value === serviceRequest.status,
        })),
      }
    });
  } catch (error) {
    logger.error('Service tracking error:', error);
    res.status(500).json({ error: 'Failed to track service request' });
  }
});

router.post('/event-registration', async (req, res) => {
  try {
    const {
      event_title,
      full_name,
      email,
      phone,
      whatsapp_number,
      passport_number,
      age,
      profession,
      division,
      district,
      business_type,
      business_name,
      business_certificate_number,
      passport_images,
      business_certificate_images,
      additional_message,
    } = req.body;

    if (!full_name || !email || !event_title) {
      return res.status(400).json({ error: 'Full name, email, and event title are required' });
    }

    const id = uuidv4();
    const passportImagesJson = passport_images ? JSON.stringify(passport_images) : null;
    const certificateImagesJson = business_certificate_images ? JSON.stringify(business_certificate_images) : null;

    await db.run(
      `INSERT INTO event_registrations 
        (id, event_title, full_name, email, phone, whatsapp_number, passport_number, age, profession, division, district, business_type, business_name, business_certificate_number, passport_images, business_certificate_images, additional_message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, event_title, full_name, email, phone || null, whatsapp_number || null, passport_number || null, age || null, profession || null, division || null, district || null, business_type || null, business_name || null, business_certificate_number || null, passportImagesJson, certificateImagesJson, additional_message || null, 'pending']
    );

    logger.info(`New event registration from: ${email} - ${event_title}`);

    res.status(201).json({
      success: true,
      message: 'Event registration submitted successfully',
      data: { id, event_title, full_name, email, status: 'pending' }
    });
  } catch (error) {
    logger.error('Event registration error:', error);
    res.status(500).json({ error: 'Failed to submit event registration' });
  }
});

module.exports = router;
