# ChronoLux - Luxury Watch E-Commerce Platform

A full-stack luxury watch e-commerce platform built with Next.js, Node.js, Express, and MongoDB.

## 🚀 Features

### Customer Features
- **Product Browsing**: Advanced filtering, sorting, and search functionality
- **Shopping Cart**: Add/remove items, quantity updates, coupon codes
- **Wishlist**: Save favorite products for later
- **Checkout**: Multiple payment methods (COD, Razorpay), address management
- **Order Tracking**: Real-time order status updates
- **Reviews & Ratings**: Customer feedback system
- **User Authentication**: JWT-based secure authentication

### Admin Features
- **Dashboard**: Sales analytics, revenue tracking, customer insights
- **Product Management**: CRUD operations for products
- **Order Management**: View and update order statuses
- **Category Management**: Organize products by categories
- **User Management**: View and manage customer accounts
- **Coupon System**: Create and manage discount coupons

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with app router
- **JavaScript** - No TypeScript
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ChronoLux
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Environment Setup

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chronolux
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# For MongoDB installed locally
mongod

# Or using MongoDB Compass
# Just start the MongoDB service
```

### 6. Seed the Database

```bash
cd backend
node src/seeds/seed.js
```

This will create:
- 2 users (admin and test customer)
- 8 sample products
- 3 categories
- 3 coupon codes

**Default Login Credentials:**
- Admin: `admin@chronolux.com` / `admin123`
- Customer: `user@test.com` / `user123`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory as `frontend`
3. Add environment variables
4. Deploy!

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set root directory as `backend`
3. Add environment variables
4. Deploy!

### Database (MongoDB Atlas)

1. Create a free account on MongoDB Atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

## 📁 Project Structure

```
ChronoLux/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and cloud config
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/     # Auth and error handlers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── seeds/           # Database seeding
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── admin/           # Admin pages
│   │   ├── auth/            # Authentication pages
│   │   ├── cart/            # Cart page
│   │   ├── checkout/        # Checkout page
│   │   ├── orders/          # Orders pages
│   │   ├── products/        # Product pages
│   │   ├── layout.js        # Root layout
│   │   └── page.js          # Home page
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   ├── product/         # Product components
│   │   ├── auth/            # Auth components
│   │   └── cart/            # Cart components
│   ├── lib/                 # Utilities and API
│   │   ├── api.js           # API client
│   │   └── store.js         # State management
│   ├── .env.local           # Environment variables
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove cart item
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🎨 Features Overview

### Product Catalog
- Advanced filtering (brand, price, category, rating, gender)
- Sorting (latest, price, rating, popularity)
- Search functionality
- Product detail pages with images, specs, reviews
- Related products recommendations

### Shopping Experience
- Add to cart with quantity management
- Apply discount coupons
- Multiple payment options (COD, Razorpay)
- Address management
- Order confirmation and tracking

### User Account
- Secure authentication (JWT)
- Order history
- Wishlist management
- Profile management
- Password reset functionality

### Admin Dashboard
- Sales analytics and charts
- Product inventory management
- Order status management
- Customer insights
- Coupon creation and management

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Make sure MongoDB is running
- **Port Already in Use**: Change PORT in .env or kill existing process
- **JWT Errors**: Check JWT_SECRET in .env

### Frontend Issues
- **API Connection Error**: Check NEXT_PUBLIC_API_URL in .env.local
- **Build Errors**: Clear node_modules and reinstall
- **Style Issues**: Make sure Tailwind CSS is properly configured

## 📝 License

This project is for educational and portfolio purposes.

## 👤 Author

Jenish Panara

## 🙏 Acknowledgments

- Next.js documentation
- Tailwind CSS
- MongoDB documentation
- Express.js framework