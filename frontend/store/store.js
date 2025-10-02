import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

// Function to initialize the auth state
const initializeState = () => {
  if (typeof window === 'undefined') {
    return {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    };
  }

  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return {
      auth: {
        user: user ? JSON.parse(user) : null,
        isAuthenticated: Boolean(token && user),
        loading: false,
        error: null
      }
    };
  } catch (error) {
    console.error('Failed to initialize state:', error);
    return {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    };
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  preloadedState: initializeState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript types (if using TypeScript, uncomment these)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
