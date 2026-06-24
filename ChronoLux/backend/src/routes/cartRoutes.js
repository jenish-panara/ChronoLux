const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getCart);
router.post('/items', protect, addToCart);
router.put('/items/:itemId', protect, updateCartItem);
router.delete('/items/:itemId', protect, removeFromCart);
router.delete('/', protect, clearCart);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);

module.exports = router;