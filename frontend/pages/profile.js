import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { logout } from '../store/authSlice';
import { useLayoutEffect } from 'react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Handle client-side auth check and hydration
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated || !user) {
        const currentPath = router.pathname;
        if (currentPath === '/profile' || activeTab === 'orders') {
          router.replace('/login?redirect=/profile');
        }
      }
    };
    
    checkAuth();
  }, [isAuthenticated, user, router, activeTab]);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'US'
        }
      });
    }
  }, [user, isAuthenticated, router]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrderError(null);
    console.log('Fetching orders...');
    
    try {
      const response = await api.get('/orders/my-orders');
      console.log('Orders API response:', response.data);
      
      if (response.data?.data?.orders) {
        console.log('Setting orders:', response.data.data.orders);
        setOrders(response.data.data.orders);
      } else {
        console.error('Invalid order data structure:', response?.data);
        setOrders([]);
        setOrderError('Invalid order data received');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      if (error.response?.status === 401) {
        // If not authenticated and trying to view orders, redirect to login
        if (activeTab === 'orders') {
          router.replace('/login?redirect=/profile?tab=orders');
        }
      } else {
        setOrderError(
          error.response?.data?.message || 
          'Failed to load your orders. Please try again later.'
        );
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders when tab changes to orders or when the page loads
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/auth/profile', formData);
      setIsEditing(false);
      // You might want to update the user in Redux store here
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status = '') => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // Default to pending style
    }
  };

  // Server-side/initial render safety check
  if (typeof window === 'undefined' || !isAuthenticated) {
    return null;
  }

  if (!mounted) {
    return null; // Prevent hydration issues by not rendering anything until client-side
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Account</h1>
        
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => {
                console.log('Switching to orders tab');
                setActiveTab('orders');
              }}
              className={`${
                activeTab === 'orders'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Orders
            </button>
          </nav>
        </div>

        {activeTab === 'profile' ? (
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-900"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                          isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                          isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                          isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        value={user?.role || ''}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your street address"
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                            isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your city"
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                            isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your state/province"
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                            isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your ZIP/postal code"
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                            isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <select
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                            isEditing ? 'focus:ring-black focus:border-black hover:border-gray-400' : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          <option value="">Select a country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="AF">Afghanistan</option>
                          <option value="AL">Albania</option>
                          <option value="DZ">Algeria</option>
                          <option value="AR">Argentina</option>
                          <option value="AT">Austria</option>
                          <option value="BE">Belgium</option>
                          <option value="BR">Brazil</option>
                          <option value="CN">China</option>
                          <option value="CO">Colombia</option>
                          <option value="DK">Denmark</option>
                          <option value="EG">Egypt</option>
                          <option value="FI">Finland</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="GR">Greece</option>
                          <option value="HK">Hong Kong</option>
                          <option value="IN">India</option>
                          <option value="ID">Indonesia</option>
                          <option value="IE">Ireland</option>
                          <option value="IL">Israel</option>
                          <option value="IT">Italy</option>
                          <option value="JP">Japan</option>
                          <option value="KR">Korea, Republic of</option>
                          <option value="MY">Malaysia</option>
                          <option value="MX">Mexico</option>
                          <option value="NL">Netherlands</option>
                          <option value="NZ">New Zealand</option>
                          <option value="NO">Norway</option>
                          <option value="PK">Pakistan</option>
                          <option value="PH">Philippines</option>
                          <option value="PL">Poland</option>
                          <option value="PT">Portugal</option>
                          <option value="RU">Russian Federation</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="SG">Singapore</option>
                          <option value="ZA">South Africa</option>
                          <option value="ES">Spain</option>
                          <option value="SE">Sweden</option>
                          <option value="CH">Switzerland</option>
                          <option value="TW">Taiwan</option>
                          <option value="TH">Thailand</option>
                          <option value="TR">Turkey</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="VN">Vietnam</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-900 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : orderError ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <p className="text-sm text-red-600">{orderError}</p>
                <div className="mt-6">
                  <button
                    onClick={fetchOrders}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-zinc-900"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-zinc-900"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                  {orders.length > 0 && orders.map((order, index) => (
                    <li key={order._id || index} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            order.status || 'pending'
                          )}`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ${(order.pricing?.total || 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-sm font-medium text-black hover:text-zinc-800 flex items-center gap-1"
                          >
                            View Order Details →
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}