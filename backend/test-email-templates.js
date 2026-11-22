/**
 * Renders every email template to HTML preview files (no emails are sent).
 * Usage: node test-email-templates.js
 * Output: backend/email-previews/*.html  — open in a browser to review the design.
 */
const fs = require('fs');
const path = require('path');
const { templates } = require('./services/email/templates');

const OUT_DIR = path.join(__dirname, 'email-previews');
fs.mkdirSync(OUT_DIR, { recursive: true });

const settings = {
  company_name: 'H&B Trade',
  phone: '+880 1234-567890',
  email: 'info@hbtrade.com',
  whatsapp_link: 'https://wa.me/8801234567890',
  facebook_page: 'https://www.facebook.com/hbtrade',
  office_address: '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh',
};

const logoPath = path.join(__dirname, '..', 'frontend', 'public', 'logo-hb-small.png');
const logoDataUri = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : '';

const ctx = {
  settings,
  frontendUrl: 'https://hbtrade.ltd',
  logoSrc: logoDataUri || `${'https://hbtrade.ltd'}/logo-hb.png`,
};

const sampleOrder = {
  id: 'ord-1',
  order_number: 'HB12345678ABC',
  tracking_number: 'TRK1234567890XYZ',
  customer_name: 'Rahim Uddin',
  customer_info: JSON.stringify({ name: 'Rahim Uddin', email: 'rahim@example.com', phone: '+8801711111111' }),
  product_name: 'Bluetooth Speaker, LED Strip Light',
  items_info: JSON.stringify([
    { productName: 'Bluetooth Speaker', totalUnits: 200, totalPrice: 900 },
    { productName: 'LED Strip Light', totalUnits: 500, totalPrice: 750 },
  ]),
  quantity: 700,
  shipping_method: 'Sea Freight',
  price: 1650,
};

const sampleServiceRequest = {
  id: 'sr-1',
  service_type: 'sea_shipping',
  name: 'Karim Ahmed',
  email: 'karim@example.com',
  phone: '+8801822222222',
  company: 'Karim Trading',
  tracking_number: 'SS1234567890',
  message: 'Please arrange sea shipping for 2 CBM cargo.',
};

const sampleProductRequest = {
  id: 'pr-1',
  name: 'Fatema Begum',
  email: 'fatema@example.com',
  product_name: 'Wireless Earbuds TWS',
  tracking_number: 'PR1234567890',
  quantity: '500',
  target_price: '3.50',
  shipping_method: 'Air Cargo',
};

const sampleTimeline = [
  { value: 'a', label: 'Pending', description: 'Order received, awaiting processing', state: 'done' },
  { value: 'b', label: 'Processing', description: 'Order is being prepared', state: 'done' },
  { value: 'c', label: 'Guangzhou Warehouse Received', description: 'Package received at Guangzhou warehouse', state: 'current' },
  { value: 'd', label: 'Flying', description: 'Package is flying to Bangladesh', state: 'upcoming' },
  { value: 'e', label: 'Dhaka Customs Clearance', description: 'Package is at Dhaka customs', state: 'upcoming' },
  { value: 'f', label: 'Dhaka Office', description: 'Package arrived at Dhaka office', state: 'upcoming' },
  { value: 'g', label: 'Delivered To Customer', description: 'Package delivered to customer', state: 'upcoming' },
];

const cases = {
  welcome: { name: 'Rahim Uddin', email: 'rahim@example.com' },
  orderConfirmation: { order: sampleOrder, customerName: 'Rahim Uddin' },
  orderStatusUpdate: {
    order: sampleOrder, customerName: 'Rahim Uddin', oldStatus: 'processing', newStatus: 'guangzhou_warehouse',
    newStatusLabel: 'Guangzhou Warehouse Received', location: 'Guangzhou, China',
    note: 'Your package is ready for consolidation.', timeline: sampleTimeline,
  },
  trackingUpdate: {
    customerName: 'Rahim Uddin', trackingNumber: 'TRK1234567890XYZ', statusLabel: 'In Transit',
    location: 'At sea', note: 'Vessel departed Guangzhou.', estimatedDate: '2026-12-15',
    timeline: sampleTimeline, refNumber: 'HB12345678ABC',
  },
  serviceRequestReceived: { request: sampleServiceRequest, serviceLabel: 'Sea Shipping' },
  serviceStatusUpdate: {
    request: sampleServiceRequest, serviceLabel: 'Sea Shipping', oldStatus: 'received', newStatus: 'in_progress',
    newStatusLabel: 'In Progress', note: 'We are booking space on the next vessel.',
    timeline: [
      { value: 'received', label: 'Received', description: 'Your service request has been received.', state: 'done' },
      { value: 'in_progress', label: 'In Progress', description: 'Our team is working on it.', state: 'current' },
      { value: 'completed', label: 'Completed', description: 'Completed successfully.', state: 'upcoming' },
    ],
  },
  productRequestReceived: { request: sampleProductRequest },
  productStatusUpdate: {
    request: sampleProductRequest, oldStatus: 'pending', newStatus: 'quoted', newStatusLabel: 'Quote Ready',
    note: 'We found the best supplier for you.',
    timeline: [
      { value: 'pending', label: 'Pending', description: 'Awaiting review.', state: 'done' },
      { value: 'processing', label: 'Processing', description: 'Sourcing your quote.', state: 'done' },
      { value: 'quoted', label: 'Quote Ready', description: 'Your quote is ready.', state: 'current' },
    ],
  },
  quoteReady: { request: sampleProductRequest, price: '3.20', kind: 'product' },
  convertedToOrder: { order: sampleOrder, customerName: 'Rahim Uddin', sourceLabel: 'product request' },
  contactAutoReply: { name: 'John Doe', subject: 'Shipping to Dhaka', message: 'Hello, I want to ship 500kg to Dhaka.\nPlease advise.' },
  eventRegistration: {
    registration: {
      event_title: 'Canton Fair 2026', full_name: 'John Doe', email: 'john@example.com', phone: '+8801911111111',
    },
  },
  invoice: { customerName: 'Rahim Uddin', invoiceNumber: 'INV-2026-001', subject: 'Invoice INV-2026-001 | H&B Trade' },
  adminAlert: {
    subject: 'New order HB12345678ABC — $1650',
    heading: 'New order received',
    eyebrow: 'New Order',
    intro: 'A new order has been placed on the website.',
    rows: [
      { label: 'Order Number', value: 'HB12345678ABC' },
      { label: 'Customer', value: 'Rahim Uddin (rahim@example.com)' },
      { label: 'Total', value: '$1650' },
    ],
    adminPath: 'orders',
  },
  testEmail: { name: 'Admin', environment: 'development', from: 'H&B Trade <noreply@hbtrade.ltd>' },
};

let failed = 0;
for (const [key, data] of Object.entries(cases)) {
  try {
    const rendered = templates[key](data, ctx);
    if (!rendered || !rendered.html || !rendered.subject) {
      throw new Error('missing html/subject in rendered output');
    }
    const outFile = path.join(OUT_DIR, `${key}.html`);
    fs.writeFileSync(outFile, rendered.html, 'utf8');
    console.log(`OK  ${key.padEnd(26)} → ${outFile}  (subject: ${rendered.subject})`);
  } catch (e) {
    failed += 1;
    console.error(`FAIL ${key}: ${e.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} template(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${Object.keys(cases).length} templates rendered. Open ${OUT_DIR} in a browser to preview.`);
