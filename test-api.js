const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('=== Testing H&B Trade API ===\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✓ Health check passed:', health.data);
    console.log('');

    // Test 2: Public products endpoint
    console.log('2. Testing public products endpoint...');
    const products = await axios.get(`${API_URL}/products`);
    console.log(`✓ Products fetched: ${products.data.data.length} products`);
    if (products.data.data.length > 0) {
      console.log('  Sample product:', products.data.data[0].name);
    }
    console.log('');

    // Test 3: Categories endpoint
    console.log('3. Testing categories endpoint...');
    const categories = await axios.get(`${API_URL}/products/categories`);
    console.log(`✓ Categories fetched: ${categories.data.data.join(', ')}`);
    console.log('');

    // Test 4: Login
    console.log('4. Testing admin login...');
    try {
      const login = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@hbtrade.com',
        password: 'admin123'
      });
      console.log('✓ Login successful');
      console.log('  User:', login.data.user.name);
      console.log('  Role:', login.data.user.role);
      const token = login.data.token;
      console.log('');

      // Test 5: Admin products endpoint
      console.log('5. Testing admin products endpoint...');
      const adminProducts = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ Admin products fetched: ${adminProducts.data.data.length} products`);
      console.log('  Pagination:', adminProducts.data.pagination);
      console.log('');

      // Test 6: Admin notifications
      console.log('6. Testing admin notifications...');
      const notifications = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Notifications fetched:');
      console.log('  Messages:', notifications.data.data.messages);
      console.log('  Requests:', notifications.data.data.requests);
      console.log('  Orders:', notifications.data.data.orders);
      console.log('');

      console.log('=== All tests passed! ===');
      console.log('\nThe API is working correctly. The issue is likely:');
      console.log('1. Frontend not running or not connected to the correct API URL');
      console.log('2. Browser cache or cookies');
      console.log('3. Frontend environment variables not loaded');
      console.log('\nNext steps:');
      console.log('1. Restart the frontend: cd frontend && npm run dev');
      console.log('2. Clear browser cache and cookies');
      console.log('3. Check browser console for errors');

    } catch (loginError) {
      console.log('✗ Login failed:', loginError.response?.data || loginError.message);
      console.log('\nPossible issues:');
      console.log('1. Admin user not created or password incorrect');
      console.log('2. Database not initialized properly');
      console.log('\nTo fix:');
      console.log('1. Stop the backend server');
      console.log('2. Delete the database file: backend/data/hbtrade.db');
      console.log('3. Restart the backend: cd backend && npm start');
    }

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\nThe backend server is not running!');
      console.log('Please start it with: cd backend && npm start');
    }
  }
}

testAPI();
