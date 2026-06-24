const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);

    // Provide helpful debugging info
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your connection string format');
    console.log('3. Check if MongoDB Atlas cluster is running');
    console.log('4. Ensure your username/password are correct');
    console.log('5. Check your internet connection');

    process.exit(1);
  }
};

testConnection();