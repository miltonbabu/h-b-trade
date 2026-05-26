const db = require('./config/database');

(async () => {
  await db.initDatabase();
  
  console.log('=== Checking Latest Wholesale Request ===\n');
  
  const request = await db.getOne(
    'SELECT * FROM service_requests WHERE service_type = "wholesale_supply" ORDER BY created_at DESC LIMIT 1'
  );
  
  if (!request) {
    console.log('No wholesale requests found');
    process.exit(0);
  }
  
  console.log('Service Request Details:');
  console.log('- ID:', request.id);
  console.log('- Service Type:', request.service_type);
  console.log('- Name:', request.name);
  console.log('- Details (raw):', request.details);
  
  if (request.details) {
    console.log('\nParsed Details:');
    try {
      const parsed = JSON.parse(request.details);
      console.log(JSON.stringify(parsed, null, 2));
      
      console.log('\nField Checks:');
      console.log('- product_name:', parsed.product_name || '(not found)');
      console.log('- product_names:', parsed.product_names || '(not found)');
      console.log('- product_category:', parsed.product_category || '(not found)');
      console.log('- quantity:', parsed.quantity || '(not found)');
    } catch (e) {
      console.log('Failed to parse details:', e.message);
    }
  }
  
  if (request.converted_order_id) {
    console.log('\n\n=== Checking Converted Order ===\n');
    const order = await db.getOne(
      'SELECT * FROM orders WHERE id = ?',
      [request.converted_order_id]
    );
    
    if (order) {
      console.log('Order Details:');
      console.log('- Order Number:', order.order_number);
      console.log('- Product Name:', order.product_name);
      console.log('- Quantity:', order.quantity);
      console.log('- Items Info:', order.items_info);
    }
  }
  
  process.exit(0);
})();
