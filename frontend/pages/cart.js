import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { removeFromCart, removeItemCompletely, updateQuantity, clearCart } from '../store/cartSlice';

function Cart() {
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [showRemoveItemDialog, setShowRemoveItemDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    setItemToRemove(items.find(item => item._id === productId));
    setShowRemoveItemDialog(true);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      dispatch(removeItemCompletely(itemToRemove._id));
    }
    setShowRemoveItemDialog(false);
    setItemToRemove(null);
  };

  const handleClearCart = () => {
    setShowClearCartDialog(true);
  };

  const confirmClearCart = () => {
    dispatch(clearCart());
    setShowClearCartDialog(false);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  if (!isClient) {
    return null;
  } else if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <img
              src={'/isakstore.jpg'}
              alt="Isaks Store Logo"
              className="w-14 h-14 rounded-full mb-4 shadow-lg mx-auto"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 font-medium transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-2 text-gray-600">{totalQuantity} item{totalQuantity !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">${item.price} each</p>
                          <p className="text-sm text-gray-500">Stock: {item.stock} available</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={item.quantity >= item.stock}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                      <span className="font-medium">${Number(totalAmount).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-primary-600">${Number(totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    >
                      Proceed to Checkout
                    </button>
                    
                    <Link
                      href="/products"
                      className="block w-full bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showClearCartDialog}
          onClose={() => setShowClearCartDialog(false)}
          onConfirm={confirmClearCart}
          title="Clear Shopping Cart"
          message="Are you sure you want to remove all items from your cart? This action cannot be undone."
          confirmButton="Clear Cart"
          cancelButton="Keep Items"
        />

        {/* Remove Item Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showRemoveItemDialog}
          onClose={() => {
            setShowRemoveItemDialog(false);
            setItemToRemove(null);
          }}
          onConfirm={confirmRemoveItem}
          title="Remove Item"
          message={itemToRemove ? `Are you sure you want to remove "${itemToRemove.name}" from your cart?` : ''}
          confirmButton="Remove Item"
          cancelButton="Keep Item"
        />
      </div>
    );
  }
}

export default Cart;
