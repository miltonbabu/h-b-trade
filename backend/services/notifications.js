/**
 * Event → email mapping for the whole platform.
 * Routes call these helpers; every call is fire-and-forget safe (never throws).
 */
const db = require('../config/database');
const logger = require('../config/logger');
const { sendEmail } = require('./email/dispatcher');
const {
  buildOrderTimeline,
  buildRequestTimeline,
  orderStatusLabel,
  SERVICE_STATUS_MAP,
  PRODUCT_REQUEST_STATUS_MAP,
  serviceStatusLabel,
  productRequestStatusLabel,
  serviceTypeLabel,
  isSeaShipping,
} = require('./email/statusLabels');

const fire = (promise, label) => {
  if (promise && typeof promise.catch === 'function') {
    promise.catch((e) => logger.error(`notify: ${label} failed: ${e.message}`));
  }
};

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const orderCustomer = (order) => {
  const info = parseJson(order.customer_info, {}) || {};
  return {
    name: info.name || order.customer_name || 'Customer',
    email: info.email || order.customer_email || null,
    phone: info.phone || null,
    whatsapp: info.whatsapp || null,
    company: info.company || null,
  };
};

/**
 * Admin alert recipients — supports multiple emails (comma-separated) in
 * settings.admin_notification_email or the ADMIN_EMAIL env var.
 * Returns an array of email strings.
 */
const getAdminEmails = async (settings) => {
  const s = settings || (await require('./email/dispatcher').getSettings());
  const raw = s.admin_notification_email || process.env.ADMIN_EMAIL || s.email || '';
  return String(raw || '')
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
};

/* ============================================================
   CUSTOMER EMAILS
   ============================================================ */

const welcomeCustomer = (customer) =>
  fire(
    sendEmail({
      to: customer.email,
      template: 'welcome',
      data: { name: customer.name, email: customer.email },
      category: 'welcome',
      recipientType: 'customer',
      relatedType: 'customer',
      relatedId: customer.id,
    }),
    'welcomeCustomer'
  );

const orderConfirmation = (order) => {
  const c = orderCustomer(order);
  return fire(
    sendEmail({
      to: c.email,
      template: 'orderConfirmation',
      data: { order, customerName: c.name, statusLabel: orderStatusLabel(order.shipping_method, order.status) },
      category: 'order_confirmation',
      recipientType: 'customer',
      relatedType: 'order',
      relatedId: order.id,
    }),
    'orderConfirmation'
  );
};

const serviceRequestReceived = (request) =>
  fire(
    sendEmail({
      to: request.email,
      template: 'serviceRequestReceived',
      data: { request, serviceLabel: serviceTypeLabel(request.service_type) },
      category: 'service_request_received',
      recipientType: 'customer',
      relatedType: 'service_request',
      relatedId: request.id,
    }),
    'serviceRequestReceived'
  );

const productRequestReceived = (request) =>
  fire(
    sendEmail({
      to: request.email,
      template: 'productRequestReceived',
      data: { request },
      category: 'product_request_received',
      recipientType: 'customer',
      relatedType: 'product_request',
      relatedId: request.id,
    }),
    'productRequestReceived'
  );

const contactAutoReply = (message) =>
  fire(
    sendEmail({
      to: message.email,
      template: 'contactAutoReply',
      data: { name: message.name, subject: message.subject, message: message.message },
      category: 'contact_auto_reply',
      recipientType: 'customer',
      relatedType: 'message',
      relatedId: message.id,
    }),
    'contactAutoReply'
  );

const eventRegistrationConfirmation = (registration) =>
  fire(
    sendEmail({
      to: registration.email,
      template: 'eventRegistration',
      data: { registration },
      category: 'event_registration',
      recipientType: 'customer',
      relatedType: 'event_registration',
      relatedId: registration.id,
    }),
    'eventRegistrationConfirmation'
  );

