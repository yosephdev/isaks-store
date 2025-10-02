
import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import Link from 'next/link';
import api from '../utils/api';

export default function Products() {
  const dispatch = useDispatch();
  // Filters and pagination state
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    perPage: 12,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products', {
          params: {
            all: true  // Get all products for client-side filtering
          }
        });
        
        // Products are in response.data.data.products
        const productsData = response.data.data.products;
        
        if (!Array.isArray(productsData)) {
          console.error('Expected array but got:', typeof productsData, productsData);
          throw new Error('Invalid response format - expected array');
        }

        const normalizedProducts = productsData.map(p => ({
          ...p,
          _id: p.id || p._id,
          name: p.title || p.name,
          image: p.image || p.primaryImage || (p.images && p.images[0] && p.images[0].url) || "/images/placeholder.jpg"
        }));
        
        setProducts(normalizedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  // Filter, sort, and paginate products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by category
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }
    
    // Filter by price
    if (filters.minPrice) {
      result = result.filter(p => Number(p.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => Number(p.price) <= Number(filters.maxPrice));
    }
    
    // Filter by search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        (p.title || p.name)?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    
    // Sort with priority products first when sorting by createdAt
    if (filters.sortBy === 'createdAt') {
      // Define priority products that should appear first
      const priorityProducts = [
        'Smart Fitness Watch',
        'Leather Messenger Bag',
        'Portable Bluetooth Speaker',
        'Premium Wireless Headphones',
        'Minimalist Wallet',
        'Wireless Charging Pad', 
        'Stainless Steel Water Bottle',
        'USB-C Hub Adapter'
      ];
      
      result.sort((a, b) => {
        const aTitle = a.title || a.name || '';
        const bTitle = b.title || b.name || '';
        
        const aPriority = priorityProducts.indexOf(aTitle);
        const bPriority = priorityProducts.indexOf(bTitle);
        
        // If both are priority products, sort by priority order
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }
        
        // If only one is priority, priority comes first
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        
        // For non-priority products, sort by createdAt
        if (a.createdAt && b.createdAt) {
          return filters.sortOrder === 'desc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        }
        
        // Fallback to id sorting if no createdAt
        return (b.id || b._id).toString().localeCompare((a.id || a._id).toString());
      });
    } else if (filters.sortBy === 'price') {
      result.sort((a, b) =>
        filters.sortOrder === 'desc'
          ? b.price - a.price
          : a.price - b.price
      );
    } else if (filters.sortBy === 'title') {
      result.sort((a, b) => {
        const titleA = a.title || a.name || '';
        const titleB = b.title || b.name || '';
        return filters.sortOrder === 'desc'
          ? titleB.localeCompare(titleA)
          : titleA.localeCompare(titleB);
      });
    }
    
    return result;
  }, [products, filters]);

  // Pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / filters.perPage);
  const startIndex = (filters.page - 1) * filters.perPage;
  const endIndex = filters.page * filters.perPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };
  const handlePageChange = (page) => {
    setFilters(f => ({ ...f, page }));
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
  };
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      perPage: 12,
    });
  };


  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Discover our amazing collection</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Search products..."
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={e => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={e => handleFilterChange('minPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={e => handleFilterChange('maxPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={e => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="title-asc">Name: A to Z</option>
                    <option value="title-desc">Name: Z to A</option>
                  </select>
                </div>
                {/* Filter Buttons */}
                <div className="space-y-2">
                  <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black">Apply Filters</button>
                  <button type="button" onClick={clearFilters} className="w-full bg-zinc-800 text-white py-2 px-4 rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black">Clear Filters</button>
                </div>
              </form>
            </div>
          </div>
          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <p className="text-gray-600">Showing {paginatedProducts.length} of {totalProducts} products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                paginatedProducts.map((product) => (
                <div key={product._id || product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/products/${product._id || product.id}`} className="block">
                    <img
                      src={product.image || '/images/placeholder.jpg'}
                      alt={product.name || product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name || product.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">${product.price}</span>
                        {product.rating && (
                          <span className="text-sm text-yellow-600">★ {product.rating.rate}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => dispatch(addToCart({
                      _id: product._id || product.id,
                      name: product.name || product.title,
                      price: product.price,
                      image: product.image,
                      stock: product.stock || 99
                    }))}
                    className="w-full bg-black text-white py-2 px-4 rounded-b-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black mt-0"
                    aria-label={`Add ${product.name || product.title} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-2 border border-black rounded-md text-sm font-medium text-white bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        page === filters.page
                          ? 'bg-black text-white border-black'
                          : 'border-black text-white bg-zinc-800 hover:bg-zinc-900'
                      }`}
                    >{page}</button>
                  ))}
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className="px-3 py-2 border border-black rounded-md text-sm font-medium text-white bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >Next</button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}
