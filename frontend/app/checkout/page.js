'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore, useCartStore } from '@/lib/store';
import {
  MapPin, CreditCard, Truck, Plus, Check, Pencil, Trash2, X, Loader2,
} from 'lucide-react';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Empty address template ──────────────────────────────────────────────────

const EMPTY_ADDRESS = {
  name: '', mobile: '', houseNo: '', area: '', city: '', state: '', pincode: '',
};

// ─── Address Card Component ─────────────────────────────────────────────────

function AddressCard({ address, isSelected, onSelect, onEdit, onDelete, disabled }) {
  return (
    <div
      onClick={() => !disabled && onSelect(address)}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-[var(--clx-gold)] bg-[var(--clx-gold)]/5 shadow-sm'
          : 'border-[var(--clx-border-light)] bg-white hover:border-[var(--clx-border)]'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Selection indicator */}
      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        isSelected
          ? 'border-[var(--clx-gold)] bg-[var(--clx-gold)]'
          : 'border-[var(--clx-border)]'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Default badge */}
      {address.isDefault && (
        <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--clx-gold)]/10 text-[var(--clx-gold)] border border-[var(--clx-gold)]/20 mb-2">
          Default
        </span>
      )}

      <h4 className="font-medium text-sm text-[var(--clx-text-primary)] pr-8">{address.name}</h4>
      <p className="text-xs text-[var(--clx-text-secondary)] mt-1">
        {address.houseNo}, {address.area}
      </p>
      <p className="text-xs text-[var(--clx-text-secondary)]">
        {address.city}, {address.state} — {address.pincode}
      </p>
      <p className="text-xs text-[var(--clx-text-muted)] mt-1">📞 {address.mobile}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(address); }}
          className="text-xs text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] flex items-center gap-1 transition-colors"
          disabled={disabled}
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
          className="text-xs text-[var(--clx-text-muted)] hover:text-red-500 flex items-center gap-1 transition-colors"
          disabled={disabled}
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── Address Form Component ─────────────────────────────────────────────────

