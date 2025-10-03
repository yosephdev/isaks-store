import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { clearCart } from '../../store/cartSlice';
import api from '../../utils/api';

export default function PaymentSuccess() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orderId } = router.query;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!router.isReady || !isMounted) return;

    if (orderId) {
      loadOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [router.isReady, orderId, isMounted]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setOrder(data.data);
      
      // Clear cart after successful payment
      dispatch(clearCart());
      
    } catch (error) {
      console.error('Failed to load order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
            <Link href="/cart" className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700">
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600 capitalize">{order.payment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium text-blue-600 capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-lg">${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Customer</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                  <p>{order.customerInfo.email}</p>
                  {order.customerInfo.phone && <p>{order.customerInfo.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {order.billingAddress && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.billingAddress.street}</p>
                    <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">What's Next?</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• You'll receive an email confirmation shortly</p>
                <p>• We'll process your order within 1-2 business days</p>
                <p>• You'll get a tracking number once shipped</p>
                <p>• Expected delivery: 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Link 
            href="/products" 
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/orders" 
            className="inline-block bg-zinc-800 text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
