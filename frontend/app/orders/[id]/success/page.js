'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/lib/store';
import { getPaymentBadge } from '@/lib/paymentStatus';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated, hydrated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [hydrated, isAuthenticated, id]);

  const fetchOrder = async () => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Order not found.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[var(--clx-ivory)] min-h-screen">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold mb-2 text-[var(--clx-text-primary)]">{error || 'Order not found'}</h2>
        <Link href="/orders" className="luxury-btn-gold px-6 py-2.5 text-xs inline-flex items-center gap-2 mt-4">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'completed';
  const isFailed = order.paymentStatus === 'failed' || order.orderStatus === 'cancelled';
  const badge = getPaymentBadge(order);

  const header = isFailed
    ? {
        icon: <XCircle className="w-16 h-16 text-red-500" />,
        title: 'Payment Not Completed',
        subtitle: 'Your order was not confirmed. If any amount was deducted, it will be auto-refunded by your bank. You can place the order again.',
        iconBg: 'bg-red-50',
      }
    : isPaid
      ? {
          icon: <CheckCircle2 className="w-16 h-16 text-green-600" />,
          title: 'Payment Successful!',
          subtitle: 'Thank you for your purchase. Your order has been confirmed and is being processed.',
          iconBg: 'bg-green-50',
        }
      : {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          title: order.paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Pending',
          subtitle: order.paymentMethod === 'cod'
            ? 'Thank you for your purchase. You will pay on delivery.'
            : 'Your order has been placed but the payment is not confirmed yet. Please contact support if you were charged.',
          iconBg: 'bg-amber-50',
        };

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full ${header.iconBg} flex items-center justify-center mx-auto mb-5`}>
            {header.icon}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">{header.title}</h1>
          <p className="text-sm text-[var(--clx-text-secondary)] mt-2 max-w-md mx-auto">{header.subtitle}</p>
          <p className="text-xs text-[var(--clx-text-muted)] mt-3 tracking-wider uppercase">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[var(--clx-text-primary)]">Order Summary</h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-3">
            {order.orderItems?.map((item) => (
              <div key={item.product} className="flex gap-4 items-center p-3 border border-[var(--clx-border-light)] rounded-xl">
                <div className="w-14 h-14 bg-white border border-[var(--clx-border-light)] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                  ) : (
                    <Package className="w-5 h-5 text-[var(--clx-text-muted)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--clx-text-primary)] truncate">{item.name}</h3>
                  <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-sm text-[var(--clx-text-primary)] flex-shrink-0">
                  ₹{(item.finalPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--clx-border-light)] space-y-2">
            <div className="flex justify-between text-xs text-[var(--clx-text-secondary)]">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>Discount</span>
                <span>-₹{order.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[var(--clx-text-secondary)]">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-sm sm:text-base text-[var(--clx-text-primary)] pt-2">
              <span>Total</span>
              <span>₹{order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-base font-semibold text-[var(--clx-text-primary)] mb-3">Delivery Details</h2>
          <div className="text-xs text-[var(--clx-text-secondary)] space-y-1.5 leading-relaxed">
            <p className="font-bold text-sm text-[var(--clx-text-primary)]">{order.shippingAddress?.name}</p>
            <p>Mobile: {order.shippingAddress?.mobile}</p>
            <p>{order.shippingAddress?.houseNo}, {order.shippingAddress?.area}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>
          {order.estimatedDeliveryDate && (
            <p className="text-xs text-[var(--clx-text-secondary)] mt-3 pt-3 border-t border-[var(--clx-border-light)]">
              Estimated delivery:{' '}
              <span className="font-semibold text-green-600">
                {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${order._id}`}
            className="luxury-btn-gold px-6 py-3 text-xs inline-flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View Order Details
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 border border-[var(--clx-border)] rounded-none bg-transparent text-[var(--clx-text-primary)] hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
