'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api  from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Package,
  Check,
  X,
  Truck,
  Clock,
  Box,
  IndianRupee,
  Calendar,
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    hydrated
  } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [hydrated, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await api.post(`/orders/${orderId}/cancel`, { reason });
      await fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: Check,
      packed: Box,
      shipped: Truck,
      delivered: Package,
      cancelled: X,
    };
    return icons[status] || Clock;
  };

  const OrderTimeline = ({ order }) => {
    const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);

    return (
      <div className="relative">
        <div className="flex items-center justify-between">
          {statuses.map((status, index) => {
            const StatusIcon = getStatusIcon(status);
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StatusIcon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold' : ''}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-green-500"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Items */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.orderItems?.map((item) => (
                      <div key={item.product} className="flex gap-4 p-3 bg-gray-50 rounded-md">
                        <div className="w-16 h-16 bg-white rounded-md flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-md" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-md text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-semibold">₹{(item.finalPrice * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-medium">₹{order.total?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-gray-600">Expected Delivery</p>
                        <p className="font-medium">
                          {order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleDateString()
                            : 'Estimated 5-7 days'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status & Actions */}
                <div className="lg:w-80">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Order Status</h4>
                    <OrderTimeline order={order} />
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.orderStatus === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => router.push(`/orders/${order._id}/review`)}
                        className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Write Review
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className="w-full px-4 py-2 border border-black text-black rounded-md hover:bg-gray-50"
                    >
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
  );
}