const orderStatusUpdated = (order, { oldStatus, newStatus, location, note } = {}) => {
  const c = orderCustomer(order);
  return fire(
    sendEmail({
      to: c.email,
      template: 'orderStatusUpdate',
      data: {
        order,
        customerName: c.name,
        oldStatus,
        newStatus,
        newStatusLabel: orderStatusLabel(order.shipping_method, newStatus),
        location,
        note,
        timeline: buildOrderTimeline(order.shipping_method, newStatus),
      },
      category: 'order_status_update',
      recipientType: 'customer',
      relatedType: 'order',
      relatedId: order.id,
    }),
    'orderStatusUpdated'
  );
};

const serviceRequestStatusUpdated = (request, { oldStatus, newStatus, note } = {}) => {
  const priceChanged = request.price !== undefined && request.price !== null;
  return fire(
    sendEmail({
      to: request.email,
      template: 'serviceStatusUpdate',
      data: {
        request,
        serviceLabel: serviceTypeLabel(request.service_type),
        oldStatus,
        newStatus,
        newStatusLabel: serviceStatusLabel(newStatus),
        note,
        timeline: buildRequestTimeline(SERVICE_STATUS_MAP, newStatus),
      },
      category: 'service_status_update',
      recipientType: 'customer',
      relatedType: 'service_request',
      relatedId: request.id,
    }),
    'serviceRequestStatusUpdated'
  );
};

const productRequestStatusUpdated = (request, { oldStatus, newStatus, note } = {}) =>
  fire(
    sendEmail({
      to: request.email,
      template: 'productStatusUpdate',
      data: {
        request,
        oldStatus,
        newStatus,
        newStatusLabel: productRequestStatusLabel(newStatus),
        note,
        timeline: buildRequestTimeline(PRODUCT_REQUEST_STATUS_MAP, newStatus),
      },
      category: 'product_status_update',
      recipientType: 'customer',
      relatedType: 'product_request',
      relatedId: request.id,
    }),
    'productRequestStatusUpdated'
  );

const quoteReady = (request, { price, kind = 'product', serviceLabel } = {}) =>
  fire(
    sendEmail({
      to: request.email,
      template: 'quoteReady',
      data: { request, price, kind, serviceLabel },
      category: 'quote_ready',
      recipientType: 'customer',
      relatedType: kind === 'service' ? 'service_request' : 'product_request',
      relatedId: request.id,
    }),
    'quoteReady'
  );

const convertedToOrder = (order, request, sourceLabel) => {
  const c = orderCustomer(order);
  return fire(
    sendEmail({
      to: request.email || c.email,
      template: 'convertedToOrder',
      data: { order, customerName: request.name || c.name, sourceLabel },
      category: 'converted_to_order',
      recipientType: 'customer',
      relatedType: 'order',
      relatedId: order.id,
    }),
    'convertedToOrder'
  );
};

/**
 * Tracking entry added (admin) → customer email.
 * Resolves the shipment owner (order / service request / product request) by tracking number.
 */
const trackingEntryAdded = async ({ trackingNumber, status, location, note, estimatedDate }) => {
  try {
    if (!trackingNumber) return;
    const order = await db.getOne('SELECT * FROM orders WHERE tracking_number = ? AND deleted_at IS NULL', [trackingNumber]);
    const serviceRequest = order
      ? null
      : await db.getOne('SELECT * FROM service_requests WHERE tracking_number = ? AND deleted_at IS NULL', [trackingNumber]);
    const productRequest = order || serviceRequest
      ? null
      : await db.getOne('SELECT * FROM product_requests WHERE tracking_number = ? AND deleted_at IS NULL', [trackingNumber]);

    const entity = order || serviceRequest || productRequest;
    if (!entity) {
      logger.info(`notify: trackingEntryAdded — no owner found for ${trackingNumber}, skipping customer email`);
      return;
    }

    const c = order
      ? orderCustomer(order)
      : { name: entity.name, email: entity.email };
    const statusLabel = order
      ? orderStatusLabel(order.shipping_method, status)
      : serviceRequest
        ? serviceStatusLabel(status)
        : productRequestStatusLabel(status);
    const timeline = order
      ? buildOrderTimeline(order.shipping_method, status)
      : serviceRequest
        ? buildRequestTimeline(SERVICE_STATUS_MAP, status)
        : buildRequestTimeline(PRODUCT_REQUEST_STATUS_MAP, status);

    await sendEmail({
      to: c.email,
      template: 'trackingUpdate',
      data: {
        customerName: c.name,
        trackingNumber,
        statusLabel,
        location,
        note,
        estimatedDate,
        timeline,
        refNumber: order ? order.order_number : trackingNumber,
      },
      category: 'tracking_update',
      recipientType: 'customer',
      relatedType: order ? 'order' : serviceRequest ? 'service_request' : 'product_request',
      relatedId: entity.id,
    });
  } catch (e) {
    logger.error(`notify: trackingEntryAdded failed: ${e.message}`);
  }
};

const invoiceSent = ({ to, subject, invoiceNumber, customerName, attachment, attachmentName }) =>
  fire(
    sendEmail({
      to,
      template: 'invoice',
      data: { customerName, invoiceNumber, subject },
      category: 'invoice',
      recipientType: 'customer',
      relatedType: 'invoice',
      relatedId: invoiceNumber,
      attachments: attachment
        ? [{ content: String(attachment).replace(/^data:.*;base64,/, ''), filename: attachmentName || 'invoice.pdf', contentType: 'application/pdf' }]
        : undefined,
    }),
    'invoiceSent'
  );

/* ============================================================
   ADMIN ALERTS
   ============================================================ */

const adminAlert = async ({ subject, heading, intro, rows, eyebrow, adminPath, note, replyTo, relatedType, relatedId }) => {
  try {
    const settings = await require('./email/dispatcher').getSettings();
    const to = await getAdminEmails(settings);
    if (to.length === 0) {
      logger.warn('notify: admin alert skipped — no admin email configured');
      return;
    }
    await sendEmail({
      to,
      template: 'adminAlert',
      data: { subject, heading, intro, rows, eyebrow, adminPath, note },
      category: 'admin_alert',
      recipientType: 'admin',
      relatedType,
      relatedId,
      replyTo,
    });
  } catch (e) {
    logger.error(`notify: adminAlert failed: ${e.message}`);
  }
};

const adminNewCustomer = (customer) =>
  fire(
    adminAlert({
      subject: `New customer registration — ${customer.name}`,
      heading: 'New customer signup',
      eyebrow: 'New Customer',
      intro: `A new customer just registered on the website.`,
      rows: [
        { label: 'Name', value: customer.name },
        { label: 'Email', value: customer.email },
        { label: 'Phone', value: customer.phone || '—' },
        { label: 'WhatsApp', value: customer.whatsapp || '—' },
        { label: 'Company', value: customer.company || '—' },
      ],
      adminPath: 'customers',
      replyTo: customer.email,
      relatedType: 'customer',
      relatedId: customer.id,
    }),
    'adminNewCustomer'
  );

const adminNewOrder = (order) => {
  const c = orderCustomer(order);
  return fire(
    adminAlert({
      subject: `New order ${order.order_number} — $${order.price}`,
      heading: 'New order received',
      eyebrow: 'New Order',
      intro: `A new order has been placed on the website.`,
      rows: [
        { label: 'Order Number', value: order.order_number },
        { label: 'Tracking Number', value: order.tracking_number },
        { label: 'Customer', value: `${c.name} (${c.email || 'no email'})` },
        { label: 'Products', value: order.product_name },
        { label: 'Shipping', value: order.shipping_method },
        { label: 'Total', value: `$${order.price}` },
      ],
      adminPath: 'orders',
      replyTo: c.email,
      relatedType: 'order',
      relatedId: order.id,
    }),
    'adminNewOrder'
  );
};

const adminNewServiceRequest = (request) =>
  fire(
    adminAlert({
      subject: `New service request — ${serviceTypeLabel(request.service_type)}`,
      heading: 'New service request',
      eyebrow: 'New Request',
      intro: `A new ${serviceTypeLabel(request.service_type)} request has been submitted.`,
      rows: [
        { label: 'Service', value: serviceTypeLabel(request.service_type) },
        { label: 'Tracking Number', value: request.tracking_number },
        { label: 'Customer', value: `${request.name} (${request.email})` },
        { label: 'Phone', value: request.phone || '—' },
        { label: 'Company', value: request.company || '—' },
        { label: 'Message', value: request.message || '—' },
      ],
      adminPath: 'service-requests',
      replyTo: request.email,
      relatedType: 'service_request',
      relatedId: request.id,
    }),
    'adminNewServiceRequest'
  );

const adminNewProductRequest = (request) =>
  fire(
    adminAlert({
      subject: `New product request — ${request.product_name}`,
      heading: 'New product request',
      eyebrow: 'New Request',
      intro: `A new product request has been submitted.`,
      rows: [
        { label: 'Product', value: request.product_name },
        { label: 'Tracking Number', value: request.tracking_number },
        { label: 'Customer', value: `${request.name} (${request.email})` },
        { label: 'Quantity', value: request.quantity || '—' },
        { label: 'Target Price', value: request.target_price ? `$${request.target_price}` : '—' },
        { label: 'Shipping', value: request.shipping_method || '—' },
      ],
      adminPath: 'requests',
      replyTo: request.email,
      relatedType: 'product_request',
      relatedId: request.id,
    }),
    'adminNewProductRequest'
  );

const adminNewMessage = (message) =>
  fire(
    adminAlert({
      subject: `New contact message — ${message.subject || 'Contact Form'}`,
      heading: 'New contact message',
      eyebrow: 'New Message',
      intro: `A new message has been sent via the contact form.`,
      rows: [
        { label: 'From', value: `${message.name} (${message.email})` },
        { label: 'Subject', value: message.subject || 'Contact Form Submission' },
        { label: 'Message', value: message.message },
      ],
      adminPath: 'messages',
      replyTo: message.email,
      relatedType: 'message',
      relatedId: message.id,
    }),
    'adminNewMessage'
  );

const adminNewEventRegistration = (registration) =>
  fire(
    adminAlert({
      subject: `New event registration — ${registration.event_title}`,
      heading: 'New event registration',
      eyebrow: 'New Registration',
      intro: `A new event registration has been submitted.`,
      rows: [
        { label: 'Event', value: registration.event_title },
        { label: 'Applicant', value: registration.full_name },
        { label: 'Email', value: registration.email },
        { label: 'Phone', value: registration.phone || '—' },
        { label: 'Business', value: registration.business_name || '—' },
      ],
      adminPath: 'events',
      replyTo: registration.email,
      relatedType: 'event_registration',
      relatedId: registration.id,
    }),
    'adminNewEventRegistration'
  );

const adminConversionNotice = (order, request, sourceLabel) => {
  const c = orderCustomer(order);
  return fire(
    adminAlert({
      subject: `Request converted to order ${order.order_number}`,
      heading: 'Request converted to order',
      eyebrow: 'Conversion',
      intro: `A ${sourceLabel || 'request'} has been converted into an order.`,
      rows: [
        { label: 'Order Number', value: order.order_number },
        { label: 'Tracking Number', value: order.tracking_number },
        { label: 'Customer', value: `${c.name} (${c.email || 'no email'})` },
        { label: 'Product / Service', value: order.product_name },
        { label: 'Price', value: order.price ? `$${order.price}` : '—' },
      ],
      adminPath: 'orders',
      replyTo: c.email,
      relatedType: 'order',
      relatedId: order.id,
    }),
    'adminConversionNotice'
  );
};

module.exports = {
  welcomeCustomer,
  orderConfirmation,
  serviceRequestReceived,
  productRequestReceived,
  contactAutoReply,
  eventRegistrationConfirmation,
  orderStatusUpdated,
  serviceRequestStatusUpdated,
  productRequestStatusUpdated,
  quoteReady,
  convertedToOrder,
  trackingEntryAdded,
  invoiceSent,
  adminAlert,
  adminNewCustomer,
  adminNewOrder,
  adminNewServiceRequest,
  adminNewProductRequest,
  adminNewMessage,
  adminNewEventRegistration,
  adminConversionNotice,
};
