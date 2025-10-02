import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function TestAPI() {
  const [result, setResult] = useState('Loading...');

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connection...');
        const response = await api.get('/api/products?page=1&limit=5');
        console.log('API Response:', response.data);
        setResult(`Success! Found ${response.data.data.products.length} products`);
      } catch (error) {
        console.error('API Error:', error);
        setResult(`Error: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <p className="text-lg">{result}</p>
    </div>
  );
}
