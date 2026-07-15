'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

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
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    setUpdating(true);
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const applyCoupon = async (e) => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      await api.post('/cart/coupon', { code: couponCode });
      await fetchCart();
      setCouponCode(e.target.value);
      alert('Coupon applied successfully!');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    setUpdating(true);
    try {
      await api.delete('/cart/coupon');
      await fetchCart();
    } catch (error) {
      console.error('Error removing coupon:', error);
      alert('Failed to remove coupon');
    } finally {
      setUpdating(false);
    }
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-3 sm:gap-4 py-3 sm:py-4 border-b last:border-b-0">
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-md flex-shrink-0">
                  {item.product.images && item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-md text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-0.5 sm:mb-1 line-clamp-2">{item.product.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.product.brand}</p>
                      {item.product.stock < 10 && item.product.stock > 0 && (
                        <p className="text-orange-600 text-[10px] sm:text-xs sm:text-sm mt-1">
                          Only {item.product.stock} items left
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={updating}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-md flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="p-1 sm:p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[32px] sm:min-w-[36px] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.product.stock}
                        className="p-1 sm:p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[32px] sm:min-w-[36px] flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.discount > 0 ? (
                        <div>
                          <p className="font-bold text-sm sm:text-base">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                          <p className="text-[10px] sm:text-sm text-gray-400 line-through">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="font-bold text-sm sm:text-base">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 sticky top-16 sm:top-20">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{cart.subtotal.toLocaleString()}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm sm:text-base">
                  <span>Discount</span>
                  <span>-₹{cart.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>

              <div className="border-t pt-2 sm:pt-3">
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span>₹{cart.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cart.coupon?.code || couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  disabled={cart.coupon}
                />
                {!cart.coupon ? (
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-xs sm:text-sm whitespace-nowrap"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    disabled={updating}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Remove
                  </button>
                )}
              </div>
              {cart.coupon && (
                <p className="text-xs sm:text-sm text-green-600 mt-2">
                  Coupon applied: {cart.coupon.code}
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={proceedToCheckout}
              className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 mb-3 sm:mb-4 text-sm sm:text-base"
            >
              Proceed to Checkout
            </button>

            <a
              href="/products"
              className="block text-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}