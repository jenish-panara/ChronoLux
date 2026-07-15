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