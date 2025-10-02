"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, removeItemCompletely, updateQuantity } from '../store/cartSlice';

export default function CartIcon() {
  const [isClient, setIsClient] = useState(false);
  const { totalQuantity } = useSelector((state) => state.cart);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <Link href="/cart" className="relative group">
  <div className="flex items-center px-2 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200">
    <div className="relative">
      <svg
        className="w-6 h-6 transition-transform group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 5h14l-2-5M7 13h10v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z"
        />
        <circle cx="9" cy="21" r="1.5" />
        <circle cx="17" cy="21" r="1.5" />
      </svg>

      {isClient && totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[0.625rem] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg animate-pulse">
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </span>
      )}
    </div>
  </div>
</Link>

  );
}

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRemoveItem = (productId) => {
    dispatch(removeItemCompletely(productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
  className="relative inline-flex items-center justify-center rounded-md p-2 bg-black text-white transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        aria-label="Shopping cart"
      >
        <img src="/isakstore.jpg" alt="Isaks Store" className="h-5 w-5" />
        {isClient && totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-background rounded-md border shadow-lg z-20">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-foreground">Shopping Cart</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-black text-white p-1 rounded-md transition-colors hover:bg-zinc-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-b mb-3"></div>

              {!isClient || items.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors">
                        <img
                          src={'/isakstore.jpg'}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="bg-black text-white p-1 rounded transition-colors hover:bg-zinc-900"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-xs font-medium w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="bg-black text-white p-1 rounded transition-colors hover:bg-zinc-900"
                            disabled={item.quantity >= item.stock}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="bg-black text-white ml-1 p-1 rounded transition-colors hover:bg-zinc-900"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-b mb-3"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-foreground">Total:</span>
                    <span className="font-bold text-primary">${isClient ? totalAmount.toFixed(2) : '0.00'}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      className="block w-full bg-primary text-primary-foreground text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      View Cart
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
