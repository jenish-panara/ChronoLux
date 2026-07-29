const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendOrderConfirmationEmail = require('../utils/email');
const { getRazorpay } = require('../config/razorpay');

/**
 * Build order items from cart and validate stock.
 * Returns { orderItems, cart } or sends error response and returns null.
 */
async function prepareOrderFromCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Cart is empty',
    });
    return null;
  }

  for (const item of cart.items) {
    if (!item.product) {
      res.status(400).json({
        success: false,
        message: 'One or more products in your cart are no longer available',
      });
      return null;
    }
    if (item.product.stock < item.quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.product.name}`,
      });
      return null;
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0],
    price: item.price,
    quantity: item.quantity,
    discount: item.discount,
    finalPrice: item.finalPrice,
  }));

  return { cart, orderItems };
}

async function decrementStock(cart) {
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }
}

async function restoreStock(orderItems) {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
}

async function clearUserCart(cart) {
  cart.items = [];
  cart.coupon = undefined;
  cart.discount = 0;
  await cart.save();
}

function sendOrderEmail(user, order) {
  sendOrderConfirmationEmail(user.email, user.name, order).catch((err) => {
    console.error('Failed to send order confirmation email:', err.message);
  });
}

// @desc    Create new order (COD completes immediately; Razorpay stays pending until verified)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required',
      });
    }

    if (!['cod', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const prepared = await prepareOrderFromCart(req, res);
    if (!prepared) return;

    const { cart, orderItems } = prepared;

    // --- Cash on Delivery: finalize immediately (existing behaviour) ---
    if (paymentMethod === 'cod') {
      const order = await Order.create({
        user: req.user.id,
        orderItems,
        shippingAddress,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        coupon: cart.coupon,
      });

      sendOrderEmail(req.user, order);
      await decrementStock(cart);
      await clearUserCart(cart);
      await order.populate('orderItems.product', 'name slug');

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    }

    // --- Razorpay: create pending order + Razorpay order; finalize on verify ---
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Online payment is temporarily unavailable. Please use Cash on Delivery.',
      });
    }

    const amountInPaise = Math.round(cart.total * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Order amount must be at least ₹1',
      });
    }

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      coupon: cart.coupon,
    });

    let razorpayOrder;
    try {
      const razorpay = getRazorpay();
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order._id.toString(),
        notes: {
          chronoluxOrderId: order._id.toString(),
          userId: req.user.id,
        },
      });
    } catch (rzpError) {
      await Order.findByIdAndDelete(order._id);
      console.error('Razorpay order creation failed:', rzpError);
      return res.status(502).json({
        success: false,
        message: 'Failed to initiate payment. Please try again.',
      });
    }

    order.paymentDetails = {
      razorpayOrderId: razorpayOrder.id,
    };
    await order.save();

    // Reserve stock while payment is in progress; cart kept until verification
    await decrementStock(cart);

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      order,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature and complete order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this order',
      });
    }

    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json({
        success: false,
        message: 'This order is not a Razorpay payment',
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order,
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot verify a cancelled order',
      });
    }

    if (
      order.paymentDetails?.razorpayOrderId &&
      order.paymentDetails.razorpayOrderId !== razorpayOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order mismatch',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
    };
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'confirmed',
      updatedAt: new Date(),
    });
    await order.save();

    // Clear cart only after successful verification
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      await clearUserCart(cart);
    }

    sendOrderEmail(req.user, order);
    await order.populate('orderItems.product', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Razorpay payment as failed and cancel pending order
// @route   POST /api/orders/fail-payment
// @access  Private
exports.failPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json({
        success: false,
        message: 'This order is not a Razorpay payment',
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot fail a completed payment',
      });
    }

    // Idempotent: already cancelled / failed
    if (order.orderStatus === 'cancelled') {
      return res.status(200).json({
        success: true,
        message: 'Order already cancelled',
        order,
      });
    }

    const wasPending = order.orderStatus !== 'cancelled';
    order.paymentStatus = 'failed';
    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = 'Payment failed or cancelled by user';
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'cancelled',
      updatedAt: new Date(),
    });
    await order.save();

    if (wasPending) {
      await restoreStock(order.orderItems);
    }

    res.status(200).json({
      success: true,
      message: 'Payment marked as failed. Order cancelled and stock restored.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name slug description images')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'shipped') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order',
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason;

    // Restore product stock
    await restoreStock(order.orderItems);

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};
