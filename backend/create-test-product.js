const db = require('./config/database');

const testProduct = {
  id: '550e8400-e29b-41d4-a716-446655440999',
  product_code: 'HB-TEST-001',
  name: 'Test Uploaded Product',
  category: 'Electronics',
  price: 9999,
  moq: 10,
  image: 'https://res.cloudinary.com/dazghbdea/image/upload/v1779723059/hbtrade/products/uikmbc0grvurnn8lcdh8.png',
  description: 'This is a test product with a Cloudinary-uploaded image to verify the upload feature works correctly.',
  status: 'active'
};

async function createTestProduct() {
  try {
    await db.initDatabase();

    // Check if product already exists
    const exists = await db.getOne('SELECT id FROM products WHERE id = ?', [testProduct.id]);

    if (exists) {
      console.log('✓ Test product already exists, updating...');
      await db.run(
        `UPDATE products SET
          name = ?, category = ?, price = ?, moq = ?, image = ?, description = ?, status = ?
         WHERE id = ?`,
        [testProduct.name, testProduct.category, testProduct.price, testProduct.moq,
         testProduct.image, testProduct.description, testProduct.status, testProduct.id]
      );
      console.log('✓ Test product updated');
    } else {
      console.log('Creating test product...');
      await db.run(
        `INSERT INTO products (id, product_code, name, category, price, moq, image, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [testProduct.id, testProduct.product_code, testProduct.name, testProduct.category,
         testProduct.price, testProduct.moq, testProduct.image, testProduct.description, testProduct.status]
      );
      console.log('✓ Test product created');
    }

    console.log('\n=== Test Product Created ===');
    console.log('Product ID:', testProduct.id);
    console.log('Name:', testProduct.name);
    console.log('Image URL:', testProduct.image);
    console.log('\nYou can now:');
    console.log('1. Go to http://localhost:3000/wholesale-products');
    console.log('2. Find "Test Uploaded Product" in the Electronics category');
    console.log('3. The image should display correctly');
    console.log('\nOr:');
    console.log('1. Go to http://localhost:3000/admin/products');
    console.log('2. Find the product and click Edit');
    console.log('3. You should see the uploaded image in the Image 1 field');

  } catch (error) {
    console.error('Error creating test product:', error);
  }
  process.exit(0);
}

createTestProduct();
