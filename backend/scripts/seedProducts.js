// Script to seed MongoDB with products from products.json
// Usage: node backend/scripts/seedProducts.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../src/models/Product');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const productsPath = path.join(__dirname, '../../frontend/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/isaks-store';

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Remove all existing products
  await Product.deleteMany({});

  // Allowed categories from schema
  const allowedCategories = ['electronics', 'clothing', 'accessories', 'home', 'sports', 'books', 'other'];
  // Prepare products for MongoDB
  const products = productsData.map((p) => {
    let category = (p.category || '').toLowerCase();
    if (!allowedCategories.includes(category)) {
      category = 'other';
    }
    return {
      name: p.title || p.name,
      description: p.description || '',
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      image: p.image,  // Keep original image path
      primaryImage: p.image, // Keep original image path
      images: p.images || [],
      category,
      brand: p.brand || '',
      stock: typeof p.stock === 'number' ? p.stock : 99,
      tags: p.tags || [],
      rating: p.rating || { rate: 0, count: 0 },
      isActive: true
    };
  });

  await Product.insertMany(products);
  console.log('Seeded products!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
