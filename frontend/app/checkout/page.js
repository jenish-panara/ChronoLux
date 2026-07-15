'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { MapPin, CreditCard, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({ name: '', mobile: '', houseNo: '', area: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      if (!response.data.cart || !response.data.cart.items || response.data.cart.items.length === 0) { router.push('/cart'); return; }
      setCart(response.data.cart);
      if (user) { setShippingAddress(prev => ({ ...prev, name: user.name || '', mobile: user.phone || '' })); }
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
      await api.post('/orders', { shippingAddress, paymentMethod });
      await api.delete('/cart');
      router.push('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }
  if (!cart) return null;

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <span className="section-eyebrow">Complete Your Order</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-7">
                <h2 className="font-serif text-lg font-semibold mb-5 flex items-center text-[var(--clx-text-primary)]">
                  <MapPin className="w-5 h-5 mr-2 text-[var(--clx-gold)]" />
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'name', label: 'Full Name *', span: 2, placeholder: 'Enter your full name' },
                    { name: 'mobile', label: 'Mobile Number *', span: 2, placeholder: '10-digit mobile number' },
                    { name: 'houseNo', label: 'House No./Building *', span: 1, placeholder: 'House/Flat No., Building' },
                    { name: 'area', label: 'Area/Street *', span: 1, placeholder: 'Area, Street, Landmark' },
                    { name: 'city', label: 'City *', span: 1, placeholder: 'City name' },
                    { name: 'state', label: 'State *', span: 1, placeholder: 'State' },
                    { name: 'pincode', label: 'Pincode *', span: 2, placeholder: '6-digit pincode' },
                  ].map((field) => (
                    <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">{field.label}</label>
                      <input
                        type="text"
                        value={shippingAddress[field.name]}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, [field.name]: e.target.value })}
                        className="luxury-input text-sm"
                        disabled={processing}
                        placeholder={field.placeholder}
                      />
                      {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-7">
                <h2 className="font-serif text-lg font-semibold mb-5 flex items-center text-[var(--clx-text-primary)]">
                  <CreditCard className="w-5 h-5 mr-2 text-[var(--clx-gold)]" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    { value: 'cod', title: 'Cash on Delivery', desc: 'Pay with cash at your doorstep' },
                    { value: 'razorpay', title: 'Razorpay (Online Payment)', desc: 'Pay securely using credit/debit card, UPI, or net banking' },
                  ].map((method) => (
                    <label key={method.value} className={`flex items-center p-4 border rounded-xl cursor-pointer hover:bg-[var(--clx-surface)] transition-all duration-200 ${paymentMethod === method.value ? 'border-[var(--clx-gold)] bg-[var(--clx-surface)]' : 'border-[var(--clx-border-light)]'}`}>
                      <input type="radio" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 accent-[var(--clx-gold)]" disabled={processing} />
                      <div>
                        <p className="font-medium text-sm text-[var(--clx-text-primary)]">{method.title}</p>
                        <p className="text-xs text-[var(--clx-text-secondary)]">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 sticky top-24">
                <h2 className="font-serif text-lg font-semibold mb-5 text-[var(--clx-text-primary)]">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-14 h-14 bg-[var(--clx-surface)] rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product.images && item.product.images[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-[9px]">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs line-clamp-1 text-[var(--clx-text-primary)]">{item.product.name}</h4>
                        <p className="text-[var(--clx-text-muted)] text-[10px]">Qty: {item.quantity}</p>
                        <p className="font-semibold text-xs">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--clx-border-light)] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--clx-text-secondary)]">Subtotal</span>
                    <span>₹{cart.subtotal.toLocaleString()}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{cart.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--clx-text-secondary)]">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-[var(--clx-border-light)] pt-3">
                    <span>Total</span>
                    <span>₹{cart.total.toLocaleString()}</span>
                  </div>
                </div>

                <button type="submit" disabled={processing} className="luxury-btn-gold w-full mt-6 py-3.5 text-sm">
                  {processing ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--clx-black)]/30 border-t-[var(--clx-black)]" /> Processing...</>
                  ) : (
                    <><Truck className="w-4 h-4" /> Place Order</>
                  )}
                </button>

                <p className="text-[10px] text-[var(--clx-text-muted)] text-center mt-4">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}