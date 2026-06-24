const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      default: 0,
    },
    images: [{
      type: String,
    }],
    thumbnail: {
      type: String,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
    },
    features: [{
      type: String,
    }],
    colors: [{
      type: String,
    }],
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate final price before saving
productSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.finalPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.finalPrice = this.price;
  }
  next();
});

// Create slug from name if not provided
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);