const fs = require('fs');
const path = require('path');

// Create a simple test PNG (1x1 pixel)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Save test image
const testFilePath = path.join(__dirname, 'test-upload.png');
fs.writeFileSync(testFilePath, minimalPNG);

console.log('=== Cloudinary Upload Test ===\n');
console.log('Test image created:', testFilePath);
console.log('Image size:', minimalPNG.length, 'bytes\n');

console.log('To test the upload functionality:\n');
console.log('1. Make sure backend is running on port 5000');
console.log('2. Make sure frontend is running on port 3000');
console.log('3. Go to: http://localhost:3000/admin/products');
console.log('4. Click "Add Product" button');
console.log('5. Fill in the product details');
console.log('6. Click "Upload image" button on Image 1 field');
console.log('7. Select a test image file');
console.log('8. Wait for upload to complete (should show success)');
console.log('9. Check browser console for upload status');
console.log('10. Submit the product\n');

console.log('The image should:');
console.log('- Upload to Cloudinary');
console.log('- Show a preview in the upload field');
console.log('- Be saved to the product in the database');
console.log('- Display on the wholesale products page\n');

console.log('Expected Cloudinary folder: hbtrade/products');
console.log('Image URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[filename]\n');

// Cleanup
if (process.argv.includes('--cleanup')) {
  fs.unlinkSync(testFilePath);
  console.log('Test image cleaned up');
}
