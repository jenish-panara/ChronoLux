const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/auth');
const { cache } = require('../middlewares/cacheMiddleware');

router.get('/:slug', cache(3600), getCategory); // Cache for 1 hour
router.get('/', cache(3600), getCategories); // Cache for 1 hour
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;