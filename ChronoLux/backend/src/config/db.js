const mongoose = require('mongoose');

const LOCAL_MONGO_URI = 'mongodb+srv://jenishpanara1492005_db_user:Zzct8t2tPJaMiqGj@cluster0.mq9zwlm.mongodb.net/chronolux';

const connectWithFallback = async (uri) => {
  try {
    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
  } catch (error) {
    if (uri !== LOCAL_MONGO_URI) {
      console.warn(`Primary MongoDB connection failed (${error.message}). Trying local MongoDB at ${LOCAL_MONGO_URI}...`);
      return mongoose.connect(LOCAL_MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });
    }

    throw error;
  }
};

const connectDB = async () => {
  try {
    const conn = await connectWithFallback(process.env.MONGODB_URI || LOCAL_MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;