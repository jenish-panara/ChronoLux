const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Calculate total revenue (exclude cancelled orders)
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Latest 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest 5 products
    const recentProducts = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Order status breakdown
    const orderStatuses = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    const statusMap = {
      pending: 0,
      confirmed: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orderStatuses.forEach(item => {
      if (statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    // Top selling products (based on total quantity sold in completed/non-cancelled orders)
    const topSellingResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.finalPrice', '$orderItems.quantity'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
      },
      statusSummary: statusMap,
      recentOrders,
      recentProducts,
      topProducts: topSellingResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      // Search by order ID or user name/email (requires user population or join)
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const userIds = matchedUsers.map(u => u._id);

      // Check if search is a valid MongoDB ObjectId for exact order ID match
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.query.search);
      query.$or = [
        { user: { $in: userIds } }
      ];
      if (isObjectId) {
        query.$or.push({ _id: req.query.search });
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Calculate total revenue for filtering
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: orderStatus,
      updatedAt: Date.now()
    });

    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'completed';
    } else if (orderStatus === 'cancelled') {
      order.cancelledAt = Date.now();
      // Restore product stock if it was not already cancelled
      if (oldStatus !== 'cancelled') {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'customer' };
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Get order counts for each customer
    const userOrdersCounts = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } }
    ]);

    const statsMap = {};
    userOrdersCounts.forEach(item => {
      if (item._id) {
        statsMap[item._id.toString()] = {
          orderCount: item.orderCount,
          totalSpent: item.totalSpent,
        };
      }
    });

    const usersWithStats = users.map(user => {
      const stats = statsMap[user._id.toString()] || { orderCount: 0, totalSpent: 0 };
      return {
        ...user.toObject(),
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      success: true,
      users: usersWithStats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Monthly revenue and orders for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyStats.map(item => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.ordersCount,
    }));

    // 2. Best selling products (top 10 by quantity)
    const bestSelling = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.finalPrice', '$orderItems.quantity'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 }
    ]);

    // 3. Highest revenue products (top 10 by revenue)
    const highestRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.finalPrice', '$orderItems.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // 4. Low stock products (stock < 10)
    const lowStock = await Product.find({ stock: { $lt: 10 } })
      .select('name brand stock price images')
      .sort({ stock: 1 });

    // 5. Total sales details
    const totalSales = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      monthlyData: formattedMonthly,
      bestSelling,
      highestRevenue,
      lowStock,
      summary: {
        totalRevenue: totalSales[0]?.totalRevenue || 0,
        totalOrders: totalSales[0]?.totalOrders || 0,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import products via CSV JSON array
// @route   POST /api/admin/products/import-csv
// @access  Private/Admin
exports.importProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid products data format',
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // Pre-fetch all categories for rapid lookup
    const allCategories = await Category.find({});
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase().trim(), cat._id);
    });

    const productsToInsert = [];

    for (let index = 0; index < products.length; index++) {
      const row = products[index];
      const rowNum = index + 1;

      // Validate required fields
      if (!row.name || !row.description || row.price === undefined || !row.category || !row.brand || row.stock === undefined) {
        failedCount++;
        errors.push(`Row ${rowNum}: Missing required fields (name, description, price, category, brand, stock)`);
        continue;
      }

      const price = parseFloat(row.price);
      const stock = parseInt(row.stock);
      const discount = parseFloat(row.discountPrice || 0);

      if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
        failedCount++;
        errors.push(`Row ${rowNum}: Price or stock must be non-negative numbers`);
        continue;
      }

      // Check for duplicate product names/slugs
      const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const existingProduct = await Product.findOne({
        $or: [
          { name: { $regex: `^${row.name.trim()}$`, $options: 'i' } },
          { slug: slug }
        ]
      });

      if (existingProduct) {
        failedCount++;
        errors.push(`Row ${rowNum}: Product with name/slug "${row.name}" already exists`);
        continue;
      }

      // Resolve category
      const catKey = row.category.toLowerCase().trim();
      let categoryId = categoryMap.get(catKey);

      if (!categoryId) {
        // Create new category dynamically if not found
        try {
          const newCat = await Category.create({
            name: row.category.trim(),
            description: `${row.category.trim()} watch collection`,
          });
          categoryId = newCat._id;
          categoryMap.set(catKey, categoryId);
        } catch (catErr) {
          failedCount++;
          errors.push(`Row ${rowNum}: Failed to create category "${row.category}"`);
          continue;
        }
      }

      // Process images array
      let imagesArray = [];
      if (row.images) {
        if (Array.isArray(row.images)) {
          imagesArray = row.images;
        } else if (typeof row.images === 'string') {
          imagesArray = row.images.split(',').map(img => img.trim()).filter(img => img !== '');
        }
      }
      if (row.image && imagesArray.length === 0) {
        imagesArray.push(row.image);
      }
      if (imagesArray.length === 0) {
        imagesArray.push('https://placehold.co/600x600/png?text=' + encodeURIComponent(row.name));
      }

      const isFeatured = String(row.featured).toLowerCase() === 'true';
      const finalPrice = discount > 0 ? (price - (price * discount / 100)) : price;

      productsToInsert.push({
        name: row.name.trim(),
        slug: slug,
        description: row.description.trim(),
        price: price,
        discount: discount,
        finalPrice: finalPrice,
        category: categoryId,
        brand: row.brand.trim(),
        stock: stock,
        images: imagesArray,
        thumbnail: imagesArray[0],
        isFeatured: isFeatured,
        rating: 0,
        numReviews: 0,
      });
    }

    if (productsToInsert.length > 0) {
      try {
        await Product.insertMany(productsToInsert);
        successCount = productsToInsert.length;
      } catch (insertErr) {
        failedCount += productsToInsert.length;
        errors.push(`Bulk insertion failed: ${insertErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      successCount,
      failedCount,
      errors,
    });
  } catch (error) {
    next(error);
  }
};
