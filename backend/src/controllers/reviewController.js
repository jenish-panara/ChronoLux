const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.exists({
      user: req.user.id,
      'orderItems.product': productId,
      orderStatus: 'delivered',
    });

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: hasPurchased,
    });

    await review.populate('user', 'name avatar');

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews,
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    await review.populate('user', 'name avatar');

    // Update product ratings
    const reviews = await Review.find({ product: review.product });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating.toFixed(1),
      numReviews,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews,
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};