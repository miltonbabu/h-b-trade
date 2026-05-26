const fs = require('fs');
const path = require('path');
const http = require('http');
const { Buffer } = require('buffer');

// Create a simple 10x10 pixel PNG test image
const createTestPNG = () => {
  // Minimal 1x1 white PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
};

async function testCloudinaryUpload() {
  console.log('=== Cloudinary Upload Test ===\n');

  const imageBuffer = createTestPNG();
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  // Build multipart form data
  const formData = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="file"; filename="test-product.png"\r\n`),
    Buffer.from(`Content-Type: image/png\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/test-upload?folder=hbtrade/products',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': formData.length
    }
  };

  return new Promise((resolve, reject) => {
    console.log('Sending test image to Cloudinary...\n');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);

        try {
          const result = JSON.parse(data);
          if (result.success && result.url) {
            console.log('\n✅ Cloudinary Upload SUCCESSFUL!');
            console.log('   URL:', result.url);
            console.log('   Public ID:', result.publicId);
            console.log('\nThis image should now appear in:');
            console.log('   - Admin Products page');
            console.log('   - Wholesale Products catalog');
          } else {
            console.log('\n❌ Upload FAILED:', result.error);
          }
        } catch (e) {
          console.log('\n❌ Failed to parse response');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Request Error:', error.message);
      console.log('Make sure the backend server is running!');
      resolve();
    });

    req.write(formData);
    req.end();
  });
}

testCloudinaryUpload().then(() => {
  console.log('\n=== Test Complete ===');
});
