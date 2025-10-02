import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'other',
    subcategory: '',
    brand: '',
    sku: '',
    stock: '',
    lowStockThreshold: '10',
    tags: '',
    isActive: true,
    isFeatured: false,
    images: [{ url: '', alt: '', isPrimary: true }]
  });

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login?redirect=/admin');
      return;
    }
    loadProducts();
  }, [isAuthenticated, user, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products?limit=50');
      setProducts(response.data.data.products);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', isPrimary: false }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: formData.images.filter(img => img.url.trim())
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, productData);
      } else {
        await api.post('/api/products', productData);
      }

      setShowCreateForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      sku: product.sku || '',
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      tags: product.tags ? product.tags.join(', ') : '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: product.images.length > 0 ? product.images : [{ url: '', alt: '', isPrimary: true }]
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'other',
      subcategory: '',
      brand: '',
      sku: '',
      stock: '',
      lowStockThreshold: '10',
      tags: '',
      isActive: true,
      isFeatured: false,
      images: [{ url: '', alt: '', isPrimary: true }]
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingProduct(null);
              resetForm();
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="home">Home</option>
                        <option value="sports">Sports</option>
                        <option value="books">Books</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                      <input
                        type="text"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Images</label>
                      <button
                        type="button"
                        onClick={addImage}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        + Add Image
                      </button>
                    </div>
                    
                    {formData.images.map((image, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div className="flex items-end space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={image.isPrimary}
                              onChange={(e) => handleImageChange(index, 'isPrimary', e.target.checked)}
                              className="mr-2"
                            />
                            Primary
                          </label>
                          
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Active
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Featured
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.primaryImage || '/images/placeholder.jpg'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
