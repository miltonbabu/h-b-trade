const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const db = require("../config/database");
const { getDateSQL, safeGetMany, safeGetOne } = db;
const { protect, adminOnly, superAdminOnly, canDelete } = require("../middleware/auth");

router.use(protect, adminOnly);
const {
  handleValidationErrors,
  xssProtection,
} = require("../middleware/validation");
const { upload, handleUploadError } = require("../config/multer");
const { uploadToCloudinary } = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const logger = require("../config/logger");

const ORDER_STATUS_SEQUENCE = [
  { value: 'pending', label: 'Pending', description: 'Order received, awaiting processing' },
  { value: 'processing', label: 'Processing', description: 'Order is being prepared' },
  { value: 'guangzhou_warehouse', label: 'Guangzhou Warehouse Received', description: 'Package received at Guangzhou warehouse' },
  { value: 'in_transit', label: 'In Transit', description: 'Package is in transit to Bangladesh' },
  { value: 'dhaka_customs', label: 'Dhaka Customs Clearance', description: 'Package is at Dhaka customs' },
  { value: 'dhaka_office', label: 'Dhaka Office', description: 'Package arrived at Dhaka office' },
  { value: 'delivered', label: 'Delivered To Customer', description: 'Package delivered to customer' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order cancelled' },
];

const STATUS_TRANSITIONS = {
  'pending': ['processing', 'cancelled'],
  'processing': ['guangzhou_warehouse', 'cancelled'],
  'guangzhou_warehouse': ['in_transit', 'cancelled'],
  'in_transit': ['dhaka_customs', 'cancelled'],
  'dhaka_customs': ['dhaka_office', 'cancelled'],
  'dhaka_office': ['delivered', 'cancelled'],
  'delivered': [],
  'cancelled': [],
};

const STATUS_LOCATION_MAP = {
  'pending': 'System',
  'processing': 'Processing Center',
  'guangzhou_warehouse': 'Guangzhou, China',
  'in_transit': 'In Transit',
  'dhaka_customs': 'Dhaka Customs, Bangladesh',
  'dhaka_office': 'Dhaka Office, Bangladesh',
  'delivered': 'Customer Location',
  'cancelled': 'System',
};

const STATUS_DESCRIPTIONS = {
  'pending': 'Your order has been received and is awaiting processing. We will begin preparing your items shortly.',
  'processing': 'Your order is being processed. We are preparing your items for shipment.',
  'guangzhou_warehouse': 'Your package has been received at our Guangzhou warehouse in China and is ready for international shipping.',
  'in_transit': 'Your package is in transit from China to Bangladesh. Estimated transit time varies by shipping method.',
  'dhaka_customs': 'Your package has arrived in Dhaka and is currently going through customs clearance. This process typically takes 2-5 business days.',
  'dhaka_office': 'Your package has cleared customs and is now at our Dhaka office. You will be contacted for delivery arrangements.',
  'delivered': 'Your package has been successfully delivered. Thank you for choosing H&B Trade!',
  'cancelled': 'This order has been cancelled. Please contact support for more information.',
};

function isValidTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

function getNextStatus(currentStatus) {
  const currentIndex = ORDER_STATUS_SEQUENCE.findIndex(s => s.value === currentStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_SEQUENCE.length - 2) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[currentIndex + 1];
}

router.use(xssProtection);
router.use(protect);
router.use(adminOnly);

router.get("/order-statuses", (req, res) => {
  res.json({
    success: true,
    data: {
      statuses: ORDER_STATUS_SEQUENCE,
      transitions: STATUS_TRANSITIONS,
      descriptions: STATUS_DESCRIPTIONS,
      locations: STATUS_LOCATION_MAP,
    },
  });
});

router.get("/notifications", async (req, res) => {
  try {
    const unreadMessages = await safeGetOne(
      "SELECT COUNT(*) as count FROM messages WHERE is_read = FALSE AND deleted_at IS NULL"
    );
    const pendingRequests = await safeGetOne(
      "SELECT COUNT(*) as count FROM product_requests WHERE status = 'pending' AND deleted_at IS NULL"
    );
    const pendingServiceRequests = await safeGetOne(
      "SELECT COUNT(*) as count FROM service_requests WHERE status = 'received' AND deleted_at IS NULL"
    );
    const pendingOrders = await safeGetOne(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending' AND deleted_at IS NULL"
    );

    res.json({
      success: true,
      data: {
        messages: unreadMessages?.count || 0,
        requests: pendingRequests?.count || 0,
        serviceRequests: pendingServiceRequests?.count || 0,
        orders: pendingOrders?.count || 0,
        total: (unreadMessages?.count || 0) + (pendingRequests?.count || 0) + (pendingServiceRequests?.count || 0) + (pendingOrders?.count || 0)
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
    await db.run("UPDATE messages SET is_read = TRUE WHERE is_read = FALSE");
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
      dateFilter = `${getDateSQL.date}(created_at) = ${getDateSQL.today}`;
    } else if (period === 'week') {
      dateFilter = `created_at >= ${getDateSQL.daysAgo(7)}`;
    } else if (period === 'month') {
      dateFilter = `created_at >= ${getDateSQL.daysAgo(30)}`;
    } else if (period === 'year') {
      dateFilter = `created_at >= ${getDateSQL.daysAgo(365)}`;
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
      `SELECT ${getDateSQL.date}(created_at) as date, COUNT(*) as orders, COALESCE(SUM(price), 0) as sales
       FROM orders
       WHERE status != 'cancelled' AND created_at >= ${getDateSQL.daysAgo(30)}
       GROUP BY ${getDateSQL.date}(created_at)
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
    const ordersCount = await safeGetOne("SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL");
    const requestsCount = await safeGetOne(
      "SELECT COUNT(*) as count FROM product_requests WHERE deleted_at IS NULL",
    );
    const serviceRequestsCount = await safeGetOne(
      "SELECT COUNT(*) as count FROM service_requests WHERE deleted_at IS NULL",
    );
    const messagesCount = await safeGetOne(
      "SELECT COUNT(*) as count FROM messages WHERE deleted_at IS NULL",
    );
    const unreadMessages = await safeGetOne(
      "SELECT COUNT(*) as count FROM messages WHERE is_read = FALSE AND deleted_at IS NULL",
    );

    const pendingOrders = await safeGetOne(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending' AND deleted_at IS NULL",
    );

    const recentOrders = await safeGetMany(
      `SELECT id, order_number, customer_name, product_name, status, created_at
       FROM orders
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5`,
    );

    const recentRequests = await safeGetMany(
      `SELECT id, name, product_name, status, created_at
       FROM product_requests
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5`,
    );

    const recentServiceRequests = await safeGetMany(
      `SELECT id, service_type, name, status, tracking_number, created_at
       FROM service_requests
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5`,
    );

    const ordersByStatus = await safeGetMany(
      `SELECT status, COUNT(*) as count
       FROM orders
       WHERE deleted_at IS NULL
       GROUP BY status`,
    );

    const ordersByShipping = await safeGetMany(
      `SELECT shipping_method, COUNT(*) as count
       FROM orders
       WHERE deleted_at IS NULL
       GROUP BY shipping_method`,
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: ordersCount.count,
          totalRequests: requestsCount.count,
          totalServiceRequests: serviceRequestsCount.count,
          totalMessages: messagesCount.count,
          unreadMessages: unreadMessages.count,
          pendingOrders: pendingOrders.count,
        },
        recentOrders,
        recentRequests,
        recentServiceRequests,
        ordersByStatus,
        ordersByShipping,
      },
    });
  } catch (error) {
    logger.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter = '';
    const dateParams = [];

    if (period === 'today') {
      dateFilter = ` AND DATE(created_at) = DATE('now')`;
    } else if (period === 'week') {
      dateFilter = ` AND created_at >= DATE('now', '-7 days')`;
    } else if (period === 'month') {
      dateFilter = ` AND created_at >= DATE('now', '-30 days')`;
    } else if (period === 'year') {
      dateFilter = ` AND created_at >= DATE('now', '-365 days')`;
    }

    const totalSales = await safeGetOne(`SELECT COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as total FROM orders WHERE status = 'delivered' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const totalDelivered = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE status = 'delivered' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const totalOrders = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL${dateFilter}`, dateParams);
    const pendingOrders = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const pendingValue = await safeGetOne(`SELECT COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as total FROM orders WHERE status = 'pending' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const processingOrders = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE status = 'processing' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const inTransitOrders = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE status IN ('in_transit', 'guangzhou_warehouse', 'dhaka_customs', 'dhaka_office') AND deleted_at IS NULL${dateFilter}`, dateParams);
    const cancelledOrders = await safeGetOne(`SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled' AND deleted_at IS NULL${dateFilter}`, dateParams);
    const cancelledValue = await safeGetOne(`SELECT COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as total FROM orders WHERE status = 'cancelled' AND deleted_at IS NULL${dateFilter}`, dateParams);

    const totalRequests = await safeGetOne(`SELECT COUNT(*) as count FROM product_requests WHERE deleted_at IS NULL${dateFilter}`, dateParams);
    const totalServiceRequests = await safeGetOne(`SELECT COUNT(*) as count FROM service_requests WHERE deleted_at IS NULL${dateFilter}`, dateParams);
    const unreadMessages = await safeGetOne(`SELECT COUNT(*) as count FROM messages WHERE is_read = FALSE AND deleted_at IS NULL`);

    const totalSalesVal = Number(totalSales.total) || 0;
    const estimatedProfit = Math.round(totalSalesVal * 0.2);
    const estimatedCost = totalSalesVal - estimatedProfit;

    const ordersByStatus = await safeGetMany(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as total
      FROM orders
      WHERE deleted_at IS NULL${dateFilter}
      GROUP BY status
    `, dateParams);

    const dailySales = await safeGetMany(`
      SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as sales
      FROM orders
      WHERE deleted_at IS NULL${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, dateParams);

    const shippingMethods = await safeGetMany(`
      SELECT shipping_method, COUNT(*) as count, COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as total
      FROM orders
      WHERE deleted_at IS NULL${dateFilter}
      GROUP BY shipping_method
    `, dateParams);

    const topProducts = await safeGetMany(`
      SELECT product_name, COUNT(*) as orders, COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as revenue
      FROM orders
      WHERE deleted_at IS NULL${dateFilter}
      GROUP BY product_name
      ORDER BY revenue DESC
      LIMIT 10
    `, dateParams);

    const topCustomers = await safeGetMany(`
      SELECT customer_name, COUNT(*) as orders, COALESCE(SUM(COALESCE(total_amount, price, 0)), 0) as revenue
      FROM orders
      WHERE deleted_at IS NULL${dateFilter}
      GROUP BY customer_name
      ORDER BY revenue DESC
      LIMIT 10
    `, dateParams);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales: totalSalesVal,
          totalOrders: Number(totalDelivered.count) || 0,
          allOrders: Number(totalOrders.count) || 0,
          pendingOrders: Number(pendingOrders.count) || 0,
          pendingValue: Number(pendingValue.total) || 0,
          processingOrders: Number(processingOrders.count) || 0,
          inTransitOrders: Number(inTransitOrders.count) || 0,
          cancelledOrders: Number(cancelledOrders.count) || 0,
          cancelledValue: Number(cancelledValue.total) || 0,
          estimatedProfit,
          estimatedCost,
          totalRequests: Number(totalRequests.count) || 0,
          totalServiceRequests: Number(totalServiceRequests.count) || 0,
          unreadMessages: Number(unreadMessages.count) || 0,
        },
        ordersByStatus,
        dailySales,
        shippingMethods,
        topProducts,
        topCustomers,
      },
    });
  } catch (error) {
    logger.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to get analytics data" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM orders WHERE deleted_at IS NULL";
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

    const orders = await safeGetMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL";
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

    const totalResult = await safeGetOne(countQuery, countParams);

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
        net_weight,
        status,
        tracking_number,
      } = req.body;

      const id = uuidv4();
      const orderNumber = `HB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2,5)}`;

      await db.run(
        `INSERT INTO orders 
       (id, order_number, customer_name, product_name, quantity, shipping_method, price, net_weight, status, tracking_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          orderNumber,
          customer_name,
          product_name,
          quantity,
          shipping_method,
          price,
          net_weight,
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

router.put("/orders/:id", [
  body("customer_name").optional().trim(),
  body("product_name").optional().trim(),
  body("price").optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("status").optional().isIn(['pending', 'processing', 'guangzhou_warehouse', 'in_transit', 'dhaka_customs', 'dhaka_office', 'delivered', 'cancelled']).withMessage("Invalid status"),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      customer_name,
      product_name,
      quantity,
      shipping_method,
      price,
      net_weight,
      status,
      tracking_number,
      location,
      note,
      notes,
      product_link,
    } = req.body;

    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Resolve effective tracking number: explicit from request > existing on order > auto-generate
    const effectiveTrackingNumber = tracking_number || order.tracking_number ||
      (status && status !== order.status
        ? `TRK${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2, 5)}`
        : null);

    if (status && status !== order.status) {
      const resolvedLocation = location || STATUS_LOCATION_MAP[status] || 'System';
      const historyNote = note ?? null;
      const trackingNote = note || STATUS_DESCRIPTIONS[status] || '';
      const changedBy = req.user?.id ?? null;

      const historyId = uuidv4();
      await db.run(
        `INSERT INTO status_history (id, order_id, tracking_number, old_status, new_status, location, note, changed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [historyId, order.id, effectiveTrackingNumber ?? null, order.status ?? null, status, resolvedLocation, historyNote, changedBy],
      );

      if (effectiveTrackingNumber) {
        await db.run(
          `INSERT INTO tracking (id, tracking_number, status, location, note)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), effectiveTrackingNumber, status, resolvedLocation, trackingNote],
        );
      }
    }

    await db.run(
      `UPDATE orders
       SET customer_name = COALESCE(?, customer_name),
           product_name = COALESCE(?, product_name),
           quantity = COALESCE(?, quantity),
           shipping_method = COALESCE(?, shipping_method),
           price = COALESCE(?, price),
           net_weight = COALESCE(?, net_weight),
           status = COALESCE(?, status),
           tracking_number = COALESCE(?, tracking_number),
           notes = COALESCE(?, notes),
           product_link = COALESCE(?, product_link),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        customer_name ?? null,
        product_name ?? null,
        quantity ?? null,
        shipping_method ?? null,
        price ?? null,
        net_weight ?? null,
        status ?? null,
        effectiveTrackingNumber ?? null,
        notes !== undefined ? notes : null,
        product_link !== undefined ? product_link : null,
        req.params.id,
      ],
    );

    const updatedOrder = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    logger.info(`Order updated: ${order.order_number} - Status: ${order.status} → ${status || order.status}`);

    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    logger.error("Update order error: " + (error && error.message ? error.message : error));
    if (error && error.stack) logger.error(error.stack);
    res.status(500).json({ error: "Failed to update order", detail: error && error.message });
  }
});

