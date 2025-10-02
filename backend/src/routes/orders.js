const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');


const orderController = require('../controllers/orderController');

// Create order
router.post('/', orderController.createOrder);

// Create Stripe payment intent
router.post('/:orderId/payment-intent', orderController.createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', orderController.confirmPayment);

// Get user orders (protected)
router.get('/my-orders', protect, orderController.getUserOrders);

// Get single order (protected)
router.get('/:orderId', protect, orderController.getOrder);

// Update order status (admin only)
router.put('/:orderId/status', protect, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;