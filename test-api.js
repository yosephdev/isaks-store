// Test API connection
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    const response = await axios.get('http://localhost:5000/api/products');
    console.log('✅ API is working!');
    console.log('Products count:', response.data.data.products.length);
    console.log('First product:', response.data.data.products[0].name);
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testAPI();
