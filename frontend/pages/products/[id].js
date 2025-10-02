import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../../components/Navbar';
import { addToCart } from '../../store/cartSlice';
import api from '../../utils/api';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      const productData = response.data.data;
      
      // Normalize the product data to match expected format
      const normalizedProduct = {
        _id: productData.id || productData._id,
        name: productData.title || productData.name,
        title: productData.title || productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        images: productData.images || (productData.image ? [{ url: productData.image, alt: productData.title }] : []),
        category: productData.category,
        subcategory: productData.subcategory,
        stock: productData.stock,
        sku: productData.sku || productData.id,
        brand: productData.brand,
        tags: productData.tags || [],
        rating: productData.rating,
        ratings: productData.ratings
      };
      
      setProduct(normalizedProduct);
      setError(null);
    } catch (err) {
      setError('Product not found');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    
    setAddingToCart(true);
    
    try {
      // Add the product to cart with the selected quantity
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product));
      }
      
      // Show success message (you could add a toast notification here)
      alert(`${quantity} ${product.name} added to cart!`);
      
      // Reset quantity
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getCartItemQuantity = () => {
    const cartItem = items.find(item => item._id === product?._id);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link href="/products" className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
            <li>/</li>
            <li><Link href={`/products?category=${product.category}`} className="hover:text-primary-600">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-w-16 aspect-h-12 mb-4">
              <img
                src={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[selectedImage]?.url || '/images/placeholder.jpg'
                    : product.image || '/images/placeholder.jpg'
                }
                alt={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[selectedImage]?.alt || product.name
                    : product.title || product.name
                }
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Thumbnail Images */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-black' : ''
                    } bg-black text-white hover:bg-zinc-900`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary-600">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {(typeof product.stock === 'undefined' || product.stock > 0) ? (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-medium">In Stock</span>
                  <span className="text-gray-600">({typeof product.stock === 'undefined' ? 99 : product.stock} available)</span>
                </div>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-600">{product.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="ml-2 text-gray-600">{product.brand || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600 capitalize">{product.category}</span>
                </div>
                {product.subcategory && (
                  <div>
                    <span className="font-medium text-gray-700">Subcategory:</span>
                    <span className="ml-2 text-gray-600 capitalize">{product.subcategory}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {(typeof product.stock === 'undefined' || product.stock > 0) && (
              <div className="mb-6">
                {getCartItemQuantity() > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      {getCartItemQuantity()} already in cart
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-2 bg-black text-white hover:bg-zinc-900"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={typeof product.stock === 'undefined' ? 99 : product.stock}
                      className="w-16 px-2 py-2 text-center border-0 focus:outline-none"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-2 bg-black text-white hover:bg-zinc-900"
                      disabled={quantity >= (typeof product.stock === 'undefined' ? 99 : product.stock)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-black text-white px-8 py-3 rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings */}
        {((product.ratings && product.ratings.count > 0) || (product.rating && product.rating.count > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews</h3>
                <div className="flex items-center space-x-2">
            <span className="text-yellow-600 font-bold">
              ★ {product.ratings ? product.ratings.average : product.rating?.rate}
            </span>
            <span className="text-gray-600">
              ({product.ratings ? product.ratings.count : product.rating?.count} reviews)
            </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
