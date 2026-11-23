/**
 * Regression test: admin create/update order with customer email
 * (verifies order creation works and tracking emails can be delivered).
 * Usage: node test-create-order.js
 */
process.env.PORT = process.env.PORT || '5089';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'repro-secret';
process.env.EMAIL_ENABLED = 'false'; // no real emails during test

const jwt = require('jsonwebtoken');
const db = require('./config/database');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  require('./server.js');
  await sleep(3000);
  const base = `http://localhost:${process.env.PORT}`;
  const token = jwt.sign(
    { id: 'admin-1', email: 'admin@hbtrade.ltd', role: 'super_admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  let failed = 0;

  // 1. Create air cargo order WITH email (like the admin form)
  let res = await fetch(`${base}/api/admin/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_name: 'Repro Customer',
      email: 'repro@example.com',
      phone: '+8801711111111',
      product_name: 'Test Product',
      quantity: '10',
      shipping_method: 'Air Cargo',
      price: '100',
      net_weight: '',
      notes: 'repro test',
      status: 'pending',
      tracking_number: '',
    }),
  });
  let data = await res.json();
  if (res.status !== 201 || !data.success) {
    failed += 1;
    console.error('FAIL create air order:', res.status, JSON.stringify(data));
  } else {
    console.log('PASS create air order:', data.data.order_number, 'tracking:', data.data.tracking_number);
  }
  const airOrderId = data.data && data.data.id;

  // 2. Create order with EMPTY email (form sends empty strings)
  res = await fetch(`${base}/api/admin/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_name: 'No Email Customer',
      email: '',
      phone: '',
      product_name: 'Test Product 2',
      quantity: '5',
      shipping_method: 'Hand Carry',
      price: '50',
      net_weight: '',
      notes: '',
      status: 'pending',
      tracking_number: '',
    }),
  });
  data = await res.json();
  if (res.status !== 201 || !data.success) {
    failed += 1;
    console.error('FAIL create hand-carry order (empty email):', res.status, JSON.stringify(data));
  } else {
    console.log('PASS create hand-carry order (empty email):', data.data.order_number);
  }

  // 3. Create sea order with custom status
  res = await fetch(`${base}/api/admin/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_name: 'Sea Customer',
      email: 'sea@example.com',
      product_name: 'Sea Cargo',
      quantity: '100',
      shipping_method: 'Sea Shipping',
      price: '900',
      status: 'sea_received_warehouse',
      tracking_number: '',
    }),
  });
  data = await res.json();
  if (res.status !== 201 || !data.success) {
    failed += 1;
    console.error('FAIL create sea order:', res.status, JSON.stringify(data));
  } else {
    console.log('PASS create sea order:', data.data.order_number);
  }

  // 4. Update order email via PUT (like the edit form)
  if (airOrderId) {
    res = await fetch(`${base}/api/admin/orders/${airOrderId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        customer_name: 'Repro Customer',
        email: 'updated-email@example.com',
        phone: '+8801722222222',
        product_name: 'Test Product',
        quantity: '10',
        shipping_method: 'Air Cargo',
        price: '100',
        status: 'processing',
      }),
    });
    data = await res.json();
    if (res.status !== 200 || !data.success) {
      failed += 1;
      console.error('FAIL update order with email:', res.status, JSON.stringify(data));
    } else {
      const info = typeof data.data.customer_info === 'string' ? JSON.parse(data.data.customer_info) : data.data.customer_info;
      if (info && info.email === 'updated-email@example.com') {
        console.log('PASS update order email saved to customer_info');
      } else {
        failed += 1;
        console.error('FAIL update order email not saved:', JSON.stringify(info));
      }
    }
  }

  // 4b. EXACT admin UI payload: hyphenated shipping values + all-empty optional fields
  for (const method of ['air-cargo', 'sea-shipping', 'hand-carry', '']) {
    res = await fetch(`${base}/api/admin/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer_name: 'UI Payload Test',
        email: '',
        phone: '',
        product_name: 'UI Test Product',
        quantity: '',
        shipping_method: method,
        price: '',
        net_weight: null,
        notes: '',
        status: method === 'sea-shipping' || method === 'sea' ? 'sea_received_warehouse' : 'pending',
        tracking_number: '',
      }),
    });
    data = await res.json();
    if (res.status !== 201 || !data.success) {
      failed += 1;
      console.error(`FAIL UI payload (method="${method}")`, res.status, JSON.stringify(data));
    } else {
      console.log(`PASS UI payload (method="${method || 'none'}")`);
    }
  }

  // 5. Confirm customer_info saved on create
  const rows = await db.getMany("SELECT order_number, customer_info FROM orders WHERE id = ?", [airOrderId]);
  if (rows.length > 0 && String(rows[0].customer_info || '').includes('updated-email@example.com')) {
    console.log('PASS customer_info persisted in DB');
  } else {
    failed += 1;
    console.error('FAIL customer_info missing in DB:', JSON.stringify(rows));
  }

  if (failed > 0) {
    console.error(`\n${failed} check(s) FAILED`);
    process.exit(1);
  }
  console.log('\nALL CREATE-ORDER CHECKS PASSED');
  process.exit(0);
};

main().catch((e) => {
  console.error('TEST ERROR:', e.message);
  process.exit(1);
});
