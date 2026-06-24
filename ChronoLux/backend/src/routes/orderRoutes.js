const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/auth');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;