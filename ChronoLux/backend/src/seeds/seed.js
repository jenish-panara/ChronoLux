const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');

dotenv.config();

// Sample data
const categories = [
  {
    name: 'Luxury Watches',
    slug: 'luxury-watches',
    description: 'Premium luxury timepieces from renowned brands',
    image: 'luxury.jpg',
  },
  {
    name: 'Sports Watches',
    slug: 'sports-watches',
    description: 'Durable watches designed for sports and outdoor activities',
    image: 'sports.jpg',
  },
  {
    name: 'Smart Watches',
    slug: 'smart-watches',
    description: 'Connected smartwatches with advanced features',
    image: 'smart.jpg',
  },
];

const products = [
  {
    name: 'Rolex Submariner',
    slug: 'rolex-submariner',
    description: 'The iconic diving watch with exceptional water resistance and timeless design.',
    price: 125000,
    discount: 5,
    brand: 'Rolex',
    stock: 15,
    category: null, // Will be set dynamically
    images: ['https://img.chrono24.com/images/uhren/images_25/s2/12604225_xxl_v1570553570419.jpg'],
    gender: 'men',
    rating: 4.8,
    numReviews: 45,
    isNewArrival: true,
    isFeatured: true,
    isBestSeller: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '41 mm',
      'Movement': 'Automatic',
      'Water Resistance': '300 meters',
      'Crystal': 'Sapphire Crystal',
    },
  },
  {
    name: 'Omega Speedmaster',
    slug: 'omega-speedmaster',
    description: 'The legendary chronograph that has been part of all six moon landings.',
    price: 89500,
    discount: 0,
    brand: 'Omega',
    stock: 20,
    category: null,
    images: ['https://cdn1.ethoswatches.com/media/catalog/product/cache/6e5de5bc3d185d8179cdc7258143f41a/o/m/omega-speedmaster-310-30-42-50-01-002-large.jpg'],
    gender: 'men',
    rating: 4.9,
    numReviews: 67,
    isFeatured: true,
    isBestSeller: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '42 mm',
      'Movement': 'Manual Wind',
      'Water Resistance': '50 meters',
      'Crystal': 'Hesalite Crystal',
    },
  },
  {
    name: 'Titan Edge',
    slug: 'titan-edge',
    description: 'Slim and elegant watch with modern features.',
    price: 15000,
    discount: 10,
    brand: 'Titan',
    stock: 50,
    category: null,
    images: ['https://img.tatacliq.com/images/i23//437Wx649H/MP000000025840236_437Wx649H_202503261951151.jpeg'],
    gender: 'men',
    rating: 4.2,
    numReviews: 28,
    isNewArrival: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '40 mm',
      'Movement': 'Quartz',
      'Water Resistance': '30 meters',
      'Crystal': 'Mineral Crystal',
    },
  },
  {
    name: 'Casio G-Shock',
    slug: 'casio-g-shock',
    description: 'Rugged and shock-resistant watch perfect for outdoor adventures.',
    price: 8000,
    discount: 0,
    brand: 'Casio',
    stock: 100,
    category: null,
    images: ['https://gshock.casio.com/content/casio/locales/us/en/brands/gshock/products/men/_jcr_content/root/responsivegrid/container_2106131580_1009502595/container_1689197747/teaser_copy.casiocoreimg.jpeg/1781030558030/gmcb2100-parts-kv-800x800.jpeg'],
    gender: 'unisex',
    rating: 4.5,
    numReviews: 156,
    isBestSeller: true,
    specifications: {
      'Case Material': 'Resin',
      'Case Diameter': '46 mm',
      'Movement': 'Quartz',
      'Water Resistance': '200 meters',
      'Crystal': 'Mineral Crystal',
    },
  },
  {
    name: 'Apple Watch Ultra',
    slug: 'apple-watch-ultra',
    description: 'The most rugged and capable Apple Watch for outdoor adventures.',
    price: 79900,
    discount: 0,
    brand: 'Apple',
    stock: 30,
    category: null,
    images: ['https://img.diylooks.com/upload/store/product_l/EDA003635801WE.jpg'],
    gender: 'unisex',
    rating: 4.7,
    numReviews: 89,
    isNewArrival: true,
    isFeatured: true,
    specifications: {
      'Case Material': 'Titanium',
      'Case Diameter': '49 mm',
      'Display': 'Retina OLED',
      'Water Resistance': '100 meters',
      'Battery Life': '36 hours',
    },
  },
  {
    name: 'Fossil Gen 6',
    slug: 'fossil-gen-6',
    description: 'Smartwatch with advanced health and fitness features.',
    price: 19950,
    discount: 15,
    brand: 'Fossil',
    stock: 45,
    category: null,
    images: ['https://www.shopyvision.com/wp-content/uploads/2022/12/Fossil-FTW4062-Gen-6-Smartwatch-for-Men-.jpg'],
    gender: 'unisex',
    rating: 4.3,
    numReviews: 34,
    isNewArrival: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '44 mm',
      'Display': 'AMOLED',
      'Water Resistance': '30 meters',
      'Battery Life': '24 hours',
    },
  },
  {
    name: 'Tag Heuer Carrera',
    slug: 'tag-heuer-carrera',
    description: 'Elegant chronograph with motorsport heritage.',
    price: 145000,
    discount: 0,
    brand: 'Tag Heuer',
    stock: 12,
    category: null,
    images: ['https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dwa3e79987/TAG_Heuer_Carrera/CBS2040.FC8318/CBS2040.FC8318_Soldier.png'],
    gender: 'men',
    rating: 4.8,
    numReviews: 41,
    isFeatured: true,
    isBestSeller: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '43 mm',
      'Movement': 'Automatic',
      'Water Resistance': '100 meters',
      'Crystal': 'Sapphire Crystal',
    },
  },
  {
    name: 'Seiko Prospex',
    slug: 'seiko-prospex',
    description: 'Professional diving watch with excellent value.',
    price: 35000,
    discount: 8,
    brand: 'Seiko',
    stock: 35,
    category: null,
    images: ['https://seikowatches.co.in/cdn/shop/files/SPB481J1.png?v=1744601801'],
    gender: 'men',
    rating: 4.6,
    numReviews: 52,
    isBestSeller: true,
    specifications: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '44 mm',
      'Movement': 'Automatic',
      'Water Resistance': '200 meters',
      'Crystal': 'Sapphire Crystal',
    },
  },
];

