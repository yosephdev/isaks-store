import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../components/Navbar';
import { clearCart } from '../../store/cartSlice';
import api from '../../utils/api';

console.log('Stripe Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Payment() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orderId, clientSecret } = router.query;
  
  const [stripe, setStripe] = useState(null);
  const [stripeElements, setStripeElements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializePayment = async () => {
      if (!orderId || !clientSecret) return;

      try {
        // First load order data
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData_result = await orderResponse.json();
        const orderData = orderData_result.data;
        if (mounted) {
          setOrder(orderData);
        }

        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        if (mounted) {
          setStripe(stripeInstance);
          setPaymentElementReady(true);

          const elements = stripeInstance.elements({
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#000000',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                spacingUnit: '6px',
                borderRadius: '4px'
              },
              rules: {
                '.Input': {
                  backgroundColor: '#ffffff'
                }
              }
            }
          });

          const paymentElement = elements.create('payment', {
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: false
            },
            wallets: {
              applePay: 'never',
              googlePay: 'never'
            }
          });

          // Mount after a short delay to ensure the container is ready
          // Try mounting immediately
          const container = document.getElementById('payment-element');
          if (container) {
            try {
              paymentElement.mount('#payment-element');
              console.log('Payment element mounted successfully');
            } catch (err) {
              console.error('Error mounting payment element:', err);
            }
          } else {
            // If container not ready, try again after a short delay
            setTimeout(() => {
              const delayedContainer = document.getElementById('payment-element');
              if (delayedContainer) {
                try {
                  paymentElement.mount('#payment-element');
                  console.log('Payment element mounted after delay');
                } catch (err) {
                  console.error('Error mounting payment element after delay:', err);
                }
              }
            }, 500);
          }
          setStripeElements(elements);
        }

        // No need to reload order details here, already loaded above
      } catch (err) {
        console.error('Payment initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize payment. Please try again.');
        }
      }
    };

    initializePayment();

    return () => {
      mounted = false;
    };
  }, [orderId, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !stripeElements) {
      setError('Please wait while we initialize the payment system.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements: stripeElements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`
        }
      });

      if (stripeError) {
        setError(stripeError.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || !clientSecret) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Session</h1>
            <Link href="/cart" className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="mt-2 text-gray-600">Please review your order and enter payment details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-5">
            {order && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 py-4 border-b border-gray-200">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>${order.pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>${order.pricing.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax</span>
                      <span>${order.pricing.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span>${order.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="min-h-[250px] relative">
                  {!paymentElementReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-500">Loading payment form...</div>
                    </div>
                  )}
                  <div 
                    id="payment-element" 
                    className="bg-white p-4 rounded-md"
                  ></div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !stripe || !stripeElements}
                  className="w-full bg-black text-white py-4 px-6 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <span>Pay ${order?.pricing.total.toFixed(2)}</span>
                  )}
                </button>

                <p className="mt-4 text-sm text-gray-500 text-center">
                  🔒 Your payment information is secure and encrypted
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}