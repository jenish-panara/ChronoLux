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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4 py-4 border-b last:border-b-0">
                {/* Product Image */}
                <div className="w-32 h-32 bg-white rounded-md flex-shrink-0">
                  {item.product.images && item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-md">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">{item.product.brand}</p>
                      {item.product.stock < 10 && item.product.stock > 0 && (
                        <p className="text-orange-600 text-sm mt-1">
                          Only {item.product.stock} items left
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={updating}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.product.stock}
                        className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.discount > 0 ? (
                        <div>
                          <p className="font-bold">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                          <p className="text-sm text-gray-400 line-through">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="font-bold">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
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
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{cart.subtotal.toLocaleString()}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{cart.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cart.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cart.coupon?.code || couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 p-2 border rounded-md"
                  disabled={cart.coupon}
                />
                {!cart.coupon ? (
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {cart.coupon && (
                <p className="text-sm text-green-600 mt-2">
                  Coupon applied: {cart.coupon.code}
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={proceedToCheckout}
              className="w-full px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 mb-4"
            >
              Proceed to Checkout
            </button>

            <a
              href="/products"
              className="block text-center text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}