const coupons = [
  {
    code: 'WELCOME10',
    description: 'Get 10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 5000,
    maximumDiscount: 2000,
    usageLimit: 1000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'WATCH20',
    description: 'Get 20% off on premium watches',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrder: 10000,
    maximumDiscount: 5000,
    usageLimit: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹5000',
    discountType: 'flat',
    discountValue: 500,
    minimumOrder: 5000,
    usageLimit: 2000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@chronolux.com',
  password: 'admin123',
  role: 'admin',
  phone: '9876543210',
};

const testUser = {
  name: 'Test User',
  email: 'user@test.com',
  password: 'user123',
  role: 'customer',
  phone: '9876543211',
};

// Seed database
const seedDatabase = async () => {
  try {
    // Connect to database with better error handling
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Connected to:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.create(categories);
    console.log('✅ Categories created');

    // Create products with category references
    const luxuryCategory = createdCategories.find((c) => c.slug === 'luxury-watches');
    const sportsCategory = createdCategories.find((c) => c.slug === 'sports-watches');
    const smartCategory = createdCategories.find((c) => c.slug === 'smart-watches');

    console.log('Creating products...');
    const productsWithCategories = products.map((product) => {
      if (product.brand === 'Rolex' || product.brand === 'Omega' || product.brand === 'Tag Heuer' || product.brand === 'Seiko') {
        return { ...product, category: luxuryCategory._id };
      } else if (product.brand === 'Casio' || product.brand === 'Titan') {
        return { ...product, category: sportsCategory._id };
      } else {
        return { ...product, category: smartCategory._id };
      }
    });

    await Product.create(productsWithCategories);
    console.log('✅ Products created');

    // Create users
    console.log('Creating users...');
    await User.create(adminUser);
    await User.create(testUser);
    console.log('✅ Users created');

    // Create coupons
    console.log('Creating coupons...');
    await Coupon.create(coupons);
    console.log('✅ Coupons created');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Full error:', error);

    // Provide helpful debugging info
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas (Security → Network Access)');
    console.log('2. Verify your connection string format in .env file');
    console.log('3. Check if MongoDB Atlas cluster is running');
    console.log('4. Ensure your username/password are correct');
    console.log('5. Check your internet connection');
    console.log('6. Try running: node test-db-connection.js');

    process.exit(1);
  }
};

seedDatabase();