import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

export default function OrderDetail() {
  const router = useRouter();
  const { orderId } = router.query;
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push({
          pathname: '/login',
          query: { redirect: `/orders/${orderId}` },
        });
        return false;
      }
      return true;
    };

    const loadOrder = async () => {
      if (!checkAuth()) return;

      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      await fetchOrder();
    };

    loadOrder();
  }, [router.isReady, orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      
      if (response.data?.success === false) {
        setError(response.data.message || 'Failed to load order details');
        setOrder(null);
        return;
      }

      if (!response.data?.data?.order) {
        setError('Invalid order data received');
        setOrder(null);
        return;
      }

      setOrder(response.data.data.order);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError(
        err.response?.data?.message || 
        'Failed to load the order details. Please try again later.'
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link
                href="/profile"
                className="text-black hover:text-zinc-800"
              >
                ← Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
            <Link
              href="/orders"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
            >
              Back to Orders
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
        <div className="mb-8">
          <Link
            href="/orders"
            className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-gray-600">
            Order #{order.orderNumber} • Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Order Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Current status of your order
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0 w-20 h-20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Price Breakdown
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  ${order.pricing.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">
                  ${order.pricing.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">
                  ${order.pricing.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-4 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  ${order.pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-500">
                  <p>{`${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim()}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                    {order.shippingAddress?.zipCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
              {order.billingAddress && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Billing Address
                  </h3>
                  <div className="text-sm text-gray-500">
                    <p>{`${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim()}</p>
                    <p>{order.billingAddress?.street}</p>
                    <p>
                      {order.billingAddress?.city}, {order.billingAddress?.state}{' '}
                      {order.billingAddress?.zipCode}
                    </p>
                    <p>{order.billingAddress?.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="text-sm text-gray-500">
              <p>Email: {order.email}</p>
              {order.phone && <p>Phone: {order.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}