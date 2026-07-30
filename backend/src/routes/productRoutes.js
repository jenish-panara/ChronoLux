const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/auth');
const { cache } = require('../middlewares/cacheMiddleware');

router.get('/stats/dashboard', protect, admin, getProductStats);
router.get('/:slug', cache(1800), getProduct); // Cache for 30 minutes
router.get('/', cache(300), getProducts); // Cache for 5 minutes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;