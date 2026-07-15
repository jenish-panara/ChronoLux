const express = require('express');
const router = express.Router();
const {
  getStats,
  getOrders,
  updateOrderStatus,
  getUsers,
  getAnalytics,
  importProducts,
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

// Apply protection and admin check to all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getUsers);
router.get('/analytics', getAnalytics);
router.post('/products/import-csv', importProducts);

module.exports = router;
