const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const db = require("../config/database");
const { getDateSQL, safeGetMany, safeGetOne } = db;
const { protect, adminOnly, superAdminOnly, canDelete } = require("../middleware/auth");
const {
  handleValidationErrors,
  xssProtection,
} = require("../middleware/validation");
const { upload, handleUploadError } = require("../config/multer");
const { v4: uuidv4 } = require("uuid");
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
      "SELECT COUNT(*) as count FROM messages WHERE is_read = 0 AND deleted_at IS NULL"
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
      "SELECT COUNT(*) as count FROM messages WHERE is_read = 0 AND deleted_at IS NULL",
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
    const tracking = await safeGetOne("SELECT * FROM tracking WHERE id = ? AND deleted_at IS NULL", [
      req.params.id,
    ]);

    if (!tracking) {
      return res.status(404).json({ error: "Tracking entry not found" });
    }

    await db.softDelete('tracking', req.params.id);

    res.json({
      success: true,
      message: "Tracking entry moved to trash",
      softDeleted: true,
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

    let queryStr = "SELECT * FROM product_requests WHERE deleted_at IS NULL";
    const params = [];

    if (status && status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
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

router.put("/requests/:id", [
  body("status").optional().isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage("Invalid status"),
  body("tracking_number").optional().trim(),
  handleValidationErrors
], async (req, res) => {
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

    // Generate order number and tracking number
    const orderNumber = `HB${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2,5)}`;
    const trackingNumber = request.tracking_number || `TRK${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
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

    // Build items_info with all request details for full visibility
    let itemsInfo = null;
    const detailsFields = ['product_name', 'product_link', 'target_price', 'quantity',
      'packaging_type', 'pack_quantity', 'master_pack_quantity', 'pack_dimensions',
      'weight_per_pack', 'sample_needed', 'shipping_method', 'specifications'];
    const hasDetails = detailsFields.some(f => request[f]);
    if (hasDetails) {
      const items = {};
      detailsFields.forEach(f => { if (request[f]) items[f] = request[f]; });
      if (Object.keys(items).length > 0) itemsInfo = JSON.stringify(items);
    }

    // Insert into orders table
    await db.run(
      `INSERT INTO orders
       (id, order_number, tracking_number, customer_name, customer_info, product_name, quantity, shipping_method, price, status, items_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        itemsInfo
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
    let {
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

    // Convert empty strings to null for COALESCE to work properly
    phone = phone || null;
    email = email || null;
    whatsapp_link = whatsapp_link || null;
    facebook_page = facebook_page || null;
    facebook_group = facebook_group || null;
    office_address = office_address || null;
    company_name = company_name || null;
    bkash = bkash || null;
    nagad = nagad || null;
    bank_account = bank_account || null;
    wechat = wechat || null;
    alipay = alipay || null;
    wechat_qr = wechat_qr || null;
    alipay_qr = alipay_qr || null;

    logger.info("Settings update - bank_account:", bank_account);

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
router.put("/service-requests/:id", [
  body("status").optional().isIn(['received', 'in_progress', 'completed', 'cancelled']).withMessage("Invalid status"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status, admin_notes, price } = req.body;

    const request = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    // Validate status transition
    if (status && status !== request.status) {
      const allowedTransitions = SERVICE_STATUS_TRANSITIONS[request.status] || [];
      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition from "${SERVICE_STATUS_LABELS[request.status]}" to "${SERVICE_STATUS_LABELS[status] || status}". Allowed transitions: ${allowedTransitions.map(s => SERVICE_STATUS_LABELS[s]).join(', ') || 'None'}`,
          currentStatus: request.status,
          allowedTransitions,
        });
      }

      // Add tracking entry
      if (request.tracking_number) {
        await db.run(
          `INSERT INTO tracking (id, tracking_number, status, location, note)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), request.tracking_number, status, 'System', `Status changed to ${SERVICE_STATUS_LABELS[status] || status}`]
        );
      }
    }

    await db.run(
      `UPDATE service_requests
       SET status = COALESCE(?, status),
           admin_notes = COALESCE(?, admin_notes),
           price = COALESCE(?, price),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, admin_notes !== undefined ? admin_notes : null, price !== undefined ? price : null, req.params.id]
    );

    const updatedRequest = await db.getOne("SELECT * FROM service_requests WHERE id = ?", [req.params.id]);

    logger.info(`Service request updated: ${request.tracking_number} - Status: ${request.status} → ${status || request.status}`);

    res.json({
      success: true,
      message: "Service request updated successfully",
      data: updatedRequest,
    });
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
    const trackingNumber = `TRK${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2,5)}`;
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
          itemsInfo = JSON.stringify({
            ...parsedDetails,
            _service_type: request.service_type,
            _original_request_id: req.params.id,
          });
        }
      } catch (e) {}
    }

    await db.run(
      `INSERT INTO orders
       (id, order_number, tracking_number, customer_name, customer_info, product_name, quantity, shipping_method, price, status, items_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderNumber, trackingNumber, request.name, customerInfo, productName, '1', shippingMethod, price || 0, status, itemsInfo]
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

module.exports = router;
