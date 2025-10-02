# Isaks Store - Full-Stack E-commerce Platform

A modern e-commerce platform built with Next.js, Express, MongoDB, and Stripe.

## 🚀 Tech Stack

- **Frontend**: Next.js, React, Redux Toolkit, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Payments**: Stripe API
- **Authentication**: JWT
- **State Management**: Redux Toolkit

## 📁 Project Structure

```
isaks-store/
├── frontend/          # Next.js frontend
│   ├── pages/         # Next.js routes
│   ├── components/    # Shared UI components
│   ├── store/         # Redux Toolkit setup
│   ├── styles/        # TailwindCSS
│   └── utils/         # Helpers (auth, fetch, etc.)
├── backend/           # Express backend
│   └── src/
│       ├── models/    # Mongoose schemas
│       ├── routes/    # Express routes
│       ├── controllers/ # Business logic
│       ├── middleware/ # Auth, error handling
│       └── server.js  # Express app entry
└── package.json       # Root config for scripts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/isaks-store

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 📋 Development Roadmap

- [x] **Step 1**: Project Setup ✅
- [ ] **Step 2**: Authentication (User model, JWT, login/register)
- [ ] **Step 3**: Product Management (CRUD API, frontend pages)
- [ ] **Step 4**: Shopping Cart (Redux, localStorage persistence)
- [ ] **Step 5**: Checkout & Stripe (Payment integration)
- [ ] **Step 6**: Admin Dashboard (Product/order management)
- [ ] **Step 7**: Polish (Responsive design, SEO, deployment)

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build frontend for production
- `npm run start` - Start backend in production mode
- `npm run install:all` - Install all dependencies

## 🌐 API Endpoints

- `GET /` - API health check
- `GET /api/health` - Detailed health status

## 📝 Notes

- Frontend runs on port 3000
- Backend runs on port 5000
- MongoDB connection is configured for local development
- Stripe integration is set up for test mode