router.delete("/orders/:id", canDelete, async (req, res) => {
  try {
    const order = await safeGetOne("SELECT * FROM orders WHERE id = ? AND deleted_at IS NULL", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.tracking_number) {
      await db.run("DELETE FROM tracking WHERE tracking_number = ?", [order.tracking_number]);
    }
    await db.run("DELETE FROM status_history WHERE order_id = ?", [req.params.id]);
    await db.softDelete('orders', req.params.id);

    logger.info(`Order soft-deleted: ${order.order_number}`);

    res.json({
      success: true,
      message: "Order moved to trash successfully",
      softDeleted: true,
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
      
      const order = await db.getOne(
        "SELECT * FROM orders WHERE tracking_number = ?",
        [tracking_number]
      );
      
      // Admin can freely set any status; no transition enforcement on this endpoint
      
      const id = uuidv4();

      await db.run(
        `INSERT INTO tracking (id, tracking_number, status, location, note) 
       VALUES (?, ?, ?, ?, ?)`,
        [id, tracking_number, status, location || STATUS_LOCATION_MAP[status], note || STATUS_DESCRIPTIONS[status]],
      );

      if (order) {
        const historyId = uuidv4();
        await db.run(
          `INSERT INTO status_history (id, order_id, tracking_number, old_status, new_status, location, note, changed_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [historyId, order.id, tracking_number, order.status, status, location || STATUS_LOCATION_MAP[status], note || null, req.user?.id || null],
        );
      }

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

router.get("/orders/:id/history", async (req, res) => {
  try {
    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const history = await db.getMany(
      `SELECT sh.*, u.name as changed_by_name 
       FROM status_history sh 
       LEFT JOIN users u ON sh.changed_by = u.id
       WHERE sh.order_id = ? 
       ORDER BY sh.created_at DESC`,
      [req.params.id],
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error("Get status history error:", error);
    res.status(500).json({ error: "Failed to get status history" });
  }
});

router.get("/tracking-all", async (req, res) => {
  try {
    const { search, source, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = `SELECT t.* FROM tracking t WHERE t.deleted_at IS NULL`;
    const params = [];

    if (search) {
      queryStr += ` AND (t.tracking_number LIKE ? OR t.status LIKE ? OR t.location LIKE ? OR t.note LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (source && source !== 'all') {
      if (source === 'order') {
        queryStr += ` AND EXISTS (SELECT 1 FROM orders o WHERE o.tracking_number = t.tracking_number AND o.deleted_at IS NULL)`;
      } else if (source === 'request') {
        queryStr += ` AND EXISTS (SELECT 1 FROM product_requests pr WHERE pr.tracking_number = t.tracking_number AND pr.deleted_at IS NULL)`;
      } else if (source === 'service-request') {
        queryStr += ` AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.tracking_number = t.tracking_number AND sr.deleted_at IS NULL)`;
      } else if (source === 'custom') {
        queryStr += ` AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.tracking_number = t.tracking_number)`;
        queryStr += ` AND NOT EXISTS (SELECT 1 FROM product_requests pr WHERE pr.tracking_number = t.tracking_number)`;
        queryStr += ` AND NOT EXISTS (SELECT 1 FROM service_requests sr WHERE sr.tracking_number = t.tracking_number)`;
      }
    }

    queryStr += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const trackingEntries = await safeGetMany(queryStr, params);

    const enriched = await Promise.all(trackingEntries.map(async (t) => {
      const order = await safeGetOne("SELECT id, order_number, customer_name, product_name, product_codes, status FROM orders WHERE tracking_number = ? AND deleted_at IS NULL", [t.tracking_number]);
      if (order) {
        return { ...t, source_type: 'order', source_number: order.order_number, customer_name: order.customer_name, product_name: order.product_name, product_codes: order.product_codes, source_status: order.status };
      }
      const pr = await safeGetOne("SELECT id, name, product_name, status FROM product_requests WHERE tracking_number = ? AND deleted_at IS NULL", [t.tracking_number]);
      if (pr) {
        return { ...t, source_type: 'request', source_number: `REQ-${pr.id.slice(0, 8)}`, customer_name: pr.name, product_name: pr.product_name, product_codes: '', source_status: pr.status };
      }
      const sr = await safeGetOne("SELECT id, name, service_type, status FROM service_requests WHERE tracking_number = ? AND deleted_at IS NULL", [t.tracking_number]);
      if (sr) {
        return { ...t, source_type: 'service-request', source_number: `SR-${sr.id.slice(0, 8)}`, customer_name: sr.name, product_name: sr.service_type, product_codes: '', source_status: sr.status };
      }
      return { ...t, source_type: 'custom', source_number: t.tracking_number, customer_name: '', product_name: '', product_codes: '', source_status: '' };
    }));

    let countQuery = "SELECT COUNT(*) as count FROM tracking t WHERE t.deleted_at IS NULL";
    const countParams = [];

    if (search) {
      countQuery += ` AND (t.tracking_number LIKE ? OR t.status LIKE ? OR t.location LIKE ? OR t.note LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (source && source !== 'all') {
      if (source === 'order') {
        countQuery += ` AND EXISTS (SELECT 1 FROM orders o WHERE o.tracking_number = t.tracking_number AND o.deleted_at IS NULL)`;
      } else if (source === 'request') {
        countQuery += ` AND EXISTS (SELECT 1 FROM product_requests pr WHERE pr.tracking_number = t.tracking_number AND pr.deleted_at IS NULL)`;
      } else if (source === 'service-request') {
        countQuery += ` AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.tracking_number = t.tracking_number AND sr.deleted_at IS NULL)`;
      } else if (source === 'custom') {
        countQuery += ` AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.tracking_number = t.tracking_number)`;
        countQuery += ` AND NOT EXISTS (SELECT 1 FROM product_requests pr WHERE pr.tracking_number = t.tracking_number)`;
        countQuery += ` AND NOT EXISTS (SELECT 1 FROM service_requests sr WHERE sr.tracking_number = t.tracking_number)`;
      }
    }

    const totalResult = await safeGetOne(countQuery, countParams);

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get all tracking error:", error);
    res.status(500).json({ error: "Failed to get tracking entries" });
  }
});

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

router.delete("/tracking/:id", async (req, res) => {
  try {
    const tracking = await safeGetOne("SELECT * FROM tracking WHERE id = ?", [
      req.params.id,
    ]);

    if (!tracking) {
      return res.status(404).json({ error: "Tracking entry not found" });
    }

    await db.run("DELETE FROM tracking WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Tracking entry deleted permanently",
    });
  } catch (error) {
    logger.error("Delete tracking error:", error);
    res.status(500).json({ error: "Failed to delete tracking" });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM product_requests WHERE deleted_at IS NULL";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    if (search) {
      queryStr += " AND (name LIKE ? OR email LIKE ? OR product_name LIKE ? OR company LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const requests = await safeGetMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM product_requests WHERE deleted_at IS NULL";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (search) {
      countQuery += " AND (name LIKE ? OR email LIKE ? OR product_name LIKE ? OR company LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const totalResult = await safeGetOne(countQuery, countParams);

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
    const request = await db.getOne(
      "SELECT * FROM product_requests WHERE id = ?",
      [req.params.id],
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const allowedFields = [
      'name', 'phone', 'whatsapp', 'email', 'company',
      'product_name', 'product_link', 'target_price', 'quantity',
      'packaging_type', 'pack_quantity', 'master_pack_quantity',
      'pack_dimensions', 'weight_per_pack', 'sample_needed',
      'shipping_method', 'specifications', 'message',
      'status', 'tracking_number'
    ];

    const updates = [];
    const updateParams = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        updateParams.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: "No fields to update", data: request });
    }

    updateParams.push(req.params.id);
    await db.run(`UPDATE product_requests SET ${updates.join(", ")} WHERE id = ?`, updateParams);

    const updatedRequest = await db.getOne("SELECT * FROM product_requests WHERE id = ?", [req.params.id]);
    logger.info(`Product request updated: ${req.params.id}`);

    res.json({ success: true, message: "Request updated successfully", data: updatedRequest });
  } catch (error) {
    logger.error("Update request error:", error);
    res.status(500).json({ error: "Failed to update request" });
  }
});

router.delete("/requests/:id", canDelete, async (req, res) => {
  try {
    const request = await safeGetOne(
      "SELECT * FROM product_requests WHERE id = ? AND deleted_at IS NULL",
      [req.params.id],
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.tracking_number) {
      await db.run("DELETE FROM tracking WHERE tracking_number = ?", [request.tracking_number]);
    }
    await db.softDelete('product_requests', req.params.id);

    logger.info(`Request soft-deleted: ${request.id}`);

    res.json({
      success: true,
      message: "Request moved to trash successfully",
      softDeleted: true,
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

    // Generate order number, keep original tracking number so user can still track
    const orderNumber = `HB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2,5)}`;
    const trackingNumber = request.tracking_number || `PR${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
    const orderId = uuidv4();

    // Create customer info JSON
    const customerInfo = JSON.stringify({
      name: request.name,
      email: request.email,
      phone: request.phone,
      whatsapp: request.whatsapp,
      company: request.company
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

    // Build items_info with all request details for full visibility
    let itemsInfo = null;
    const detailsFields = ['product_name', 'product_link', 'target_price', 'quantity',
      'packaging_type', 'pack_quantity', 'master_pack_quantity', 'pack_dimensions',
      'weight_per_pack', 'sample_needed', 'shipping_method', 'specifications',
      'message', 'image'];
    const hasDetails = detailsFields.some(f => request[f]);
    if (hasDetails) {
      const items = {};
      detailsFields.forEach(f => { if (request[f]) items[f] = request[f]; });
      if (Object.keys(items).length > 0) itemsInfo = JSON.stringify(items);
    }

    // Insert into orders table
    await db.run(
      `INSERT INTO orders
       (id, order_number, tracking_number, customer_name, customer_info, product_name, quantity, shipping_method, price, status, items_info, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderNumber,
        trackingNumber,
        request.name,
        customerInfo,
        request.product_name || 'Product Request',
        request.quantity || '1',
        shippingMethod,
        price || 0,
        status,
        itemsInfo,
        request.message || null
      ]
    );

    // Update the product request status to 'converted' and link to order
    await db.run(
      "UPDATE product_requests SET status = 'converted', converted_to_order = ? WHERE id = ?",
      [orderId, req.params.id]
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

    const messages = await safeGetMany(
      "SELECT * FROM messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)],
    );

    const totalResult = await safeGetOne(
      "SELECT COUNT(*) as count FROM messages WHERE deleted_at IS NULL",
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

    await db.run("UPDATE messages SET is_read = TRUE WHERE id = ?", [
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
    const message = await safeGetOne("SELECT * FROM messages WHERE id = ? AND deleted_at IS NULL", [
      req.params.id,
    ]);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await db.softDelete('messages', req.params.id);

    logger.info(`Message soft-deleted: ${message.id}`);

    res.json({
      success: true,
      message: "Message moved to trash successfully",
      softDeleted: true,
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

router.put("/settings", [
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("company_name").optional().trim(),
  handleValidationErrors
], async (req, res) => {
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

    const toNull = (v) => (v === undefined || v === null || v === '') ? null : v;

    const fields = {
      phone: toNull(phone),
      email: toNull(email),
      whatsapp_link: toNull(whatsapp_link),
      facebook_page: toNull(facebook_page),
      facebook_group: toNull(facebook_group),
      office_address: toNull(office_address),
      company_name: toNull(company_name),
      bkash: toNull(bkash),
      nagad: toNull(nagad),
      bank_account: toNull(bank_account),
      wechat: toNull(wechat),
      alipay: toNull(alipay),
      wechat_qr: toNull(wechat_qr),
      alipay_qr: toNull(alipay_qr),
    };

    const setClauses = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    await db.run(
      `UPDATE settings SET ${setClauses} WHERE id = (SELECT id FROM settings LIMIT 1)`,
      values,
    );

    const updatedSettings = await db.getOne("SELECT * FROM settings LIMIT 1");
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
      const updates = {};

      if (req.files && req.files.wechat_qr) {
        try {
          const result = await uploadToCloudinary(req.files.wechat_qr[0].buffer, 'hbtrade/qr-codes');
          updates.wechat_qr = result.secure_url;
          logger.info("WeChat QR uploaded to Cloudinary:", result.secure_url);
        } catch (cloudErr) {
          logger.error("Cloudinary upload failed for wechat_qr:", cloudErr);
          return res.status(500).json({ error: "Failed to upload WeChat QR to Cloudinary" });
        }
      }
      if (req.files && req.files.alipay_qr) {
        try {
          const result = await uploadToCloudinary(req.files.alipay_qr[0].buffer, 'hbtrade/qr-codes');
          updates.alipay_qr = result.secure_url;
          logger.info("Alipay QR uploaded to Cloudinary:", result.secure_url);
        } catch (cloudErr) {
          logger.error("Cloudinary upload failed for alipay_qr:", cloudErr);
          return res.status(500).json({ error: "Failed to upload Alipay QR to Cloudinary" });
        }
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
      logger.info("Updated settings with QR codes (Cloudinary URLs)");

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

/* Generic image upload — uploads a single file to Cloudinary and returns the
   secure URL. Used by the admin Products page so admins can pick a file from
   their computer instead of pasting a URL. Accepts ?folder=hbtrade/products
   so callers can sub-organize their assets in Cloudinary. */
router.post(
  "/upload",
  upload.single("file"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const folder = String(req.query.folder || req.body.folder || "hbtrade/uploads").replace(/[^a-z0-9_\-\/]/gi, "");
      const result = await uploadToCloudinary(req.file.buffer, folder);
      logger.info(`Cloudinary upload OK: ${result.secure_url} (folder=${folder})`);
      res.status(201).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      logger.error("Upload error:", error && error.message ? error.message : error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  },
);

// Products CRUD routes
router.get("/products", async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM products WHERE deleted_at IS NULL";
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

    const products = await safeGetMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL";
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

    const totalResult = await safeGetOne(countQuery, countParams);

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

router.put("/products/:id", [
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("moq").optional().isInt({ min: 1 }).withMessage("MOQ must be a positive integer"),
  body("status").optional().isIn(['active', 'inactive']).withMessage("Invalid status"),
  handleValidationErrors
], async (req, res) => {
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
    const product = await safeGetOne("SELECT * FROM products WHERE id = ? AND deleted_at IS NULL", [
      req.params.id,
    ]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.softDelete('products', req.params.id);

    logger.info(`Product soft-deleted: ${product.name}`);

    res.json({
      success: true,
      message: "Product moved to trash successfully",
      softDeleted: true,
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
router.post("/admins", superAdminOnly, [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(['admin', 'super_admin']).withMessage("Invalid role"),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    const existingUser = await db.getOne(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
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
router.put("/admins/:id", superAdminOnly, [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("role").optional().isIn(['admin', 'super_admin']).withMessage("Invalid role"),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const adminId = req.params.id;

    const admin = await db.getOne("SELECT * FROM users WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
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
router.put("/admins/:id/password", superAdminOnly, [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors
], async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.params.id;

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

// ============ SERVICE REQUESTS MANAGEMENT ============

const SERVICE_TYPE_LABELS = {
  'product_sourcing': 'Product Sourcing',
  'wholesale_supply': 'Wholesale Supply',
  'air_cargo': 'Air Cargo',
  'sea_shipping': 'Sea Shipping',
  'hand_carry': 'Hand Carry',
  'canton_fair': 'Canton Fair Support',
};

const SERVICE_STATUS_TRANSITIONS = {
  'received': ['in_progress', 'cancelled'],
  'in_progress': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': [],
};

const SERVICE_STATUS_LABELS = {
  'received': 'Received',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

// List service requests
router.get("/service-requests", async (req, res) => {
  try {
    const { status, service_type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM service_requests WHERE deleted_at IS NULL";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    if (service_type && service_type !== "all") {
      queryStr += " AND service_type = ?";
      params.push(service_type);
    }

    if (search) {
      queryStr += " AND (name LIKE ? OR email LIKE ? OR tracking_number LIKE ? OR company LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const requests = await safeGetMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM service_requests WHERE deleted_at IS NULL";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (service_type && service_type !== "all") {
      countQuery += " AND service_type = ?";
      countParams.push(service_type);
    }

    if (search) {
      countQuery += " AND (name LIKE ? OR email LIKE ? OR tracking_number LIKE ? OR company LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const totalResult = await safeGetOne(countQuery, countParams);

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
    logger.error("Get service requests error:", error);
    res.status(500).json({ error: "Failed to get service requests" });
  }
});

// Get single service request
router.get("/service-requests/:id", async (req, res) => {
  try {
    const request = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    const tracking = await db.getMany(
      "SELECT * FROM tracking WHERE tracking_number = ? ORDER BY created_at DESC",
      [request.tracking_number]
    );

    // Parse details JSON
    let parsedDetails = null;
    if (request.details) {
      try {
        parsedDetails = JSON.parse(request.details);
      } catch (e) {
        parsedDetails = request.details;
      }
    }

    res.json({
      success: true,
      data: { ...request, parsedDetails, tracking },
    });
  } catch (error) {
    logger.error("Get service request error:", error);
    res.status(500).json({ error: "Failed to get service request" });
  }
});

// Update service request
router.put("/service-requests/:id", async (req, res) => {
  try {
    const request = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    const allowedFields = [
      'name', 'phone', 'whatsapp', 'email', 'company',
      'message', 'status', 'admin_notes', 'price', 'tracking_number'
    ];

    const updates = [];
    const updateParams = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        updateParams.push(req.body[field]);
      }
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: "No fields to update", data: request });
    }

    updateParams.push(req.params.id);
    await db.run(`UPDATE service_requests SET ${updates.join(", ")} WHERE id = ?`, updateParams);

    const updatedRequest = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);
    logger.info(`Service request updated: ${req.params.id}`);

    res.json({ success: true, message: "Service request updated successfully", data: updatedRequest });
  } catch (error) {
    logger.error("Update service request error:", error);
    res.status(500).json({ error: "Failed to update service request" });
  }
});

// Delete service request
router.delete("/service-requests/:id", canDelete, async (req, res) => {
  try {
    const request = await safeGetOne("SELECT * FROM service_requests WHERE id = ? AND deleted_at IS NULL", [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (request.tracking_number) {
      await db.run("DELETE FROM tracking WHERE tracking_number = ?", [request.tracking_number]);
    }
    await db.softDelete('service_requests', req.params.id);

    logger.info(`Service request soft-deleted: ${request.tracking_number}`);

    res.json({
      success: true,
      message: "Service request moved to trash successfully",
      softDeleted: true,
    });
  } catch (error) {
    logger.error("Delete service request error:", error);
    res.status(500).json({ error: "Failed to delete service request" });
  }
});

// Convert service request to order
router.post("/service-requests/:id/convert-to-order", async (req, res) => {
  try {
    const { price, shipping_method, status = "processing" } = req.body;

    const request = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (request.converted_order_id) {
      return res.status(400).json({ error: "This service request has already been converted to an order" });
    }

    const orderNumber = `HB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2,5)}`;
    // Keep original tracking number so user can still track with the same number
    const trackingNumber = request.tracking_number || `HB${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
    const orderId = uuidv4();

    const customerInfo = JSON.stringify({
      name: request.name,
      email: request.email,
      phone: request.phone,
      whatsapp: request.whatsapp,
      company: request.company,
    });

    // Determine product name from details or service type
    let productName = SERVICE_TYPE_LABELS[request.service_type] || request.service_type;
    if (request.details) {
      try {
        const details = JSON.parse(request.details);
        if (details.product_name) productName = details.product_name;
        else if (details.cargo_description) productName = details.cargo_description;
        else if (details.item_description) productName = details.item_description;
        else if (details.cargo_type) productName = details.cargo_type;
      } catch (e) {}
    }

    const shippingMethodMap = {
      'air-cargo': 'Air Cargo',
      'sea-shipping': 'Sea Shipping',
      'hand-carry': 'Hand Carry',
      'air': 'Air Cargo',
      'sea': 'Sea Freight',
      'hand': 'Hand Carry',
    };
    const shippingMethod = shippingMethodMap[shipping_method] || shipping_method || 'Not specified';

    // Build items_info with all service request details
    let itemsInfo = null;
    if (request.details) {
      try {
        const parsedDetails = JSON.parse(request.details);
        if (Object.keys(parsedDetails).length > 0) {
          const info = {
            ...parsedDetails,
            _service_type: request.service_type,
          };
          if (request.image) info.image = request.image;
          if (request.message) info.message = request.message;
          itemsInfo = JSON.stringify(info);
        }
      } catch (e) {}
    }

    await db.run(
      `INSERT INTO orders
       (id, order_number, tracking_number, customer_name, customer_info, product_name, quantity, shipping_method, price, status, items_info, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderNumber, trackingNumber, request.name, customerInfo, productName, '1', shippingMethod, price || 0, status, itemsInfo, request.message || null]
    );

    // Update service request
    await db.run(
      `UPDATE service_requests SET converted_order_id = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [orderId, req.params.id]
    );

    const order = await db.getOne("SELECT * FROM orders WHERE id = ?", [orderId]);

    logger.info(`Service request ${request.tracking_number} converted to order ${orderNumber}`);

    res.status(201).json({
      success: true,
      message: "Service request converted to order successfully",
      data: order,
    });
  } catch (error) {
    logger.error("Convert service request to order error:", error);
    res.status(500).json({ error: "Failed to convert service request to order" });
  }
});

// ============ VIDEOS MANAGEMENT ============

router.get("/videos", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM videos WHERE deleted_at IS NULL";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    if (search) {
      queryStr += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const videos = await safeGetMany(queryStr, params);

    let countQuery = "SELECT COUNT(*) as count FROM videos WHERE deleted_at IS NULL";
    const countParams = [];

    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (search) {
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await safeGetOne(countQuery, countParams);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    logger.error("Get videos error:", error);
    res.status(500).json({ error: "Failed to get videos" });
  }
});

router.get("/videos/:id", async (req, res) => {
  try {
    const video = await db.getOne("SELECT * FROM videos WHERE id = ?", [
      req.params.id,
    ]);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    logger.error("Get video error:", error);
    res.status(500).json({ error: "Failed to get video" });
  }
});

router.post(
  "/videos",
  [
    body("title").notEmpty().withMessage("Video title is required"),
    body("youtube_url").notEmpty().withMessage("YouTube URL is required").matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/).withMessage("Must be a valid YouTube URL"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { title, youtube_url, description, status } = req.body;

      const id = uuidv4();

      await db.run(
        `INSERT INTO videos (id, title, youtube_url, description, status) 
       VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          title,
          youtube_url,
          description || null,
          status || "active",
        ],
      );

      logger.info(`Video created: ${title}`);

      res.status(201).json({
        success: true,
        message: "Video created successfully",
        data: {
          id,
          title,
          youtube_url,
          description,
          status,
        },
      });
    } catch (error) {
      logger.error("Create video error:", error);
      res.status(500).json({ error: "Failed to create video" });
    }
  },
);

router.put("/videos/:id", [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("youtube_url").optional().matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/).withMessage("Must be a valid YouTube URL"),
  body("status").optional().isIn(['active', 'inactive']).withMessage("Invalid status"),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, youtube_url, description, status } = req.body;

    const video = await db.getOne("SELECT * FROM videos WHERE id = ?", [
      req.params.id,
    ]);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await db.run(
      `UPDATE videos 
       SET title = COALESCE(?, title),
           youtube_url = COALESCE(?, youtube_url),
           description = COALESCE(?, description),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        title || null,
        youtube_url || null,
        description || null,
        status || null,
        req.params.id,
      ],
    );

    const updatedVideo = await db.getOne(
      "SELECT * FROM videos WHERE id = ?",
      [req.params.id],
    );

    logger.info(`Video updated: ${video.title}`);

    res.json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    logger.error("Update video error:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
});

router.delete("/videos/:id", canDelete, async (req, res) => {
  try {
    const video = await safeGetOne("SELECT * FROM videos WHERE id = ? AND deleted_at IS NULL", [
      req.params.id,
    ]);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await db.softDelete('videos', req.params.id);

    logger.info(`Video soft-deleted: ${video.title}`);

    res.json({
      success: true,
      message: "Video moved to trash successfully",
      softDeleted: true,
    });
  } catch (error) {
    logger.error("Delete video error:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

const nodemailer = require("nodemailer");

const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

router.post("/send-invoice", async (req, res) => {
  try {
    const { to, subject, invoiceNumber, customerName, attachment, attachmentName } = req.body;

    if (!to || !subject || !attachment) {
      return res.status(400).json({ error: "Missing required fields: to, subject, attachment" });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn("SMTP credentials not configured, falling back to mailto");
      return res.status(503).json({
        error: "Email service not configured",
        fallback: true,
        mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}`
      });
    }

    const transporter = getEmailTransporter();

    const base64Data = attachment.replace(/^data:.*;base64,/, '');

    const mailOptions = {
      from: `"H&B Trade" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0d9488; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">H&B Trade</h1>
            <p style="color: #ccfbf1; margin: 5px 0 0 0; font-size: 12px;">China to Bangladesh Product Sourcing & Shipping</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Dear ${customerName || 'Customer'},</p>
            <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
            <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
            <p>Thank you for your business!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">Best regards,<br/>H&B Trade Team</p>
          </div>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">H&B Trade - Your Trusted Sourcing Partner</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: attachmentName || 'invoice.pdf',
          content: base64Data,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Invoice ${invoiceNumber} sent to ${to}`);

    res.json({
      success: true,
      message: `Invoice sent successfully to ${to}`,
    });
  } catch (error) {
    logger.error("Send invoice error:", error);
    res.status(500).json({ error: "Failed to send invoice email", details: error.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.getOne('SELECT id FROM customers WHERE email = ? AND deleted_at IS NULL', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'A customer with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    await db.run(
      `INSERT INTO customers (id, name, email, phone, whatsapp, company, password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email.toLowerCase(), phone || null, whatsapp || null, company || null, hashedPassword]
    );

    logger.info(`Admin created customer: ${email}`);

    res.status(201).json({ success: true, data: { id, name, email: email.toLowerCase(), phone: phone || null, whatsapp: whatsapp || null, company: company || null } });
  } catch (error) {
    logger.error('Admin create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryStr = 'SELECT id, name, email, phone, whatsapp, company, created_at, updated_at FROM customers WHERE deleted_at IS NULL';
    let countStr = 'SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL';
    const params = [];
    const countParams = [];

    if (search) {
      queryStr += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
      countStr += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const countResult = await db.getOne(countStr, countParams);
    const customers = await db.getMany(queryStr, params);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult ? countResult.total : 0,
        pages: Math.ceil((countResult ? countResult.total : 0) / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await db.getOne(
      'SELECT id, name, email, phone, whatsapp, company, created_at, updated_at FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = await db.getMany(
      "SELECT id, order_number, product_name, status, tracking_number, price, created_at FROM orders WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
      [req.params.id]
    );

    const productRequests = await db.getMany(
      "SELECT id, product_name, status, tracking_number, created_at FROM product_requests WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
      [req.params.id]
    );

    const serviceRequests = await db.getMany(
      "SELECT id, service_type, status, tracking_number, created_at FROM service_requests WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...customer, orders, productRequests, serviceRequests }
    });
  } catch (error) {
    logger.error('Get customer detail error:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const { name, phone, whatsapp, company } = req.body;

    const customer = await db.getOne(
      'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (phone) {
      const existing = await db.getOne(
        'SELECT id FROM customers WHERE phone = ? AND id != ? AND deleted_at IS NULL',
        [phone, req.params.id]
      );
      if (existing) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    await db.run(
      'UPDATE customers SET name = ?, phone = ?, whatsapp = ?, company = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || customer.name, phone !== undefined ? phone : customer.phone, whatsapp !== undefined ? whatsapp : customer.whatsapp, company !== undefined ? company : customer.company, req.params.id]
    );

    const updated = await db.getOne(
      'SELECT id, name, email, phone, whatsapp, company, created_at, updated_at FROM customers WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

router.put('/customers/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const customer = await db.getOne(
      'SELECT id, name, email FROM customers WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.run(
      'UPDATE customers SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.params.id]
    );

    logger.info(`Admin ${req.user.email} reset password for customer: ${customer.email}`);

    res.json({ success: true, message: `Password reset successfully for ${customer.name}` });
  } catch (error) {
    logger.error('Reset customer password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.delete('/customers/:id', canDelete, async (req, res) => {
  try {
    const customer = await db.getOne(
      'SELECT id, email FROM customers WHERE id = ?',
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.run('DELETE FROM orders WHERE customer_id = ?', [req.params.id]);
    await db.run('DELETE FROM product_requests WHERE customer_id = ?', [req.params.id]);
    await db.run('DELETE FROM service_requests WHERE customer_id = ?', [req.params.id]);
    await db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);

    logger.info(`Customer hard deleted by admin: ${customer.email}`);

    res.json({ success: true, message: 'Customer permanently deleted' });
  } catch (error) {
    logger.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

router.delete('/customers/:id/orders/:orderId', async (req, res) => {
  try {
    await db.run('DELETE FROM orders WHERE id = ? AND customer_id = ?', [req.params.orderId, req.params.id]);
    logger.info(`Admin hard deleted order ${req.params.orderId} for customer ${req.params.id}`);
    res.json({ success: true, message: 'Order permanently deleted' });
  } catch (error) {
    logger.error('Admin delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.delete('/customers/:id/product-requests/:reqId', async (req, res) => {
  try {
    await db.run('DELETE FROM product_requests WHERE id = ? AND customer_id = ?', [req.params.reqId, req.params.id]);
    logger.info(`Admin hard deleted product request ${req.params.reqId}`);
    res.json({ success: true, message: 'Product request permanently deleted' });
  } catch (error) {
    logger.error('Admin delete product request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

router.delete('/customers/:id/service-requests/:reqId', async (req, res) => {
  try {
    await db.run('DELETE FROM service_requests WHERE id = ? AND customer_id = ?', [req.params.reqId, req.params.id]);
    logger.info(`Admin hard deleted service request ${req.params.reqId}`);
    res.json({ success: true, message: 'Service request permanently deleted' });
  } catch (error) {
    logger.error('Admin delete service request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

router.delete('/customers/:id/all-data', canDelete, async (req, res) => {
  try {
    const customer = await db.getOne('SELECT id, email FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await db.run('DELETE FROM tracking WHERE tracking_number IN (SELECT tracking_number FROM orders WHERE customer_id = ?)', [req.params.id]);
    await db.run('DELETE FROM tracking WHERE tracking_number IN (SELECT tracking_number FROM product_requests WHERE customer_id = ?)', [req.params.id]);
    await db.run('DELETE FROM tracking WHERE tracking_number IN (SELECT tracking_number FROM service_requests WHERE customer_id = ?)', [req.params.id]);
    await db.run('DELETE FROM orders WHERE customer_id = ?', [req.params.id]);
    await db.run('DELETE FROM product_requests WHERE customer_id = ?', [req.params.id]);
    await db.run('DELETE FROM service_requests WHERE customer_id = ?', [req.params.id]);

    logger.info(`Admin deleted all data for customer: ${customer.email}`);
    res.json({ success: true, message: `All orders, requests, and tracking data deleted for ${customer.email}` });
  } catch (error) {
    logger.error('Delete customer all data error:', error);
    res.status(500).json({ error: 'Failed to delete customer data' });
  }
});

router.delete('/cleanup/soft-deleted', canDelete, async (req, res) => {
  try {
    let deleted = { orders: 0, product_requests: 0, service_requests: 0, products: 0, videos: 0, messages: 0 };

    const tables = ['orders', 'product_requests', 'service_requests', 'products', 'videos', 'messages'];
    for (const table of tables) {
      try {
        const result = await db.run(`DELETE FROM ${table} WHERE deleted_at IS NOT NULL`);
        deleted[table] = result.changes || result.affectedRows || 0;
      } catch (e) {}
    }

    try {
      const orphanTracking = await db.getMany(
        `SELECT t.tracking_number FROM tracking t
         LEFT JOIN orders o ON t.tracking_number = o.tracking_number
         LEFT JOIN product_requests pr ON t.tracking_number = pr.tracking_number
         LEFT JOIN service_requests sr ON t.tracking_number = sr.tracking_number
         WHERE o.id IS NULL AND pr.id IS NULL AND sr.id IS NULL`
      );
      if (orphanTracking.length > 0) {
        const tns = orphanTracking.map(t => t.tracking_number);
        const placeholders = tns.map(() => '?').join(',');
        await db.run(`DELETE FROM tracking WHERE tracking_number IN (${placeholders})`, tns);
      }
      deleted['orphan_tracking'] = orphanTracking.length;
    } catch (e) {}

    logger.info(`Admin cleaned up soft-deleted records: ${JSON.stringify(deleted)}`);
    res.json({ success: true, message: 'Cleanup complete', deleted });
  } catch (error) {
    logger.error('Cleanup soft-deleted error:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

router.get('/soft-deleted', async (req, res) => {
  try {
    const result = {};
    const tables = ['orders', 'product_requests', 'service_requests', 'products', 'videos', 'messages'];
    for (const table of tables) {
      try {
        const row = await db.getOne(`SELECT COUNT(*) as count FROM ${table} WHERE deleted_at IS NOT NULL`);
        result[table] = row?.count || 0;
      } catch (e) {
        result[table] = 0;
      }
    }
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get soft-deleted count error:', error);
    res.status(500).json({ error: 'Failed to get soft-deleted counts' });
  }
});

// ========== ADMIN MANAGEMENT (super_admin only) ==========

router.get('/admins', superAdminOnly, async (req, res) => {
  try {
    const admins = await db.getMany(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: admins });
  } catch (error) {
    logger.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to get admins' });
  }
});

router.post('/admins', superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const adminRole = role === 'super_admin' ? 'super_admin' : 'admin';

    const existing = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'An admin with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    await db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email.toLowerCase(), hashedPassword, adminRole]
    );

    logger.info(`Super admin ${req.user.email} created admin: ${email}`);

    res.status(201).json({ success: true, data: { id, name, email: email.toLowerCase(), role: adminRole } });
  } catch (error) {
    logger.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

router.put('/admins/:id', superAdminOnly, async (req, res) => {
  try {
    const { name, role } = req.body;
    const admin = await db.getOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    if (admin.email === 'admin@hbtrade.ltd' && role && role !== 'super_admin') {
      return res.status(400).json({ error: 'Cannot change super admin primary role' });
    }

    const adminRole = role === 'super_admin' ? 'super_admin' : 'admin';
    await db.run(
      'UPDATE users SET name = ?, role = ? WHERE id = ?',
      [name || admin.name, adminRole, req.params.id]
    );

    const updated = await db.getOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

router.delete('/admins/:id', superAdminOnly, async (req, res) => {
  try {
    const admin = await db.getOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    if (admin.email === 'admin@hbtrade.ltd') {
      return res.status(400).json({ error: 'Cannot delete the primary super admin' });
    }

    if (admin.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    logger.info(`Super admin ${req.user.email} deleted admin: ${admin.email}`);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    logger.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

router.put('/admins/:id/reset-password', superAdminOnly, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const admin = await db.getOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);

    logger.info(`Super admin ${req.user.email} reset password for admin: ${admin.email}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset admin password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
