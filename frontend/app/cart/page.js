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
    if (!isAuthenticated) { router.push('/login'); return; }
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
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const applyCoupon = async (e) => {
    if (!couponCode.trim()) { alert('Please enter a coupon code'); return; }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--clx-ivory)]">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-[var(--clx-border)] mb-6" />
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-3 text-[var(--clx-text-primary)]">Your Cart is Empty</h2>
          <p className="text-[var(--clx-text-secondary)] mb-8 text-sm">Looks like you haven't added any timepieces yet.</p>
          <a href="/products" className="luxury-btn-gold px-8 py-3">
            Explore Collection
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <span className="section-eyebrow">Your Selection</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-4 sm:p-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-5 border-b border-[var(--clx-border-light)] last:border-b-0">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-[var(--clx-surface)] rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product.images && item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-xs">No Image</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-0.5">{item.product.brand}</p>
                        <h3 className="font-serif font-semibold text-sm sm:text-base mb-1 line-clamp-2 text-[var(--clx-text-primary)]">{item.product.name}</h3>
                        {item.product.stock < 10 && item.product.stock > 0 && (
                          <p className="text-amber-600 text-[10px] sm:text-xs mt-1">Only {item.product.stock} left</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item._id)} disabled={updating} className="p-2 text-[var(--clx-text-muted)] hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={updating || item.quantity <= 1} className="w-8 h-8 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={updating || item.quantity >= item.product.stock} className="w-8 h-8 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {item.discount > 0 ? (
                          <div>
                            <p className="font-bold text-sm sm:text-base text-[var(--clx-text-primary)]">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                            <p className="text-xs text-[var(--clx-text-muted)] line-through">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="font-bold text-sm sm:text-base text-[var(--clx-text-primary)]">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
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
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 sticky top-24">
              <h2 className="font-serif text-lg sm:text-xl font-semibold mb-5 text-[var(--clx-text-primary)]">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--clx-text-secondary)]">Subtotal</span>
                  <span className="font-medium">₹{cart.subtotal.toLocaleString()}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--clx-text-secondary)]">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-[var(--clx-border-light)] pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-[var(--clx-text-primary)]">Total</span>
                    <span className="text-[var(--clx-text-primary)]">₹{cart.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Coupon Code</label>
                <div className="flex gap-2">
                  <input type="text" value={cart.coupon?.code || couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" className="luxury-input text-sm py-2.5" disabled={cart.coupon} />
                  {!cart.coupon ? (
                    <button onClick={applyCoupon} disabled={applyingCoupon} className="luxury-btn px-4 py-2.5 text-xs whitespace-nowrap">{applyingCoupon ? '...' : 'Apply'}</button>
                  ) : (
                    <button onClick={removeCoupon} disabled={updating} className="px-4 py-2.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors whitespace-nowrap">Remove</button>
                  )}
                </div>
                {cart.coupon && (
                  <p className="text-xs text-green-600 mt-2">Coupon applied: {cart.coupon.code}</p>
                )}
              </div>

              <button onClick={() => router.push('/checkout')} className="luxury-btn-gold w-full py-3.5 text-sm">
                Proceed to Checkout
              </button>

              <a href="/products" className="block text-center text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] text-xs mt-4 tracking-wider uppercase transition-colors">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}