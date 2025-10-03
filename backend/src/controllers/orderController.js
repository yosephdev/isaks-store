const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create order
const createOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      shippingAddress,
      billingAddress,
      items,
      pricing,
      paymentMethod
    } = req.body;

    // Validate items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Try to find product by MongoDB ObjectId first, then by legacy id
      let product;
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await Product.findById(item.productId);
      }
      
      if (!product) {
        // If not found by ObjectId, try legacy id
        product = await Product.findOne({ id: Number(item.productId) });
      }
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Calculate shipping and tax
    const shipping = pricing.shipping || 0;
    const tax = pricing.tax || 0;
    const total = subtotal + shipping + tax;

    // Generate order number (timestamp + random string)
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;

    // If billing address fields are empty, use shipping address
    const finalBillingAddress = Object.values(billingAddress).every(value => !value || value === 'US')
      ? shippingAddress
      : billingAddress;

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user ? req.user.id : null, // Optional user ID for guest checkout
      customerInfo,
      shippingAddress,
      billingAddress: finalBillingAddress,
      items: orderItems,
      pricing: {
        subtotal,
        shipping,
        tax,
        total
      },
      payment: {
        method: paymentMethod || 'stripe',
        status: 'pending'
      }
    });

    await order.save();

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Create Stripe payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.pricing.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.payment.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order._id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      order.payment.status = 'paid';
      order.status = 'processing';

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      await order.save();

      res.json({
        success: true,
        data: { order },
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log('Fetching orders for user:', req.user.id);
    
    // First check if there are any orders for this user
    const orderCount = await Order.countDocuments({ user: req.user.id });
    console.log('Order count:', orderCount);

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .select('orderNumber createdAt status items pricing user');

    console.log('Found orders:', orders.length);
    console.log('Order details:', JSON.stringify(orders[0], null, 2));
    
    res.json({
      success: true,
      data: { orders }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders. Please try again later.',
      error: error.message
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'items.product',
        select: 'title image price description' // Include fields we need
      })
      .populate('user', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order (only if user is authenticated)
    if (req.user && order.user && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Format the order data
    const formattedOrder = {
      ...order.toObject(),
      items: order.items.map(item => ({
        ...item,
        name: item.product?.title || item.name, // Use product title or fallback to item name
        image: item.product?.image || item.image // Use product image or fallback to item image
      }))
    };

    res.json({
      success: true,
      data: formattedOrder
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status,
        trackingNumber,
        notes
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order },
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  createPaymentIntent,
  confirmPayment,
  getUserOrders,
  getOrder,
  updateOrderStatus
};
