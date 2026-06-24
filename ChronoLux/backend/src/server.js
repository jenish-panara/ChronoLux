require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections — log only; don't crash in development
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});