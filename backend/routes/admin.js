const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const db = require("../config/database");
const { protect, adminOnly, superAdminOnly, canDelete } = require("../middleware/auth");
const {
  handleValidationErrors,
  xssProtection,
} = require("../middleware/validation");
const { upload, handleUploadError } = require("../config/multer");
const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

router.use(xssProtection);
router.use(protect);
router.use(adminOnly);

// Get notification counts for admin sidebar badges
router.get("/notifications", async (req, res) => {
  try {
    // Count unread messages
    const unreadMessages = await db.getOne(
      "SELECT COUNT(*) as count FROM messages WHERE is_read = 0"
    );

    // Count pending product requests (not converted to order yet)
    const pendingRequests = await db.getOne(
      "SELECT COUNT(*) as count FROM product_requests WHERE status = 'pending'"
    );

    // Count pending orders
    const pendingOrders = await db.getOne(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );

    res.json({
      success: true,
      data: {
        messages: unreadMessages.count || 0,
        requests: pendingRequests.count || 0,
        orders: pendingOrders.count || 0,
        total: (unreadMessages.count || 0) + (pendingRequests.count || 0) + (pendingOrders.count || 0)
      }
    });
  } catch (error) {
    logger.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// Mark messages as read
router.put("/messages/mark-read", async (req, res) => {
  try {
    await db.run("UPDATE messages SET is_read = 1 WHERE is_read = 0");
    res.json({ success: true, message: "All messages marked as read" });
  } catch (error) {
    logger.error("Mark messages read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Get analytics data with filters
router.get("/analytics", async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = '';
    const dateParams = [];
    
    if (period === 'today') {
      dateFilter = "DATE(created_at) = DATE('now')";
    } else if (period === 'week') {
      dateFilter = "created_at >= datetime('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "created_at >= datetime('now', '-30 days')";
    } else if (period === 'year') {
      dateFilter = "created_at >= datetime('now', '-365 days')";
    } else if (startDate && endDate) {
      dateFilter = "created_at BETWEEN ? AND ?";
      dateParams.push(startDate, endDate);
    }

    const whereClause = dateFilter ? `WHERE ${dateFilter}` : '';

    // Get order counts by status
    const ordersByStatus = await db.getMany(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(price), 0) as total 
       FROM orders ${whereClause} 
       GROUP BY status`,
      dateParams
    );

    // Get total sales (delivered orders)
    const totalSalesResult = await db.getOne(
      `SELECT COALESCE(SUM(price), 0) as total, COUNT(*) as count 
       FROM orders 
       WHERE status = 'delivered' ${dateFilter ? `AND ${dateFilter}` : ''}`,
      dateParams
    );
    const totalSales = totalSalesResult || { total: 0, count: 0 };

    // Get pending orders value
    const pendingValueResult = await db.getOne(
      `SELECT COALESCE(SUM(price), 0) as total, COUNT(*) as count 
       FROM orders 
       WHERE status = 'pending' ${dateFilter ? `AND ${dateFilter}` : ''}`,
      dateParams
    );
    const pendingValue = pendingValueResult || { total: 0, count: 0 };

    // Get cancelled orders
    const cancelledOrdersResult = await db.getOne(
      `SELECT COALESCE(SUM(price), 0) as total, COUNT(*) as count 
       FROM orders 
       WHERE status = 'cancelled' ${dateFilter ? `AND ${dateFilter}` : ''}`,
      dateParams
    );
    const cancelledOrders = cancelledOrdersResult || { total: 0, count: 0 };

    // Get in-transit orders
    const inTransitOrdersResult = await db.getOne(
      `SELECT COALESCE(SUM(price), 0) as total, COUNT(*) as count 
       FROM orders 
       WHERE status IN ('shipped', 'in-transit') ${dateFilter ? `AND ${dateFilter}` : ''}`,
      dateParams
    );
    const inTransitOrders = inTransitOrdersResult || { total: 0, count: 0 };

    // Get processing orders
    const processingOrdersResult = await db.getOne(
      `SELECT COALESCE(SUM(price), 0) as total, COUNT(*) as count 
       FROM orders 
       WHERE status = 'processing' ${dateFilter ? `AND ${dateFilter}` : ''}`,
      dateParams
    );
    const processingOrders = processingOrdersResult || { total: 0, count: 0 };

    // Get daily sales for chart (last 30 days)
    const dailySales = await db.getMany(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(price), 0) as sales
       FROM orders 
       WHERE status != 'cancelled' AND created_at >= datetime('now', '-30 days')
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      []
    );

    // Get shipping method distribution
    const shippingMethods = await db.getMany(
      `SELECT shipping_method, COUNT(*) as count, COALESCE(SUM(price), 0) as total
       FROM orders 
       ${whereClause}
       GROUP BY shipping_method`,
      dateParams
    );

    // Get top products
    const topProducts = await db.getMany(
      `SELECT product_name, COUNT(*) as orders, COALESCE(SUM(price), 0) as revenue
       FROM orders 
       ${whereClause}
       GROUP BY product_name
       ORDER BY orders DESC
       LIMIT 10`,
      dateParams
    );

    // Calculate profit/loss (assuming 20% profit margin for demo)
    const totalRevenue = Number(totalSales.total) || 0;
    const estimatedProfit = totalRevenue * 0.2;
    const estimatedCost = totalRevenue * 0.8;

    res.json({
      success: true,
      data: {
        summary: {
          totalSales: totalRevenue,
          totalOrders: Number(totalSales.count) || 0,
          pendingOrders: Number(pendingValue.count) || 0,
          pendingValue: Number(pendingValue.total) || 0,
          processingOrders: Number(processingOrders.count) || 0,
          inTransitOrders: Number(inTransitOrders.count) || 0,
          cancelledOrders: Number(cancelledOrders.count) || 0,
          cancelledValue: Number(cancelledOrders.total) || 0,
          estimatedProfit,
          estimatedCost,
        },
        ordersByStatus: ordersByStatus || [],
        dailySales: dailySales || [],
        shippingMethods: shippingMethods || [],
        topProducts: topProducts || [],
      }
    });
  } catch (error) {
    logger.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const ordersCount = await db.getOne("SELECT COUNT(*) as count FROM orders");
    const requestsCount = await db.getOne(
      "SELECT COUNT(*) as count FROM product_requests",
    );
    const messagesCount = await db.getOne(
      "SELECT COUNT(*) as count FROM messages",
    );
    const unreadMessages = await db.getOne(
      "SELECT COUNT(*) as count FROM messages WHERE is_read = 0",
    );

    const pendingOrders = await db.getOne(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
    );

    const recentOrders = await db.getMany(
      `SELECT id, order_number, customer_name, product_name, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 5`,
    );

    const recentRequests = await db.getMany(
      `SELECT id, name, product_name, status, created_at 
       FROM product_requests 
       ORDER BY created_at DESC 
       LIMIT 5`,
    );

    const ordersByStatus = await db.getMany(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       GROUP BY status`,
    );

    const ordersByShipping = await db.getMany(
      `SELECT shipping_method, COUNT(*) as count 
       FROM orders 
       GROUP BY shipping_method`,
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: ordersCount.count,
          totalRequests: requestsCount.count,
          totalMessages: messagesCount.count,
          unreadMessages: unreadMessages.count,
          pendingOrders: pendingOrders.count,
        },
        recentOrders,
        recentRequests,
        ordersByStatus,
        ordersByShipping,
      },
    });
  } catch (error) {
    logger.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM orders WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    if (search) {
      queryStr +=
        " AND (order_number LIKE ? OR customer_name LIKE ? OR tracking_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const orders = await db.getMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM orders WHERE 1=1";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (search) {
      countQuery +=
        " AND (order_number LIKE ? OR customer_name LIKE ? OR tracking_number LIKE ?)";
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
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to get orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const tracking = await db.getMany(
      "SELECT * FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC",
      [order.tracking_number],
    );

    res.json({
      success: true,
      data: { ...order, tracking },
    });
  } catch (error) {
    logger.error("Get order error:", error);
    res.status(500).json({ error: "Failed to get order" });
  }
});

router.post(
  "/orders",
  [
    body("customer_name").notEmpty().withMessage("Customer name is required"),
    body("product_name").notEmpty().withMessage("Product name is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const {
        customer_name,
        product_name,
        quantity,
        shipping_method,
        price,
        status,
        tracking_number,
      } = req.body;

      const id = uuidv4();
      const orderNumber = `HB${Date.now().toString().slice(-8)}`;

      await db.run(
        `INSERT INTO orders 
       (id, order_number, customer_name, product_name, quantity, shipping_method, price, status, tracking_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          orderNumber,
          customer_name,
          product_name,
          quantity,
          shipping_method,
          price,
          status || "pending",
          tracking_number,
        ],
      );

      logger.info(`Order created: ${orderNumber} for ${customer_name}`);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: { id, order_number: orderNumber, customer_name, product_name },
      });
    } catch (error) {
      logger.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  },
);

router.put("/orders/:id", async (req, res) => {
  try {
    const {
      customer_name,
      product_name,
      quantity,
      shipping_method,
      price,
      status,
      tracking_number,
    } = req.body;

    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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
      [
        customer_name,
        product_name,
        quantity,
        shipping_method,
        price,
        status,
        tracking_number,
        req.params.id,
      ],
    );

    const updatedOrder = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    logger.info(`Order updated: ${order.order_number}`);

    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    logger.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/orders/:id", canDelete, async (req, res) => {
  try {
    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await db.run("DELETE FROM orders WHERE id = ?", [req.params.id]);

    logger.info(`Order deleted: ${order.order_number}`);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    logger.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

router.post(
  "/tracking",
  [
    body("tracking_number")
      .notEmpty()
      .withMessage("Tracking number is required"),
    body("status").notEmpty().withMessage("Status is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { tracking_number, status, location, note } = req.body;
      const id = uuidv4();

      await db.run(
        `INSERT INTO tracking (id, tracking_number, status, location, note) 
       VALUES (?, ?, ?, ?, ?)`,
        [id, tracking_number, status, location, note],
      );

      await db.run(`UPDATE orders SET status = ? WHERE tracking_number = ?`, [
        status,
        tracking_number,
      ]);

      logger.info(`Tracking update: ${tracking_number} - ${status}`);

      res.status(201).json({
        success: true,
        message: "Tracking added successfully",
        data: { id, tracking_number, status, location, note },
      });
    } catch (error) {
      logger.error("Add tracking error:", error);
      res.status(500).json({ error: "Failed to add tracking" });
    }
  },
);

router.get("/tracking/:tracking_number", async (req, res) => {
  try {
    const tracking = await db.getMany(
      "SELECT * FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC",
      [req.params.tracking_number],
    );

    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    logger.error("Get tracking error:", error);
    res.status(500).json({ error: "Failed to get tracking" });
  }
});

router.delete("/tracking/:id", canDelete, async (req, res) => {
  try {
    const tracking = await db.getOne("SELECT * FROM tracking WHERE id = ?", [
      req.params.id,
    ]);

    if (!tracking) {
      return res.status(404).json({ error: "Tracking entry not found" });
    }

    await db.run("DELETE FROM tracking WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Tracking entry deleted",
    });
  } catch (error) {
    logger.error("Delete tracking error:", error);
    res.status(500).json({ error: "Failed to delete tracking" });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM product_requests WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const requests = await db.getMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM product_requests WHERE 1=1";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
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
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get requests error:", error);
    res.status(500).json({ error: "Failed to get requests" });
  }
});

router.get("/requests/:id", async (req, res) => {
  try {
    const request = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id],
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    logger.error("Get request error:", error);
    res.status(500).json({ error: "Failed to get request" });
  }
});

router.put("/requests/:id", async (req, res) => {
  try {
    const { status, tracking_number } = req.body;

    const request = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id],
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Build update query dynamically based on what's provided
    let updateQuery = "UPDATE product_requests SET ";
    const updateParams = [];
    const updates = [];

    if (status !== undefined) {
      updates.push("status = ?");
      updateParams.push(status);
    }

    if (tracking_number !== undefined) {
      updates.push("tracking_number = ?");
      updateParams.push(tracking_number);
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: "No fields to update",
        data: request,
      });
    }

    updateQuery += updates.join(", ") + " WHERE id = ?";
    updateParams.push(req.params.id);

    await db.run(updateQuery, updateParams);

    const updatedRequest = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id],
    );

    logger.info(`Request updated: ${request.id} - Status: ${status} - Tracking: ${tracking_number}`);

    res.json({
      success: true,
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update request error details:", error);
    logger.error("Update request error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to update request", details: error.message });
  }
});

router.delete("/requests/:id", canDelete, async (req, res) => {
  try {
    const request = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id],
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    await db.run("DELETE FROM product_requests WHERE id = ?", [req.params.id]);

    logger.info(`Request deleted: ${request.id}`);

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    logger.error("Delete request error:", error);
    res.status(500).json({ error: "Failed to delete request" });
  }
});

// Convert product request to order
router.post("/requests/:id/convert-to-order", async (req, res) => {
  try {
    const { price, status = "processing" } = req.body;
    
    // Get the product request
    const request = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id]
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Generate order number and tracking number
    const orderNumber = `HB${Date.now().toString().slice(-8)}`;
    const trackingNumber = request.tracking_number || `TRK${Date.now().toString().slice(-10)}`;
    const orderId = uuidv4();

    // Create customer info JSON
    const customerInfo = JSON.stringify({
      name: request.name,
      email: request.email,
      phone: request.phone,
      whatsapp: request.whatsapp
    });

    // Map shipping method
    const shippingMethodMap = {
      'air-cargo': 'Air Cargo',
      'sea-shipping': 'Sea Shipping',
      'hand-carry': 'Hand Carry',
      'air': 'Air Cargo',
      'sea': 'Sea Freight',
      'hand': 'Hand Carry'
    };
    const shippingMethod = shippingMethodMap[request.shipping_method] || request.shipping_method || 'Not specified';

    // Insert into orders table
    await db.run(
      `INSERT INTO orders 
       (id, order_number, tracking_number, customer_name, customer_info, product_name, quantity, shipping_method, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderNumber,
        trackingNumber,
        request.name,
        customerInfo,
        request.product_name,
        request.quantity,
        shippingMethod,
        price || 0,
        status
      ]
    );

    // Update the product request status to 'converted'
    await db.run(
      "UPDATE product_requests SET status = 'converted' WHERE id = ?",
      [req.params.id]
    );

    // Get the created order
    const order = await db.getOne(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    logger.info(`Request ${request.id} converted to order ${orderNumber}`);

    res.status(201).json({
      success: true,
      message: "Request converted to order successfully",
      data: order
    });
  } catch (error) {
    logger.error("Convert to order error:", error);
    res.status(500).json({ error: "Failed to convert request to order" });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await db.getMany(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)],
    );

    const totalResult = await db.getOne(
      "SELECT COUNT(*) as count FROM messages",
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

router.put("/messages/:id/read", async (req, res) => {
  try {
    const message = await db.getOne("SELECT * FROM messages WHERE id = ?", [
      req.params.id,
    ]);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await db.run("UPDATE messages SET is_read = 1 WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    logger.error("Mark message read error:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

router.delete("/messages/:id", canDelete, async (req, res) => {
  try {
    const message = await db.getOne("SELECT * FROM messages WHERE id = ?", [
      req.params.id,
    ]);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await db.run("DELETE FROM messages WHERE id = ?", [req.params.id]);

    logger.info(`Message deleted: ${message.id}`);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    logger.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await db.getOne("SELECT * FROM settings LIMIT 1");

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error("Get settings error:", error);
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const {
      phone,
      email,
      whatsapp_link,
      facebook_page,
      facebook_group,
      office_address,
      company_name,
      bkash,
      nagad,
      bank_account,
      wechat,
      alipay,
      wechat_qr,
      alipay_qr,
    } = req.body;

    logger.info("Settings update request body:", req.body);
    logger.info("Bank account value:", bank_account);

    await db.run(
      `UPDATE settings 
       SET phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           whatsapp_link = COALESCE(?, whatsapp_link),
           facebook_page = COALESCE(?, facebook_page),
           facebook_group = COALESCE(?, facebook_group),
           office_address = COALESCE(?, office_address),
           company_name = COALESCE(?, company_name),
           bkash = COALESCE(?, bkash),
           nagad = COALESCE(?, nagad),
           bank_account = COALESCE(?, bank_account),
           wechat = COALESCE(?, wechat),
           alipay = COALESCE(?, alipay),
           wechat_qr = COALESCE(?, wechat_qr),
           alipay_qr = COALESCE(?, alipay_qr)
       WHERE id = (SELECT id FROM settings LIMIT 1)`,
      [
        phone,
        email,
        whatsapp_link,
        facebook_page,
        facebook_group,
        office_address,
        company_name,
        bkash,
        nagad,
        bank_account,
        wechat,
        alipay,
        wechat_qr,
        alipay_qr,
      ],
    );

    const updatedSettings = await db.getOne("SELECT * FROM settings LIMIT 1");
    logger.info("Updated settings bank_account:", updatedSettings?.bank_account);

    logger.info("Settings updated");

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    logger.error("Update settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

router.post(
  "/settings/qr-upload",
  upload.fields([
    { name: "wechat_qr", maxCount: 1 },
    { name: "alipay_qr", maxCount: 1 },
  ]),
  handleUploadError,
  async (req, res) => {
    try {
      logger.info("QR upload request received");
      logger.info("Files:", req.files);
      
      const fs = require('fs');
      const path = require('path');
      const updates = {};

      if (req.files && req.files.wechat_qr) {
        const filePath = req.files.wechat_qr[0].path;
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = `data:${req.files.wechat_qr[0].mimetype};base64,${fileBuffer.toString('base64')}`;
        updates.wechat_qr = base64;
        logger.info("WeChat QR converted to base64");
        fs.unlinkSync(filePath);
      }
      if (req.files && req.files.alipay_qr) {
        const filePath = req.files.alipay_qr[0].path;
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = `data:${req.files.alipay_qr[0].mimetype};base64,${fileBuffer.toString('base64')}`;
        updates.alipay_qr = base64;
        logger.info("Alipay QR converted to base64");
        fs.unlinkSync(filePath);
      }

      if (Object.keys(updates).length === 0) {
        logger.error("No files in request");
        return res.status(400).json({ error: "No files uploaded" });
      }

      const setClauses = [];
      const values = [];

      if (updates.wechat_qr) {
        setClauses.push("wechat_qr = ?");
        values.push(updates.wechat_qr);
      }
      if (updates.alipay_qr) {
        setClauses.push("alipay_qr = ?");
        values.push(updates.alipay_qr);
      }

      await db.run(
        `UPDATE settings SET ${setClauses.join(", ")} WHERE id = (SELECT id FROM settings LIMIT 1)`,
        values,
      );

      const updatedSettings = await db.getOne("SELECT * FROM settings LIMIT 1");
      logger.info("Updated settings with QR codes");

      res.json({
        success: true,
        message: "QR codes uploaded successfully",
        data: updatedSettings,
      });
    } catch (error) {
      logger.error("QR upload error:", error);
      res.status(500).json({ error: "Failed to upload QR codes" });
    }
  },
);

// Products CRUD routes
router.get("/products", async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    if (category && category !== "all") {
      queryStr += " AND category = ?";
      params.push(category);
    }

    if (search) {
      queryStr += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const products = await db.getMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM products WHERE 1=1";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (category && category !== "all") {
      countQuery += " AND category = ?";
      countParams.push(category);
    }

    if (search) {
      countQuery += " AND (name LIKE ? OR description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await db.getOne(countQuery, countParams);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get products error:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await db.getOne("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error("Get product error:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.post(
  "/products",
  [
    body("name").notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, category, price, moq, image, image2, image3, description, status } =
        req.body;

      const id = uuidv4();

      const productCode = `PROD-${Date.now().toString().slice(-5)}`;

      await db.run(
        `INSERT INTO products 
       (id, product_code, name, category, price, moq, image, image2, image3, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          productCode,
          name,
          category || null,
          price,
          moq || 1,
          image || null,
          image2 || null,
          image3 || null,
          description || null,
          status || "active",
        ],
      );

      logger.info(`Product created: ${name} - Code: ${productCode}`);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: {
          id,
          productCode,
          name,
          category,
          price,
          moq,
          image,
          image2,
          image3,
          description,
          status,
        },
      });
    } catch (error) {
      logger.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  },
);

router.put("/products/:id", async (req, res) => {
  try {
    const { name, category, price, moq, image, image2, image3, description, status } = req.body;

    const product = await db.getOne("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.run(
      `UPDATE products 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           price = COALESCE(?, price),
           moq = COALESCE(?, moq),
           image = COALESCE(?, image),
           image2 = ?,
           image3 = ?,
           description = COALESCE(?, description),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        name || null,
        category || null,
        price || null,
        moq || null,
        image || null,
        image2 || null,
        image3 || null,
        description || null,
        status || null,
        req.params.id,
      ],
    );

    const updatedProduct = await db.getOne(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id],
    );

    logger.info(`Product updated: ${product.name}`);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    logger.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", canDelete, async (req, res) => {
  try {
    const product = await db.getOne("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.run("DELETE FROM products WHERE id = ?", [req.params.id]);

    logger.info(`Product deleted: ${product.name}`);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Delete product error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ============ ADMIN MANAGEMENT (Super Admin Only) ============

// Get all admins
router.get("/admins", superAdminOnly, async (req, res) => {
  try {
    const admins = await db.getMany(
      "SELECT id, name, email, role, created_at FROM users WHERE role IN ('admin', 'super_admin') ORDER BY created_at DESC"
    );
    res.json({ success: true, data: admins });
  } catch (error) {
    logger.error("Get admins error:", error);
    res.status(500).json({ error: "Failed to get admins" });
  }
});

// Create new admin
router.post("/admins", superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await db.getOne(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(400).json({ error: "Invalid role. Must be 'admin' or 'super_admin'" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.run(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, hashedPassword, role]
    );

    logger.info(`New admin created: ${email} - Role: ${role}`);

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: { id, name, email, role }
    });
  } catch (error) {
    logger.error("Create admin error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// Update admin
router.put("/admins/:id", superAdminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const adminId = req.params.id;

    const admin = await db.getOne("SELECT * FROM users WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Validate role if provided
    if (role && role !== 'admin' && role !== 'super_admin') {
      return res.status(400).json({ error: "Invalid role" });
    }

    await db.run(
      "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?",
      [name, email, role, adminId]
    );

    const updatedAdmin = await db.getOne(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [adminId]
    );

    logger.info(`Admin updated: ${adminId}`);

    res.json({ success: true, message: "Admin updated successfully", data: updatedAdmin });
  } catch (error) {
    logger.error("Update admin error:", error);
    res.status(500).json({ error: "Failed to update admin" });
  }
});

// Delete admin
router.delete("/admins/:id", superAdminOnly, async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await db.getOne("SELECT * FROM users WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Prevent deleting yourself
    if (admin.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    await db.run("DELETE FROM users WHERE id = ?", [adminId]);

    logger.info(`Admin deleted: ${adminId}`);

    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    logger.error("Delete admin error:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

// Change admin password
router.put("/admins/:id/password", superAdminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.params.id;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const admin = await db.getOne("SELECT * FROM users WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, adminId]);

    logger.info(`Admin password changed: ${adminId}`);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error("Change admin password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;
