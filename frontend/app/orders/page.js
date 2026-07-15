'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Package, Check, X, Truck, Clock, Box, IndianRupee, Calendar } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchOrders();
  }, [hydrated, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) { console.error('Error fetching orders:', error); } finally { setLoading(false); }
  };

  const cancelOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason });
      await fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) { console.error('Error cancelling order:', error); alert('Failed to cancel order'); }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
      packed: 'bg-purple-50 text-purple-700 border border-purple-200',
      shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      out_for_delivery: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      delivered: 'bg-green-50 text-green-700 border border-green-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = { 
      pending: Clock, 
      confirmed: Check, 
      packed: Box, 
      shipped: Truck, 
      out_for_delivery: Truck,
      delivered: Package, 
      cancelled: X 
    };
    return icons[status] || Clock;
  };

  const OrderTimeline = ({ order }) => {
    const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);
    return (
      <div className="relative">
        <div className="flex items-center justify-between">
          {statuses.map((status, index) => {
            const StatusIcon = getStatusIcon(status);
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const displayLabel = status === 'out_for_delivery' ? 'Out for Delivery' : status.charAt(0).toUpperCase() + status.slice(1);
            return (
              <div key={status} className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-[var(--clx-gold)] text-[var(--clx-black)]' : 'bg-[var(--clx-surface)] text-[var(--clx-text-muted)]'}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] mt-1.5 tracking-wider uppercase text-center font-medium ${isCurrent ? 'font-semibold text-[var(--clx-gold)]' : 'text-[var(--clx-text-muted)]'}`}>
                  {displayLabel}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-[var(--clx-surface)] -z-10">
          <div className="h-full bg-[var(--clx-gold)] transition-all duration-500" style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <span className="section-eyebrow">Order History</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 mx-auto text-[var(--clx-border)] mb-4" />
            <h2 className="font-serif text-xl font-semibold mb-2 text-[var(--clx-text-primary)]">No orders yet</h2>
            <p className="text-[var(--clx-text-secondary)] mb-8 text-sm">Start shopping to see your orders here!</p>
            <Link href="/products" className="luxury-btn-gold px-8 py-3">Browse Collection</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6 hover:shadow-[var(--clx-shadow-md)] transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-serif font-semibold text-[var(--clx-text-primary)]">Order #{order._id.slice(-6)}</h3>
                        <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {order.orderItems?.map((item) => (
                        <div key={item.product} className="flex gap-3 p-3 bg-[var(--clx-surface)] rounded-xl">
                          <div className="w-14 h-14 bg-white rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-[9px]">No Image</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-[var(--clx-text-primary)]">{item.name}</h4>
                            <p className="text-xs text-[var(--clx-text-muted)]">Qty: {item.quantity}</p>
                            <p className="font-semibold text-sm">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-[var(--clx-gold)]" />
                        <div>
                          <p className="text-[var(--clx-text-muted)] text-xs">Total</p>
                          <p className="font-medium text-sm">₹{order.total?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--clx-gold)]" />
                        <div>
                          <p className="text-[var(--clx-text-muted)] text-xs">Delivery</p>
                          <p className="font-medium text-sm">
                            {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Est. 5-7 days'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72">
                    <div className="bg-[var(--clx-surface)] rounded-xl p-4 border border-[var(--clx-border-light)]">
                      <h4 className="font-serif text-sm font-semibold mb-3 text-[var(--clx-text-primary)]">Order Status</h4>
                      <OrderTimeline order={order} />
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.orderStatus === 'pending' && (
                        <button onClick={() => cancelOrder(order._id)} className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg text-xs font-medium tracking-wider uppercase hover:bg-red-600 transition-colors">
                          Cancel Order
                        </button>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <button onClick={() => router.push(`/orders/${order._id}/review`)} className="luxury-btn w-full py-2.5 text-xs">
                          Write Review
                        </button>
                      )}
                      <button onClick={() => router.push(`/orders/${order._id}`)} className="luxury-btn-outline w-full py-2.5 text-xs">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}