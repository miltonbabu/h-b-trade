const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const uploadToCloudinary = (buffer, folder = 'hbtrade') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const uploadMultipleToCloudinary = async (files, folder = 'hbtrade') => {
  const results = [];
  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file.buffer, folder);
      results.push(result.secure_url);
    } catch (err) {
      console.error('Cloudinary upload error for one file:', err);
    }
  }
  return results;
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { cloudinary, uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary };
