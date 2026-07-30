const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const { clearCachePattern } = require('../utils/redis');

// Helper — recalculate and persist average rating on a product
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const avgRating =
    numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(avgRating.toFixed(1)),
    numReviews,
  });
};

// Helper — upload all files in req.files to Cloudinary
const uploadImages = async (files) => {
  if (!files || files.length === 0) return [];
  const uploads = files.map((file) =>
    uploadBufferToCloudinary(file.buffer, file.mimetype, 'chronolux/reviews')
  );
  return Promise.all(uploads); // [{ url, publicId }, ...]
};

// ─────────────────────────────────────────────
// @desc    Get product reviews + rating breakdown + canReview flag
// @route   GET /api/reviews/product/:productId
// @access  Public (auth optional for canReview)
// ─────────────────────────────────────────────
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Build star-breakdown { 1: n, 2: n, 3: n, 4: n, 5: n }
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) ratingBreakdown[star]++;
    });

    // canReview: true only when the requesting user has a delivered order
    // for this product and has NOT already reviewed it
    let canReview = false;
    if (req.user) {
      const hasPurchased = await Order.exists({
        user: req.user.id,
        'orderItems.product': productId,
        orderStatus: 'delivered',
      });
      const alreadyReviewed = await Review.exists({
        user: req.user.id,
        product: productId,
      });
      canReview = Boolean(hasPurchased) && !alreadyReviewed;
    }

    // userReview: the current user's existing review (if any), so frontend can show Edit
    let userReview = null;
    if (req.user) {
      userReview = reviews.find((r) => r.user?._id?.toString() === req.user.id) || null;
    }

    res.status(200).json({
      success: true,
      reviews,
      ratingBreakdown,
      canReview,
      userReview,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Create a review (with optional image upload)
// @route   POST /api/reviews   (multipart/form-data)
// @access  Private
// ─────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Gate: must have a delivered order for this product
    const hasPurchased = await Order.exists({
      user: req.user.id,
      'orderItems.product': productId,
      orderStatus: 'delivered',
    });

    // Gate: no duplicate review
    const existingReview = await Review.findOne({ user: req.user.id, product: productId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Upload any attached images
    const uploadedImages = await uploadImages(req.files);

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: Boolean(hasPurchased),
      images: uploadedImages, // [{ url, publicId }]
    });

    await review.populate('user', 'name avatar');

    // Update product aggregate rating
    await recalculateProductRating(productId);
    await clearCachePattern('cache:/api/products*');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Update a review
// @route   PUT /api/reviews/:id   (multipart/form-data)
// @access  Private (owner only)
// ─────────────────────────────────────────────
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment, removeImageIds } = req.body;

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Delete images the user explicitly removed (array of publicIds)
    let removedIds = [];
    if (removeImageIds) {
      removedIds = Array.isArray(removeImageIds) ? removeImageIds : [removeImageIds];
      await Promise.all(removedIds.map((pid) => deleteFromCloudinary(pid)));
      review.images = review.images.filter((img) => !removedIds.includes(img.publicId));
    }

    // Upload newly attached images
    const newImages = await uploadImages(req.files);
    review.images = [...review.images, ...newImages];

    review.rating = Number(rating);
    review.title = title;
    review.comment = comment;
    await review.save();
    await review.populate('user', 'name avatar');

    await recalculateProductRating(review.product);
    await clearCachePattern('cache:/api/products*');

    res.status(200).json({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a review (and its Cloudinary images)
// @route   DELETE /api/reviews/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;

    // Delete all Cloudinary images
    if (review.images && review.images.length > 0) {
      await Promise.all(review.images.map((img) => deleteFromCloudinary(img.publicId)));
    }

    await review.deleteOne();
    await recalculateProductRating(productId);
    await clearCachePattern('cache:/api/products*');

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};