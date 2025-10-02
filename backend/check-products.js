const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const path = require('path');

// Load environment variables from the root directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkProducts = async () => {
  try {
    console.log('Checking products in database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/isaks-store';
    const mongoUriWithDb = mongoUri.includes('mongodb+srv://') 
      ? mongoUri.replace('?retryWrites=true&w=majority&appName=Cluster0', '/isaks-store?retryWrites=true&w=majority&appName=Cluster0').replace('//isaks-store', '/isaks-store')
      : mongoUri;
    
    await mongoose.connect(mongoUriWithDb);
    console.log('✅ Connected to MongoDB');
    
    // Count products
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
    // Get first few products
    const products = await Product.find().limit(3);
    console.log('📦 Sample products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkProducts();
