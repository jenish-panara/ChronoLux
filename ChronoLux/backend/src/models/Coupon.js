const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please enter coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please enter discount value'],
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    userSpecific: {
      type: Boolean,
      default: false,
    },
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (this.usageLimit === 0 || this.usedCount < this.usageLimit)
  );
};

module.exports = mongoose.model('Coupon', couponSchema);