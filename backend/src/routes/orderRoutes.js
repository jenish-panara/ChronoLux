const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  failPayment,
  getOrders,
  getOrder,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');

// Static paths before /:id to avoid route conflicts
router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/fail-payment', protect, failPayment);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
