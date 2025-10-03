const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const products = require('../frontend/products.json');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded from:', path.join(__dirname, '.env'));

const categoryMapping = {
  electronics: 'electronics',
  clothing: 'clothing',
  accessories: 'accessories',
  bags: 'accessories',
  home: 'home',
  sports: 'sports',
  books: 'books'
};

const migrateProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    console.log('Using MongoDB URI:', mongoUri);

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    const transformedProducts = products.map(product => ({
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      category: categoryMapping[product.category] || 'other',
      rating: product.rating || { rate: 0, count: 0 },
      stock: 99 // Set default stock for all products
    }));

    await Product.insertMany(transformedProducts);
    console.log('✨ Successfully migrated ' + transformedProducts.length + ' products');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

migrateProducts();
