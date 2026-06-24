const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images stock finalPrice')
      .populate('coupon', 'code discountValue discountType');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].discount = product.discount;
      cart.items[existingItemIndex].finalPrice = product.finalPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        discount: product.discount,
        finalPrice: product.finalPrice,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name images stock finalPrice');
    await cart.populate('coupon', 'code discountValue discountType');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name images stock finalPrice');
    await cart.populate('coupon', 'code discountValue discountType');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name images stock finalPrice');
    await cart.populate('coupon', 'code discountValue discountType');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired or reached usage limit',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Check minimum order value
    if (cart.subtotal < coupon.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value ₹${coupon.minimumOrder} required`,
      });
    }

    cart.coupon = coupon._id;

    // Calculate discount
    if (coupon.discountType === 'percentage') {
      cart.discount = (cart.subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && cart.discount > coupon.maximumDiscount) {
        cart.discount = coupon.maximumDiscount;
      }
    } else {
      cart.discount = coupon.discountValue;
    }

    await cart.save();
    await cart.populate('items.product', 'name images stock finalPrice');
    await cart.populate('coupon', 'code discountValue discountType');

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();
    await cart.populate('items.product', 'name images stock finalPrice');

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      cart,
    });
  } catch (error) {
    next(error);
  }
};