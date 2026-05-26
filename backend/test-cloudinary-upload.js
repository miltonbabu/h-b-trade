const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG image
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function testUpload() {
  console.log('Testing Cloudinary upload...\n');

  try {
    // First, let's test the upload endpoint by simulating a multipart form upload
    const FormData = require('form-data');
    const http = require('http');

    // Create a test PNG file
    const testFilePath = path.join(__dirname, 'test-upload.png');
    fs.writeFileSync(testFilePath, minimalPNG);

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-upload.png',
      contentType: 'image/png'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/upload?folder=hbtrade/products',
      method: 'POST',
      headers: form.getHeaders()
    };

    console.log('Sending test image to Cloudinary via /api/admin/upload...');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\nResponse Status:', res.statusCode);
        console.log('Response Body:', data);

        try {
          const result = JSON.parse(data);
          if (result.success && result.url) {
            console.log('\n✓ Cloudinary upload successful!');
            console.log('  Image URL:', result.url);
            console.log('  Public ID:', result.publicId);
          } else {
            console.log('\n✗ Upload failed:', result.error);
          }
        } catch (e) {
          console.log('\n✗ Failed to parse response');
        }

        // Cleanup
        fs.unlinkSync(testFilePath);
      });
    });

    req.on('error', (error) => {
      console.error('\n✗ Request error:', error.message);
      console.log('Make sure the backend server is running on port 5000');

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    form.pipe(req);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();
