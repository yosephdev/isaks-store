# 🛍️ Isaks Store - Premium E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-white?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Integration-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)

> 🌟 A modern, full-stack e-commerce platform delivering exceptional shopping experiences with cutting-edge technology.

## ✨ Key Features

- 🛡️ **Secure Authentication** - JWT-based user authentication and authorization
- 🛒 **Smart Shopping Cart** - Real-time cart updates with Redux persistence
- 💳 **Seamless Payments** - Secure checkout with Stripe integration
- 📱 **Responsive Design** - Mobile-first approach for all screen sizes
- 🎯 **Performance Optimized** - Fast page loads and optimized assets
- 🔍 **SEO Ready** - Built-in SEO optimization for better visibility

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 13 with React 18
- **Styling**: TailwindCSS with custom themes
- **State Management**: Redux Toolkit
- **Data Fetching**: Axios with custom interceptors

### Backend

- **Server**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Payments**: Stripe API integration

## 📁 Project Architecture

```bash
isaks-store/
├── 🌐 frontend/           # Next.js frontend application
│   ├── pages/            # Application routes and pages
│   ├── components/       # Reusable UI components
│   ├── store/           # Redux state management
│   ├── styles/          # TailwindCSS & custom styles
│   └── utils/           # Helper functions & API client
│
├── ⚙️ backend/            # Express.js backend server
│   └── src/
│       ├── models/      # MongoDB data models
│       ├── routes/      # API route definitions
│       ├── controllers/ # Business logic handlers
│       ├── middleware/  # Custom middleware
│       └── server.js    # Server entry point
│
└── 📝 package.json       # Project configuration
```

## � Getting Started

### Prerequisites

- 📦 Node.js v16+ and npm
- 🗄️ MongoDB (local or Atlas)
- 💳 Stripe Account
- 🔑 Git

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yosephdev/isaks-store.git

# Install dependencies
cd isaks-store
npm run install:all
```

### 2. Environment Configuration

Create `.env` files in both frontend and backend directories:

#### Backend `.env`

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/isaks-store

# Security
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key

# Server Settings
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 3. Launch Development Environment

```bash
# Start all services
npm run dev

# Available Commands:
npm run dev:frontend  # Next.js on :3000
npm run dev:backend   # Express on :5000
```

## 🌟 Features & Progress

- ✅ **Core Platform**
  - [x] Project architecture & setup
  - [x] Development environment
  - [x] Production deployment
  
- ✅ **Authentication & Security**
  - [x] JWT-based authentication
  - [x] User registration & login
  - [x] Protected routes & middleware
  
- ✅ **Product Management**
  - [x] Product catalog & search
  - [x] Category management
  - [x] Image optimization
  
- ✅ **Shopping Experience**
  - [x] Shopping cart functionality
  - [x] Real-time updates
  - [x] Order management
  
- ✅ **Payment Integration**
  - [x] Stripe checkout process
  - [x] Payment webhooks
  - [x] Order confirmation
  
- ✅ **Admin Features**
  - [x] Product management
  - [x] Order tracking
  - [x] User management

## 🔧 Development Tools

### Available Scripts

```bash
# Development
npm run dev           # Start full stack
npm run dev:frontend  # Start Next.js
npm run dev:backend   # Start Express

# Production
npm run build        # Build for production
npm run start        # Start production server

# Utilities
npm run test        # Run test suite
npm run lint        # Check code quality
```

## 🌐 API Documentation

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details

## 💡 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

Need help? Contact us at [contact@yoseph.dev](mailto:contact@yoseph.dev) or open an issue.
