import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
    };
  }
  
  try {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      const parsedCart = JSON.parse(cartData);
      return {
        items: parsedCart.items || [],
        totalQuantity: parsedCart.totalQuantity || 0,
        totalAmount: parsedCart.totalAmount || 0,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  };
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item._id === product._id || item.id === product.id);

      // Prefer product.image, fallback to primaryImage or images[0].url
      const image = product.image || product.primaryImage || (product.images && product.images[0] && product.images[0].url) || '';

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ 
          _id: product._id || product.id,
          name: product.name || product.title,
          price: product.price,
          image,
          stock: product.stock || 99,
          quantity: 1
        });
      }

      state.totalQuantity += 1;
      state.totalAmount += product.price;

      // Save to localStorage
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload;
      const existingItem = state.items.find(item => item._id === productId);
      
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(item => item._id !== productId);
        } else {
          existingItem.quantity -= 1;
        }
        
        state.totalQuantity -= 1;
        state.totalAmount -= existingItem.price;
        
        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    
    removeItemCompletely: (state, action) => {
      const productId = action.payload;
      const existingItem = state.items.find(item => item._id === productId);
      
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.quantity * existingItem.price;
        state.items = state.items.filter(item => item._id !== productId);
        
        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item._id === id);
      
      if (existingItem && quantity > 0 && quantity <= existingItem.stock) {
        const quantityDiff = quantity - existingItem.quantity;
        existingItem.quantity = quantity;
        state.totalQuantity += quantityDiff;
        state.totalAmount += quantityDiff * existingItem.price;
        
        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    
    loadCartFromStorageAction: (state) => {
      const cartData = loadCartFromStorage();
      state.items = cartData.items;
      state.totalQuantity = cartData.totalQuantity;
      state.totalAmount = cartData.totalAmount;
    },
    
    syncCartWithServer: (state, action) => {
      // This will be used to sync cart with server data
      const serverCart = action.payload;
      state.items = serverCart.items || [];
      state.totalQuantity = serverCart.totalQuantity || 0;
      state.totalAmount = serverCart.totalAmount || 0;
      
      // Save to localStorage
      saveCartToStorage(state);
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  removeItemCompletely,
  clearCart, 
  updateQuantity,
  loadCartFromStorageAction,
  syncCartWithServer
} = cartSlice.actions;
export default cartSlice.reducer;
