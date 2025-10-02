// Cart utility functions

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculateCartTotals = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    totalQuantity,
    totalAmount,
    formattedTotal: formatPrice(totalAmount)
  };
};

export const getCartItemCount = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const isItemInCart = (items, productId) => {
  return items.some(item => item._id === productId);
};

export const getCartItemQuantity = (items, productId) => {
  const item = items.find(item => item._id === productId);
  return item ? item.quantity : 0;
};

export const validateCartItem = (product, quantity) => {
  const errors = [];
  
  if (!product) {
    errors.push('Product not found');
  }
  
  if (quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (quantity > product?.stock) {
    errors.push(`Only ${product.stock} items available in stock`);
  }
  
  if (!product?.isActive) {
    errors.push('Product is not available');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getCartSummary = (items) => {
  const { totalQuantity, totalAmount } = calculateCartTotals(items);
  
  return {
    itemCount: items.length,
    totalQuantity,
    totalAmount,
    formattedTotal: formatPrice(totalAmount),
    isEmpty: items.length === 0,
    hasItems: items.length > 0
  };
};

export const getShippingEstimate = (totalAmount) => {
  // Free shipping over $50
  if (totalAmount >= 50) {
    return {
      cost: 0,
      formatted: 'Free',
      message: 'Free shipping on orders over $50'
    };
  }
  
  // Standard shipping $5.99
  return {
    cost: 5.99,
    formatted: formatPrice(5.99),
    message: 'Standard shipping'
  };
};

export const getTaxEstimate = (totalAmount, taxRate = 0.08) => {
  const tax = totalAmount * taxRate;
  return {
    amount: tax,
    formatted: formatPrice(tax),
    rate: taxRate
  };
};

export const getOrderTotal = (items, includeShipping = true, includeTax = true) => {
  const { totalAmount } = calculateCartTotals(items);
  const shipping = includeShipping ? getShippingEstimate(totalAmount) : { cost: 0 };
  const tax = includeTax ? getTaxEstimate(totalAmount) : { amount: 0 };
  
  const orderTotal = totalAmount + shipping.cost + tax.amount;
  
  return {
    subtotal: totalAmount,
    shipping: shipping.cost,
    tax: tax.amount,
    total: orderTotal,
    formatted: {
      subtotal: formatPrice(totalAmount),
      shipping: shipping.formatted,
      tax: tax.formatted,
      total: formatPrice(orderTotal)
    }
  };
};

// Local storage helpers
export const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
    return false;
  }
};

export const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return null;
};

export const clearCartFromStorage = () => {
  try {
    localStorage.removeItem('cart');
    return true;
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
    return false;
  }
};
