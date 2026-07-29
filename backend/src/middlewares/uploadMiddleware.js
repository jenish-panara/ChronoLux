const multer = require('multer');

// Store files in memory as Buffers — uploaded directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5,                   // Max 5 images per review
  },
});

// Middleware for review image uploads (field name: 'images', max 5 files)
exports.uploadReviewImages = upload.array('images', 5);
