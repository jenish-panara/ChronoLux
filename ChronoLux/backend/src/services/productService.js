const Product = require('../models/Product');

class ProductService {
  // Get all products with filters and pagination
  async getProducts(params = {}) {
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (params.category) query.category = params.category;
    if (params.brand) query.brand = params.brand;
    if (params.gender) query.gender = params.gender;

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      query.finalPrice = {};
      if (params.minPrice) query.finalPrice.$gte = parseFloat(params.minPrice);
      if (params.maxPrice) query.finalPrice.$lte = parseFloat(params.maxPrice);
    }

    // Rating filter
    if (params.minRating) {
      query.rating = { $gte: parseFloat(params.minRating) };
    }

    // Search
    if (params.search) {
      query.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { brand: { $regex: params.search, $options: 'i' } },
      ];
    }

    // Featured/New/Best Sellers filters
    if (params.isFeatured === 'true') query.isFeatured = true;
    if (params.isNewArrival === 'true') query.isNewArrival = true;
    if (params.isBestSeller === 'true') query.isBestSeller = true;

    // Sorting
    let sort = { createdAt: -1 };
    if (params.sortBy) {
      const sortFields = {
        latest: { createdAt: -1 },
        priceLow: { finalPrice: 1 },
        priceHigh: { finalPrice: -1 },
        rating: { rating: -1 },
        popularity: { numReviews: -1 },
      };
      sort = sortFields[params.sortBy] || { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return {
      products,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Get single product with related products
  async getProduct(slug) {
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug description');

    if (!product) {
      throw new Error('Product not found');
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate('category', 'name slug')
      .limit(4);

    return { product, relatedProducts };
  }

  // Create new product
  async createProduct(data) {
    const product = await Product.create(data);
    return product;
  }

  // Update product
  async updateProduct(id, data) {
    let product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return product;
  }

  // Delete product
  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await product.deleteOne();
    return product;
  }

  // Get product statistics
  async getProductStats() {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });

    const topRatedProducts = await Product.find()
      .sort({ rating: -1 })
      .limit(5)
      .populate('category', 'name');

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name');

    return {
      stats: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        featuredProducts,
      },
      topRatedProducts,
      recentProducts,
    };
  }
}

module.exports = new ProductService();
