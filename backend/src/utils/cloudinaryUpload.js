const cloudinary = require('../config/cloudinary');

exports.uploadToCloudinary = async (file, folder = 'chronolux') => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
};

/**
 * Upload a raw Buffer (from multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer  - File buffer from req.files[i].buffer
 * @param {string} mimetype - MIME type e.g. 'image/jpeg'
 * @param {string} folder  - Cloudinary folder name
 * @returns {{ url: string, publicId: string }}
 */
exports.uploadBufferToCloudinary = async (buffer, mimetype, folder = 'chronolux') => {
  try {
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    throw new Error('Image upload failed');
  }
};