/**
 * Smoke test for the email notification system (no real emails are sent).
 * Verifies: DB schema (email_log, settings columns), module loading,
 * template rendering, and dispatcher policy/log behavior.
 * Usage: node test-email-system.js
 */
process.env.EMAIL_ENABLED = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke-test-secret-not-for-production';

const db = require('./config/database');

const main = async () => {
  await db.initDatabase();
  console.log('1. Database initialized');

  // email_log table exists
  const isProd = process.env.NODE_ENV === 'production';
  let hasEmailLog = false;
  let settingsCols = [];
  if (isProd) {
    const t = await db.getMany("SELECT table_name FROM information_schema.tables WHERE table_name = 'email_log'");
    hasEmailLog = t.length > 0;
    const cols = await db.getMany("SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'");
    settingsCols = cols.map((c) => c.column_name);
  } else {
    const t = await db.getMany("SELECT name FROM sqlite_master WHERE type='table' AND name='email_log'");
    hasEmailLog = t.length > 0;
    const cols = await db.getMany('PRAGMA table_info(settings)');
    settingsCols = cols.map((c) => c.name);
  }
  if (!hasEmailLog) throw new Error('email_log table missing');
  console.log('2. email_log table exists');

  const expected = ['email_from_name', 'admin_notification_email', 'email_notifications_enabled', 'notify_customer_status_updates', 'notify_admin_new_activity'];
  const missing = expected.filter((c) => !settingsCols.includes(c));
  if (missing.length > 0) throw new Error(`settings columns missing: ${missing.join(', ')}`);
  console.log('3. settings email columns present:', expected.join(', '));

  // All route modules + services load without errors
  require('./routes/admin');
  require('./routes/public');
  require('./routes/customer');
  require('./routes/auth');
  const notify = require('./services/notifications');
  const { sendEmail } = require('./services/email/dispatcher');
  const { templates } = require('./services/email/templates');
  console.log('4. All modules load OK');

  // Every template renders
  const ctx = {
    settings: { company_name: 'H&B Trade', phone: '+1', email: 'info@hbtrade.com', whatsapp_link: '', facebook_page: '', office_address: '' },
    frontendUrl: 'https://hbtrade.ltd',
    logoSrc: 'cid:hb-logo',
  };
  const sample = {
    welcome: { name: 'T', email: 't@t.com' },
    orderConfirmation: { order: { order_number: 'O1', tracking_number: 'T1', shipping_method: 'Air Cargo', price: 1, items_info: '[]', customer_info: '{"name":"T","email":"t@t.com"}' }, customerName: 'T' },
    orderStatusUpdate: { order: { order_number: 'O1', tracking_number: 'T1', shipping_method: 'Air Cargo' }, customerName: 'T', newStatus: 'processing', newStatusLabel: 'Processing', timeline: [] },
    trackingUpdate: { customerName: 'T', trackingNumber: 'T1', statusLabel: 'S', timeline: [] },
    serviceRequestReceived: { request: { name: 'T', email: 't@t.com', tracking_number: 'S1', service_type: 'air_cargo' }, serviceLabel: 'Air Cargo' },
    serviceStatusUpdate: { request: { name: 'T', email: 't@t.com', tracking_number: 'S1', service_type: 'air_cargo' }, serviceLabel: 'Air Cargo', newStatus: 'in_progress', newStatusLabel: 'In Progress', timeline: [] },
    productRequestReceived: { request: { name: 'T', email: 't@t.com', tracking_number: 'P1', product_name: 'X' } },
    productStatusUpdate: { request: { name: 'T', email: 't@t.com', tracking_number: 'P1', product_name: 'X' }, newStatus: 'pending', newStatusLabel: 'Pending', timeline: [] },
    quoteReady: { request: { name: 'T', email: 't@t.com', tracking_number: 'P1' }, price: '5', kind: 'product' },
    convertedToOrder: { order: { order_number: 'O1', tracking_number: 'T1' }, customerName: 'T', sourceLabel: 'product request' },
    contactAutoReply: { name: 'T', subject: 'S', message: 'M' },
    eventRegistration: { registration: { event_title: 'E', full_name: 'T', email: 't@t.com' } },
    invoice: { customerName: 'T', invoiceNumber: 'I1' },
    adminAlert: { subject: 'S', heading: 'H', rows: [{ label: 'L', value: 'V' }] },
    testEmail: { name: 'T' },
  };
  for (const [key, data] of Object.entries(sample)) {
    const rendered = templates[key](data, ctx);
    if (!rendered.html || !rendered.subject) throw new Error(`template ${key} rendered empty`);
  }
  console.log('5. All', Object.keys(sample).length, 'templates render');

  // Dispatcher: failed send must not throw and must be logged
  const result = await sendEmail({
    to: 'smoke-test@example.com',
    template: 'testEmail',
    data: { name: 'Smoke' },
    category: 'test',
    recipientType: 'customer',
    relatedType: 'test',
    relatedId: 'smoke-1',
  });
  if (result.success !== false) {
    console.log('5b. sendEmail reported success (real send happened?) id:', result.resendId);
  } else {
    console.log('5b. sendEmail failed gracefully (expected without RESEND_API_KEY):', result.error);
  }

  const logRow = await db.getOne('SELECT * FROM email_log WHERE related_id = ?', ['smoke-1']);
  if (!logRow) throw new Error('email_log row not written');
  console.log('6. email_log row written, status:', logRow.status);

  // Policy skip: disable via settings, ensure skip
  await db.run('UPDATE settings SET email_notifications_enabled = 0 WHERE id = (SELECT id FROM settings LIMIT 1)');
  const skipResult = await sendEmail({
    to: 'smoke-test@example.com',
    template: 'testEmail',
    data: { name: 'Smoke' },
    category: 'test',
    recipientType: 'customer',
    relatedType: 'test',
    relatedId: 'smoke-2',
  });
  if (!skipResult.skipped) throw new Error('expected skip when disabled');
  console.log('7. settings toggle correctly skips sending');
  await db.run('UPDATE settings SET email_notifications_enabled = 1 WHERE id = (SELECT id FROM settings LIMIT 1)');

  console.log('\nALL EMAIL SYSTEM CHECKS PASSED');
  process.exit(0);
};

main().catch((e) => {
  console.error('SMOKE TEST FAILED:', e.message);
  process.exit(1);
});
