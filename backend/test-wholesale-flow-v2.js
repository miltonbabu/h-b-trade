const db = require('./config/database');
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test wholesale supply submission
async function testWholesaleFlow() {
  try {
    await db.initDatabase();
    console.log('=== Testing Wholesale Supply Order Flow ===\n');

    // Step 1: Submit a wholesale supply request
    console.log('Step 1: Submitting wholesale supply request...');
    const wholesaleData = {
      service_type: 'wholesale_supply',
      name: 'Wholesale Test Customer 2',
      email: 'wholesale2@test.com',
      phone: '+8801712345679',
      whatsapp: '+8801712345679',
      company: 'Test Wholesale Company 2',
      details: JSON.stringify({
        product_category: 'Electronics',
        product_names: 'Smartphones, Tablets, Laptops',
        quantity: '1000 units',
        target_price: '৳15,000 - ৳25,000 per unit',
        budget_range: '৳1,50,00,000 - ৳2,50,00,000',
        specifications: 'High-quality consumer electronics with warranty'
      }),
      message: 'Looking for reliable electronics supplier'
    };

    const response = await axios.post(`${API_BASE}/service-request`, wholesaleData);
    console.log('✓ Wholesale request submitted:', response.data.success);
    console.log('  Tracking Number:', response.data.data.trackingNumber);
    console.log('  Service Type:', response.data.data.service_type);
    const requestId = response.data.data.id;

    // Step 2: Get admin token
    console.log('\nStep 2: Getting admin token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@hbtrade.ltd',
      password: 'hbtrade2026'
    });
    const token = loginResponse.data.token;
    console.log('✓ Admin authenticated');

    // Step 3: Convert wholesale request to order
    console.log('\nStep 3: Converting wholesale request to order...');
    const convertResponse = await axios.post(
      `${API_BASE}/admin/service-requests/${requestId}/convert-to-order`,
      { price: 2000000, shipping_method: 'sea-shipping' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Wholesale request converted to order:', convertResponse.data.success);
    const order = convertResponse.data.data;
    console.log('\n  Order Details:');
    console.log('  - Order Number:', order.order_number);
    console.log('  - Customer:', order.customer_name);
    console.log('  - Product Name:', order.product_name);
    console.log('  - Quantity:', order.quantity);
    console.log('  - Price:', order.price);
    console.log('  - Status:', order.status);

    // Step 4: Verify database
    console.log('\nStep 4: Verifying database records...');
    const dbRequest = await db.getOne(
      'SELECT * FROM service_requests WHERE id = ?',
      [requestId]
    );
    console.log('\n  Service Request:');
    console.log('  - Status:', dbRequest.status);
    console.log('  - Converted to Order:', dbRequest.converted_order_id ? 'YES ✓' : 'NO');

    const dbOrder = await db.getOne(
      'SELECT * FROM orders WHERE id = ?',
      [dbRequest.converted_order_id]
    );
    console.log('\n  Order Record:');
    console.log('  - Product Name:', dbOrder.product_name);
    console.log('  - Quantity:', dbOrder.quantity);
    
    // Parse and display items_info
    if (dbOrder.items_info) {
      try {
        const items = JSON.parse(dbOrder.items_info);
        console.log('\n  Items Info Contents:');
        console.log('  - Product Category:', items.product_category);
        console.log('  - Product Names:', items.product_names);
        console.log('  - Quantity:', items.quantity);
        console.log('  - Budget Range:', items.budget_range);
        console.log('  - Service Type:', items._service_type);
      } catch (e) {
        console.log('  (Could not parse items_info)');
      }
    }

    console.log('\n=== TEST RESULTS ===');
    console.log('✓ Wholesale request submitted successfully');
    console.log('✓ Wholesale request converted to order successfully');
    console.log('✓ Product name correctly extracted:', 
      dbOrder.product_name === 'Smartphones, Tablets, Laptops' ? 'YES ✓ (product_names)' : 
      dbOrder.product_name.includes('Electronics') ? 'YES ✓ (product_category)' : 'NO ✗ (' + dbOrder.product_name + ')');
    console.log('✓ Quantity correctly extracted:', 
      dbOrder.quantity === '1000 units' ? 'YES ✓' : 'NO ✗ (got: ' + dbOrder.quantity + ')');
    console.log('✓ All wholesale details preserved in items_info:', 
      dbOrder.items_info && dbOrder.items_info.includes('product_category') ? 'YES ✓' : 'NO ✗');
    console.log('========================');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testWholesaleFlow();
