
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { clearCart } from '../store/cartSlice';
import api from '../utils/api';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showAuthOptions, setShowAuthOptions] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Prefill form with user data if authenticated
    if (isAuthenticated && user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        shippingStreet: user.shippingAddress?.street || '',
        shippingCity: user.shippingAddress?.city || '',
        shippingState: user.shippingAddress?.state || '',
        shippingZipCode: user.shippingAddress?.zipCode || '',
        shippingCountry: user.shippingAddress?.country || 'US'
      }));
    }
  }, [isAuthenticated, user]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Shipping Address
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: '',
    shippingCountry: 'US',
    // Billing Address
    sameAsShipping: true,
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'US'
  });

  const [pricing, setPricing] = useState({
    subtotal: Number(totalAmount),
    shipping: 0,
    tax: 0,
    total: Number(totalAmount)
  });

  // ...existing logic and hooks...


  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Calculate pricing
  useEffect(() => {
    const subtotal = Number(totalAmount);
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    setPricing({
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      tax: Number(tax),
      total: Number(total)
    });
  }, [totalAmount]);

  if (!isClient) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill billing address if same as shipping
    if (name === 'sameAsShipping' && checked) {
      setFormData(prev => ({
        ...prev,
        billingStreet: prev.shippingStreet,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingZipCode: prev.shippingZipCode,
        billingCountry: prev.shippingCountry
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If authenticated, get user info from state
      const customerInfo = isAuthenticated ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: formData.phone || user.phone
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };
      
      const orderData = {
        customerInfo,
        shippingAddress: {
          street: formData.shippingStreet,
          city: formData.shippingCity,
          state: formData.shippingState,
          zipCode: formData.shippingZipCode,
          country: formData.shippingCountry
        },
        billingAddress: {
          street: formData.billingStreet,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: formData.billingCountry
        },
        items: items.map(item => ({
          // Try all possible ID fields: product field from order, _id from direct add, fallback to id
          productId: item.product || item._id || item.id,
          quantity: item.quantity
        })),
        pricing,
        paymentMethod: 'stripe'
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const orderData_result = await orderResponse.json();
      const createdOrder = orderData_result.data.order;
      setOrder(createdOrder);

      // Create payment intent
      const paymentResponse = await fetch(`/api/orders/${createdOrder._id}/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const paymentData = await paymentResponse.json();
      setPaymentIntent(paymentData.data);

      // Redirect to payment page
      router.push(`/checkout/payment?orderId=${createdOrder._id}&clientSecret=${paymentData.data.clientSecret}`);

    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.message || 'Failed to create order. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <Link href="/products" className="bg-black-600 text-white px-6 py-3 rounded-md hover:bg-black-700">
              Continue Shopping
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Authentication Options */}
            {!isAuthenticated && showAuthOptions && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Checkout Options</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="font-medium">Have an account?</h3>
                      <p className="text-sm text-gray-600">Sign in for faster checkout</p>
                    </div>
                    <Link
                      href={{ pathname: '/login', query: { redirect: '/checkout' } }}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="font-medium">New customer?</h3>
                      <p className="text-sm text-gray-600">Create an account for future benefits</p>
                    </div>
                    <Link
                      href={{ pathname: '/register', query: { redirect: '/checkout' } }}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="font-medium">Guest Checkout</h3>
                      <p className="text-sm text-gray-600">Continue without an account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAuthOptions(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            {(isAuthenticated || !showAuthOptions) && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {isAuthenticated ? `Welcome back, ${user.firstName}` : 'Customer Information'}
                  </h2>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowAuthOptions(true)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Back to Options
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="shippingStreet"
                    value={formData.shippingStreet}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="shippingZipCode"
                      value={formData.shippingZipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="sameAsShipping"
                    checked={formData.sameAsShipping}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>
              
              {!formData.sameAsShipping && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="billingStreet"
                      value={formData.billingStreet}
                      onChange={handleInputChange}
                      required={!formData.sameAsShipping}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        required={!formData.sameAsShipping}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        required={!formData.sameAsShipping}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        required={!formData.sameAsShipping}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{pricing.shipping === 0 ? 'Free' : `$${pricing.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
