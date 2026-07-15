'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Box, 
  Truck, 
  Home, 
  ChevronLeft, 
  ArrowLeft,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated, hydrated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrderDetails();
  }, [hydrated, isAuthenticated, id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getOrder(id);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    setCancelling(true);
    try {
      const response = await ordersAPI.cancelOrder(id, { reason });
      if (response.data.success) {
        alert('Order cancelled successfully.');
        fetchOrderDetails();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold mb-2">{error || 'Order not found'}</h2>
        <Link href="/orders" className="luxury-btn-gold px-6 py-2.5 text-xs inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';

  // Tracking timeline steps definition
  const steps = [
    { status: 'pending', label: 'Placed', desc: 'Order received', icon: Clock },
    { status: 'confirmed', label: 'Confirmed', desc: 'Order accepted', icon: CheckCircle2 },
    { status: 'packed', label: 'Packed', desc: 'Ready for shipping', icon: Box },
    { status: 'shipped', label: 'Shipped', desc: 'In transit', icon: Truck },
    { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Near you', icon: Truck },
    { status: 'delivered', label: 'Delivered', desc: 'Enjoy your timepiece', icon: Package }
  ];

  const getStepStatus = (stepName, index) => {
    if (isCancelled) {
      // Find where it was cancelled
      const lastActiveIndex = steps.findIndex(s => s.status === order.statusHistory?.[order.statusHistory.length - 2]?.status);
      if (index <= lastActiveIndex) return 'completed';
      return 'inactive';
    }

    const currentIndex = steps.findIndex(s => s.status === order.orderStatus);
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/orders" className="p-2 bg-white rounded-xl border border-[var(--clx-border-light)] hover:border-[var(--clx-gold)] transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--clx-text-primary)]" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-[var(--clx-text-secondary)] uppercase tracking-[0.2em]">Customer Portal</span>
              <h1 className="font-serif text-2xl font-semibold text-[var(--clx-text-primary)]">Track Order #{order._id.slice(-6).toUpperCase()}</h1>
            </div>
          </div>
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracking Timeline Component */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6 sm:p-8">
            <h2 className="font-serif text-lg font-semibold mb-8 text-[var(--clx-text-primary)]">Delivery Progress</h2>
            
            {isCancelled ? (
              <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Order Cancelled</h4>
                  <p className="text-xs mt-1">This order was cancelled. {order.cancellationReason && `Reason: ${order.cancellationReason}`}</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-0">
                {/* Horizontal timeline for tablet/desktop */}
                <div className="hidden sm:flex justify-between items-start relative select-none">
                  {/* Line Background */}
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-[3px] bg-[var(--clx-surface)] -z-10">
                    <div 
                      className="h-full bg-green-500 transition-all duration-700" 
                      style={{ 
                        width: `${
                          (steps.findIndex(s => s.status === order.orderStatus) / (steps.length - 1)) * 100
                        }%` 
                      }} 
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const stepStatus = getStepStatus(step.status, idx);
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 text-center px-1">
                        <div className={`
                          w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300
                          ${stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-100' : ''}
                          ${stepStatus === 'current' ? 'bg-white border-[var(--clx-gold)] text-[var(--clx-gold)] border-2 scale-110 shadow-lg shadow-[var(--clx-gold)]/10 font-bold' : ''}
                          ${stepStatus === 'upcoming' ? 'bg-[var(--clx-surface)] border-[var(--clx-border-light)] text-[var(--clx-text-muted)]' : ''}
                        `}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-semibold mt-3 tracking-wide uppercase ${stepStatus === 'current' ? 'text-[var(--clx-gold)] font-bold' : stepStatus === 'completed' ? 'text-green-600' : 'text-[var(--clx-text-muted)]'}`}>
                          {step.label}
                        </span>
                        <p className="text-[9px] text-[var(--clx-text-muted)] mt-1.5 leading-normal max-w-[100px] mx-auto">
                          {stepStatus === 'completed' || stepStatus === 'current' ? step.desc : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical timeline for mobile view */}
                <div className="sm:hidden space-y-8 relative">
                  <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-[var(--clx-surface)] -z-10">
                    <div 
                      className="w-full bg-green-500 transition-all duration-700" 
                      style={{ 
                        height: `${
                          (steps.findIndex(s => s.status === order.orderStatus) / (steps.length - 1)) * 100
                        }%` 
                      }} 
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const stepStatus = getStepStatus(step.status, idx);
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className={`
                          w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0 transition-all duration-300
                          ${stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-100' : ''}
                          ${stepStatus === 'current' ? 'bg-white border-[var(--clx-gold)] text-[var(--clx-gold)] border-2 scale-105 shadow-[var(--clx-gold)]/10 font-bold' : ''}
                          ${stepStatus === 'upcoming' ? 'bg-[var(--clx-surface)] border-[var(--clx-border-light)] text-[var(--clx-text-muted)]' : ''}
                        `}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${stepStatus === 'current' ? 'text-[var(--clx-gold)]' : stepStatus === 'completed' ? 'text-green-600' : 'text-[var(--clx-text-muted)]'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-[var(--clx-text-secondary)] mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mt-12 pt-8 border-t border-[var(--clx-border-light)]">
              <h3 className="font-serif text-base font-semibold mb-4 text-[var(--clx-text-primary)]">Timepieces Ordered</h3>
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div key={item.product} className="flex gap-4 p-4 border border-[var(--clx-border-light)] rounded-2xl hover:bg-[var(--clx-surface)]/20 transition-all">
                    <div className="w-16 h-16 bg-white border border-[var(--clx-border-light)] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                      ) : (
                        <span className="text-[9px] text-[var(--clx-text-muted)]">No Img</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[var(--clx-text-primary)] truncate">{item.name}</h4>
                      <p className="text-xs text-[var(--clx-text-muted)] mt-1">Quantity: {item.quantity}</p>
                      <p className="text-xs font-medium text-[var(--clx-gold)] mt-0.5">Price: ₹{item.finalPrice?.toLocaleString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0 self-center">
                      <p className="font-bold text-sm">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5">
              <h3 className="font-serif text-sm font-semibold mb-3 text-[var(--clx-text-primary)] uppercase tracking-wider">Estimated Delivery</h3>
              <p className="text-base font-bold text-green-600 mt-1">
                {order.orderStatus === 'delivered' ? 'Delivered' : order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : '3-5 Days'}
              </p>
              {order.deliveredAt && (
                <p className="text-xs text-[var(--clx-text-secondary)] mt-1">Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}</p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5">
              <h3 className="font-serif text-sm font-semibold mb-3.5 text-[var(--clx-text-primary)] uppercase tracking-wider">Shipping Details</h3>
              <div className="text-xs text-[var(--clx-text-secondary)] space-y-1.5 leading-relaxed">
                <p className="font-bold text-sm text-[var(--clx-text-primary)]">{order.shippingAddress?.name}</p>
                <p className="flex items-center gap-1.5">Mobile: {order.shippingAddress?.mobile}</p>
                <p>{order.shippingAddress?.houseNo}, {order.shippingAddress?.area}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5">
              <h3 className="font-serif text-sm font-semibold mb-3.5 text-[var(--clx-text-primary)] uppercase tracking-wider">Payment Details</h3>
              <div className="text-xs text-[var(--clx-text-secondary)] space-y-2.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[var(--clx-text-primary)]">₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-[var(--clx-text-primary)]">₹{order.shipping?.toLocaleString()}</span>
                </div>
                <div className="w-full h-[1px] bg-[var(--clx-border-light)] my-2" />
                <div className="flex justify-between text-sm font-bold text-[var(--clx-text-primary)]">
                  <span>Total Paid</span>
                  <span>₹{order.total?.toLocaleString()}</span>
                </div>
                <div className="mt-3.5 pt-3.5 border-t border-[var(--clx-border-light)] flex justify-between items-center text-[10px] font-semibold tracking-wider uppercase">
                  <span>Method:</span>
                  <span className="bg-[var(--clx-surface)] px-2 py-0.5 rounded border border-[var(--clx-border-light)] text-[var(--clx-text-primary)]">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
