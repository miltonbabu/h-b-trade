const db = require('./config/database');

async function test() {
  try {
    await db.initDatabase();
    console.log('Database initialized');

    const testId = 'test-' + Date.now();
    await db.run(
      `INSERT INTO product_requests
       (id, name, phone, whatsapp, email, product_name, product_link, quantity, shipping_method, message, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testId, 'Test', '123', '456', 'test@test.com', 'Product', null, '10', 'air', 'msg', null]
    );

    console.log('Insert successful');

    const result = await db.getOne('SELECT * FROM product_requests WHERE id = ?', [testId]);
    console.log('Query result:', result);

  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
