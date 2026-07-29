const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, optionalProtect } = require('../middlewares/auth');
const { uploadReviewImages } = require('../middlewares/uploadMiddleware');

// Public route — but passes user info if logged in (for canReview flag)
router.get('/product/:productId', optionalProtect, getProductReviews);

// Protected routes — multer runs before the controller
router.post('/', protect, uploadReviewImages, createReview);
router.put('/:id', protect, uploadReviewImages, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;