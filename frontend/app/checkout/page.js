'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { MapPin, Phone, User, CreditCard, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    mobile: '',
    houseNo: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      if (!response.data.cart || !response.data.cart.items || response.data.cart.items.length === 0) {
        router.push('/cart');
        return;
      }
      setCart(response.data.cart);

      // Pre-fill user data if available
      if (user) {
        setShippingAddress(prev => ({
          ...prev,
          name: user.name || '',
          mobile: user.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
    if (!shippingAddress.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(shippingAddress.mobile)) newErrors.mobile = 'Invalid mobile number';
    if (!shippingAddress.houseNo.trim()) newErrors.houseNo = 'House number is required';
    if (!shippingAddress.area.trim()) newErrors.area = 'Area is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) newErrors.pincode = 'Invalid pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
      };

      const response = await api.post('/orders', orderData);

      await api.delete('/cart');

      router.push(`/orders`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    value={shippingAddress.mobile}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, mobile: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">House No./Building Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.houseNo}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, houseNo: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="House/Flat No., Building"
                  />
                  {errors.houseNo && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.houseNo}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Area/Street *</label>
                  <input
                    type="text"
                    value={shippingAddress.area}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, area: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="Area, Street, Landmark"
                  />
                  {errors.area && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="City name"
                  />
                  {errors.city && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.state}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    disabled={processing}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Payment Method
              </h2>

              <div className="space-y-2 sm:space-y-3">
                <label className={`flex items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                    disabled={processing}
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Cash on Delivery</p>
                    <p className="text-xs sm:text-sm text-gray-600">Pay with cash at your doorstep</p>
                  </div>
                </label>

                <label className={`flex items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'razorpay' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                    disabled={processing}
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Razorpay (Online Payment)</p>
                    <p className="text-xs sm:text-sm text-gray-600">Pay securely using credit/debit card, UPI, or net banking</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 sticky top-16 sm:top-20">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-md flex-shrink-0">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-md text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-gray-600 text-[10px] sm:text-xs">Qty: {item.quantity}</p>
                      <p className="font-semibold text-xs sm:text-sm">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cart.subtotal.toLocaleString()}</span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>

                <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 sm:pt-3">
                  <span>Total</span>
                  <span>₹{cart.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:px-6 sm:py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-[10px] sm:text-xs text-gray-600 text-center mt-2 sm:mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}