function AddressForm({ data, onChange, errors, disabled, onSave, onCancel, showSaveCheckbox, saveChecked, onSaveCheckedChange, isEditing }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--clx-border-light)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base font-semibold text-[var(--clx-text-primary)]">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--clx-surface)] text-[var(--clx-text-muted)] hover:text-[var(--clx-text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">Full Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">Mobile Number *</label>
          <input
            type="text"
            value={data.mobile}
            onChange={(e) => onChange({ ...data, mobile: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="10-digit mobile number"
          />
          {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">House No./Building *</label>
          <input
            type="text"
            value={data.houseNo}
            onChange={(e) => onChange({ ...data, houseNo: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="House/Flat No., Building"
          />
          {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">Area/Street *</label>
          <input
            type="text"
            value={data.area}
            onChange={(e) => onChange({ ...data, area: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="Area, Street, Landmark"
          />
          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="City name"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">State *</label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="State"
          />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">Pincode *</label>
          <input
            type="text"
            value={data.pincode}
            onChange={(e) => onChange({ ...data, pincode: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-[var(--clx-surface)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
            disabled={disabled}
            placeholder="6-digit pincode"
          />
          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
        </div>
      </div>

      {/* Save checkbox + buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {showSaveCheckbox && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveChecked}
              onChange={(e) => onSaveCheckedChange(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--clx-border)] accent-[var(--clx-gold)]"
            />
            <span className="text-sm text-[var(--clx-text-secondary)]">Save this address for future orders</span>
          </label>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="ml-auto luxury-btn-gold py-2 px-5 text-xs"
          >
            {isEditing ? 'Update Address' : 'Save Address'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Checkout Page ─────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { setCartCount } = useCartStore();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState('select'); // 'select' | 'new' | 'edit'
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address form data (used for new or editing)
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await apiClient.get('/cart');
      if (!response.data.cart || !response.data.cart.items || response.data.cart.items.length === 0) {
        router.push('/cart');
        return;
      }
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.get('/addresses');
      const addresses = response.data.addresses || [];
      setSavedAddresses(addresses);

      // Auto-select default address
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setAddressMode('select');
      } else {
        // No saved addresses → show form directly
        setAddressMode('new');
        setAddressForm({
          ...EMPTY_ADDRESS,
          name: user?.name || '',
          mobile: user?.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressMode('new');
      setAddressForm({
        ...EMPTY_ADDRESS,
        name: user?.name || '',
        mobile: user?.phone || '',
      });
    }
  };

  // Get the currently active shipping address (either from selection or form)
  const getShippingAddress = () => {
    if (addressMode === 'select' && selectedAddressId) {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (addr) {
        return {
          name: addr.name,
          mobile: addr.mobile,
          houseNo: addr.houseNo,
          area: addr.area,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        };
      }
    }
    return addressForm;
  };

  const validateForm = () => {
    const addr = getShippingAddress();
    const newErrors = {};

    if (!addr.name?.trim()) newErrors.name = 'Name is required';
    if (!addr.mobile?.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(addr.mobile)) newErrors.mobile = 'Invalid mobile number';
    if (!addr.houseNo?.trim()) newErrors.houseNo = 'House number is required';
    if (!addr.area?.trim()) newErrors.area = 'Area is required';
    if (!addr.city?.trim()) newErrors.city = 'City is required';
    if (!addr.state?.trim()) newErrors.state = 'State is required';
    if (!addr.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(addr.pincode)) newErrors.pincode = 'Invalid pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Address actions ────────────────────────────────────────────────────

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    setAddressMode('select');
    setErrors({});
  };

  const handleAddNew = () => {
    setAddressMode('new');
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS,
      name: user?.name || '',
      mobile: user?.phone || '',
    });
    setSaveToProfile(true);
    setErrors({});
  };

  const handleEditAddress = (address) => {
    setAddressMode('edit');
    setEditingAddressId(address._id);
    setAddressForm({
      name: address.name,
      mobile: address.mobile,
      houseNo: address.houseNo,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setErrors({});
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const response = await apiClient.delete(`/addresses/${addressId}`);
      const newAddresses = response.data.addresses || [];
      setSavedAddresses(newAddresses);

      if (selectedAddressId === addressId) {
        const defaultAddr = newAddresses.find((a) => a.isDefault) || newAddresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setAddressMode('select');
        } else {
          setSelectedAddressId(null);
          setAddressMode('new');
          setAddressForm({ ...EMPTY_ADDRESS, name: user?.name || '', mobile: user?.phone || '' });
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSaveAddress = async () => {
    // Validate the form first
    if (!validateForm()) return;

    try {
      if (addressMode === 'edit' && editingAddressId) {
        // Update existing
        const response = await apiClient.put(`/addresses/${editingAddressId}`, addressForm);
        setSavedAddresses(response.data.addresses || []);
        setSelectedAddressId(editingAddressId);
      } else {
        // Add new
        const response = await apiClient.post('/addresses', addressForm);
        setSavedAddresses(response.data.addresses || []);
        setSelectedAddressId(response.data.address._id);
      }
      setAddressMode('select');
      setEditingAddressId(null);
      setErrors({});
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleCancelForm = () => {
    if (savedAddresses.length > 0) {
      setAddressMode('select');
      setEditingAddressId(null);
      setErrors({});
    }
  };

  // ─── Checkout handlers ────────────────────────────────────────────────

  const completeCheckout = () => {
    setCartCount(0);
    router.push('/orders');
  };

  const markPaymentFailed = async (orderId) => {
    if (!orderId) return;
    try {
      await apiClient.post('/orders/fail-payment', { orderId });
    } catch (error) {
      console.error('Failed to mark payment as failed:', error);
    }
  };

  const openRazorpayCheckout = async (order, razorpayData) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      await markPaymentFailed(order._id);
      throw new Error('Unable to load Razorpay. Please try again or use Cash on Delivery.');
    }

    const shippingAddress = getShippingAddress();

    return new Promise((resolve, reject) => {
      let settled = false;

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency || 'INR',
        name: 'ChronoLux',
        description: 'Order Payment',
        order_id: razorpayData.orderId,
        prefill: {
          name: shippingAddress.name || user?.name || '',
          email: user?.email || '',
          contact: shippingAddress.mobile || user?.phone || '',
        },
        theme: {
          color: '#111111',
        },
        handler: async (response) => {
          if (settled) return;
          settled = true;
          try {
            await apiClient.post('/orders/verify-payment', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve();
          } catch (error) {
            reject(
              new Error(
                error.response?.data?.message ||
                  'Payment was received but verification failed. Please contact support with your payment ID.'
              )
            );
          }
        },
        modal: {
          ondismiss: async () => {
            if (settled) return;
            settled = true;
            await markPaymentFailed(order._id);
            reject(new Error('Payment cancelled. Your cart items are still available.'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        if (settled) return;
        settled = true;
        await markPaymentFailed(order._id);
        reject(
          new Error(response.error?.description || 'Payment failed. Please try again.')
        );
      });
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // If user is adding a new address and wants to save it
    if (addressMode === 'new' && saveToProfile) {
      try {
        const response = await apiClient.post('/addresses', addressForm);
        setSavedAddresses(response.data.addresses || []);
      } catch (error) {
        // Non-blocking — still proceed with checkout
        console.warn('Could not save address:', error);
      }
    }

    setProcessing(true);
    try {
      const shippingAddress = getShippingAddress();
      const orderData = { shippingAddress, paymentMethod };

      const response = await apiClient.post('/orders', orderData);

      if (paymentMethod === 'razorpay') {
        const { order, razorpay: razorpayData } = response.data;
        if (!order || !razorpayData) {
          throw new Error('Failed to initiate online payment.');
        }
        await openRazorpayCheckout(order, razorpayData);
        completeCheckout();
        return;
      }

      // COD — backend already clears cart
      completeCheckout();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || error.response?.data?.message || 'Failed to place order. Please try again.');
      if (paymentMethod === 'razorpay') {
        fetchCart();
      }
    } finally {
      setProcessing(false);
    }
  };

  // ─── Loading / empty states ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (!cart) return null;

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6">
          <span className="section-eyebrow">Secure Checkout</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ── Left column: Address + Payment ────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* ── Shipping Address Section ──────────────────────── */}
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
                <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--clx-text-primary)]">
                  <MapPin className="w-5 h-5 text-[var(--clx-gold)]" />
                  Shipping Address
                </h2>

                {/* Saved Address Cards */}
                {savedAddresses.length > 0 && addressMode === 'select' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <AddressCard
                          key={addr._id}
                          address={addr}
                          isSelected={selectedAddressId === addr._id}
                          onSelect={handleSelectAddress}
                          onEdit={handleEditAddress}
                          onDelete={handleDeleteAddress}
                          disabled={processing}
                        />
                      ))}

                      {/* Add New Card */}
                      {savedAddresses.length < 5 && (
                        <button
                          type="button"
                          onClick={handleAddNew}
                          disabled={processing}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[var(--clx-border)] hover:border-[var(--clx-gold)] text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] transition-all min-h-[120px]"
                        >
                          <Plus className="w-6 h-6" />
                          <span className="text-xs font-medium tracking-wider uppercase">Add New Address</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Address Form (new or edit) */}
                {(addressMode === 'new' || addressMode === 'edit') && (
                  <AddressForm
                    data={addressForm}
                    onChange={setAddressForm}
                    errors={errors}
                    disabled={processing}
                    onSave={handleSaveAddress}
                    onCancel={savedAddresses.length > 0 ? handleCancelForm : null}
                    showSaveCheckbox={addressMode === 'new'}
                    saveChecked={saveToProfile}
                    onSaveCheckedChange={setSaveToProfile}
                    isEditing={addressMode === 'edit'}
                  />
                )}
              </div>

              {/* ── Payment Method ────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
                <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--clx-text-primary)]">
                  <CreditCard className="w-5 h-5 text-[var(--clx-gold)]" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-[var(--clx-surface)] transition-all ${
                    paymentMethod === 'cod' ? 'border-[var(--clx-gold)] bg-[var(--clx-gold)]/5' : 'border-[var(--clx-border-light)]'
                  }`}>
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 accent-[var(--clx-gold)]"
                      disabled={processing}
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--clx-text-primary)]">Cash on Delivery</p>
                      <p className="text-xs text-[var(--clx-text-muted)]">Pay with cash at your doorstep</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-[var(--clx-surface)] transition-all ${
                    paymentMethod === 'razorpay' ? 'border-[var(--clx-gold)] bg-[var(--clx-gold)]/5' : 'border-[var(--clx-border-light)]'
                  }`}>
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 accent-[var(--clx-gold)]"
                      disabled={processing}
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--clx-text-primary)]">Razorpay (Online Payment)</p>
                      <p className="text-xs text-[var(--clx-text-muted)]">Pay securely using credit/debit card, UPI, or net banking</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Right column: Order Summary ──────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 sticky top-16 sm:top-20">
                <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-14 h-14 bg-[var(--clx-surface)] rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product.images && item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-[9px]">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-1 text-[var(--clx-text-primary)]">{item.product.name}</h4>
                        <p className="text-[var(--clx-text-muted)] text-[10px] sm:text-xs">Qty: {item.quantity}</p>
                        <p className="font-semibold text-xs sm:text-sm">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--clx-border-light)] pt-4 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[var(--clx-text-muted)]">Subtotal</span>
                    <span>₹{cart.subtotal.toLocaleString()}</span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{cart.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[var(--clx-text-muted)]">Shipping</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm sm:text-lg border-t border-[var(--clx-border-light)] pt-3">
                    <span>Total</span>
                    <span>₹{cart.total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="luxury-btn-gold w-full mt-5 py-3.5 text-sm disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {paymentMethod === 'razorpay' ? 'Opening payment...' : 'Processing...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" />
                      {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                    </span>
                  )}
                </button>

                <p className="text-[10px] text-[var(--clx-text-muted)] text-center mt-3">
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
