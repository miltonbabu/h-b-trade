const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors, xssProtection } = require('../middleware/validation');
const { upload, handleUploadError } = require('../config/multer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

router.use(xssProtection);
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', async (req, res) => {
  try {
    const ordersCount = await db.getOne('SELECT COUNT(*) as count FROM orders');
    const requestsCount = await db.getOne('SELECT COUNT(*) as count FROM product_requests');
    const messagesCount = await db.getOne('SELECT COUNT(*) as count FROM messages');
    const unreadMessages = await db.getOne('SELECT COUNT(*) as count FROM messages WHERE is_read = 0');
    
    const pendingOrders = await db.getOne(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );
    
    const recentOrders = await db.getMany(
      `SELECT id, order_number, customer_name, product_name, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 5`
    );
    
    const recentRequests = await db.getMany(
      `SELECT id, name, product_name, status, created_at 
       FROM product_requests 
       ORDER BY created_at DESC 
       LIMIT 5`
    );

    const ordersByStatus = await db.getMany(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       GROUP BY status`
    );

    const ordersByShipping = await db.getMany(
      `SELECT shipping_method, COUNT(*) as count 
       FROM orders 
       GROUP BY shipping_method`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: ordersCount.count,
          totalRequests: requestsCount.count,
          totalMessages: messagesCount.count,
          unreadMessages: unreadMessages.count,
          pendingOrders: pendingOrders.count
        },
        recentOrders,
        recentRequests,
        ordersByStatus,
        ordersByShipping
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryStr = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      queryStr += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      queryStr += ' AND (order_number LIKE ? OR customer_name LIKE ? OR tracking_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await db.getMany(queryStr, params);
    
    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (order_number LIKE ? OR customer_name LIKE ? OR tracking_number LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const totalResult = await db.getOne(countQuery, countParams);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await db.getOne(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const tracking = await db.getMany(
      'SELECT * FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC',
      [order.tracking_number]
    );

    res.json({
      success: true,
      data: { ...order, tracking }
    });
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.post('/orders', [
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('product_name').notEmpty().withMessage('Product name is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      customer_name,
      product_name,
      quantity,
      shipping_method,
      price,
      status,
      tracking_number
    } = req.body;

    const id = uuidv4();
    const orderNumber = `HB${Date.now().toString().slice(-8)}`;

    await db.run(
      `INSERT INTO orders 
       (id, order_number, customer_name, product_name, quantity, shipping_method, price, status, tracking_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderNumber, customer_name, product_name, quantity, shipping_method, price, status || 'pending', tracking_number]
    );

    logger.info(`Order created: ${orderNumber} for ${customer_name}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { id, order_number: orderNumber, customer_name, product_name }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const {
      customer_name,
      product_name,
      quantity,
      shipping_method,
      price,
      status,
      tracking_number
    } = req.body;

    const order = await db.getOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run(
      `UPDATE orders 
       SET customer_name = COALESCE(?, customer_name),
           product_name = COALESCE(?, product_name),
           quantity = COALESCE(?, quantity),
           shipping_method = COALESCE(?, shipping_method),
           price = COALESCE(?, price),
           status = COALESCE(?, status),
           tracking_number = COALESCE(?, tracking_number)
       WHERE id = ?`,
      [customer_name, product_name, quantity, shipping_method, price, status, tracking_number, req.params.id]
    );

    const updatedOrder = await db.getOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    logger.info(`Order updated: ${order.order_number}`);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    logger.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await db.getOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);

    logger.info(`Order deleted: ${order.order_number}`);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    logger.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.post('/tracking', [
  body('tracking_number').notEmpty().withMessage('Tracking number is required'),
  body('status').notEmpty().withMessage('Status is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { tracking_number, status, location, note } = req.body;
    const id = uuidv4();

    await db.run(
      `INSERT INTO tracking (id, tracking_number, status, location, note) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, tracking_number, status, location, note]
    );

    await db.run(
      `UPDATE orders SET status = ? WHERE tracking_number = ?`,
      [status, tracking_number]
    );

    logger.info(`Tracking update: ${tracking_number} - ${status}`);

    res.status(201).json({
      success: true,
      message: 'Tracking added successfully',
      data: { id, tracking_number, status, location, note }
    });
  } catch (error) {
    logger.error('Add tracking error:', error);
    res.status(500).json({ error: 'Failed to add tracking' });
  }
});

router.get('/tracking/:tracking_number', async (req, res) => {
  try {
    const tracking = await db.getMany(
      'SELECT * FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC',
      [req.params.tracking_number]
    );

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    logger.error('Get tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking' });
  }
});

router.delete('/tracking/:id', async (req, res) => {
  try {
    const tracking = await db.getOne('SELECT * FROM tracking WHERE id = ?', [req.params.id]);

    if (!tracking) {
      return res.status(404).json({ error: 'Tracking entry not found' });
    }

    await db.run('DELETE FROM tracking WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Tracking entry deleted'
    });
  } catch (error) {
    logger.error('Delete tracking error:', error);
    res.status(500).json({ error: 'Failed to delete tracking' });
  }
});

router.get('/requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryStr = 'SELECT * FROM product_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      queryStr += ' AND status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const requests = await db.getMany(queryStr, params);
    
    let countQuery = 'SELECT COUNT(*) as count FROM product_requests WHERE 1=1';
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const totalResult = await db.getOne(countQuery, countParams);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    });
  } catch (error) {
    logger.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

router.get('/requests/:id', async (req, res) => {
  try {
    const request = await db.getOne(
      'SELECT * FROM product_requests WHERE id = ?',
      [req.params.id]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    logger.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

router.put('/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const request = await db.getOne('SELECT * FROM product_requests WHERE id = ?', [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await db.run(
      'UPDATE product_requests SET status = COALESCE(?, status) WHERE id = ?',
      [status, req.params.id]
    );

    const updatedRequest = await db.getOne('SELECT * FROM product_requests WHERE id = ?', [req.params.id]);

    logger.info(`Request updated: ${request.id} - ${status}`);

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    logger.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await db.getOne('SELECT * FROM product_requests WHERE id = ?', [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await db.run('DELETE FROM product_requests WHERE id = ?', [req.params.id]);

    logger.info(`Request deleted: ${request.id}`);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    logger.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await db.getMany(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );

    const totalResult = await db.getOne('SELECT COUNT(*) as count FROM messages');

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

router.put('/messages/:id/read', async (req, res) => {
  try {
    const message = await db.getOne('SELECT * FROM messages WHERE id = ?', [req.params.id]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await db.getOne('SELECT * FROM messages WHERE id = ?', [req.params.id]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);

    logger.info(`Message deleted: ${message.id}`);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getOne('SELECT * FROM settings LIMIT 1');

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const {
      phone,
      email,
      whatsapp_link,
      facebook_page,
      facebook_group,
      office_address,
      company_name
    } = req.body;

    await db.run(
      `UPDATE settings 
       SET phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           whatsapp_link = COALESCE(?, whatsapp_link),
           facebook_page = COALESCE(?, facebook_page),
           facebook_group = COALESCE(?, facebook_group),
           office_address = COALESCE(?, office_address),
           company_name = COALESCE(?, company_name)
       WHERE id = 'settings-1'`,
      [phone, email, whatsapp_link, facebook_page, facebook_group, office_address, company_name]
    );

    const updatedSettings = await db.getOne('SELECT * FROM settings LIMIT 1');

    logger.info('Settings updated');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
