const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const productionMiddleware = (app) => {
  // Security headers
  app.use(helmet());

  // Enable CORS with specific origin in production
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Rate limiting
  app.use('/api/', limiter);

  // Compression
  app.use(compression());

  // Logging
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
};

module.exports = productionMiddleware;