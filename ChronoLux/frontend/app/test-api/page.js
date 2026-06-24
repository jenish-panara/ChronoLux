'use client';

import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';

export default function TestAPIPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      console.log('Testing API...');
      const response = await productsAPI.getProducts();
      console.log('API Response:', response);
      setProducts(response.data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        {loading && <p className="text-blue-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && <p className="text-green-600">✅ API Connected Successfully!</p>}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Products Found: {products.length}</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.brand}</p>
                <p className="text-gray-600">₹{product.finalPrice?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">Rating: {product.rating || 0}/5</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No products found</p>
        )}
      </div>
    </div>
  );
}