const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const products = require('../frontend/products.json');

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
    const mongoUri = 'mongodb+srv://yosephbet_db_user:YkwRX8dGkqVuc7P5@cluster0.gtyeumi.mongodb.net/isaks-store?retryWrites=true&w=majority&appName=Cluster0';
    
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
      rating: product.rating || { rate: 0, count: 0 }
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
