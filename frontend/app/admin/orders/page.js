'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Search, Eye, Filter, ChevronLeft, ChevronRight, X, Clock, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim(),
        status: statusFilter,
      };
      const response = await adminAPI.getOrders(params);
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.pages || 1);
        setTotalRevenue(response.data.totalRevenue || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await adminAPI.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (response.data.success) {
        // Update local state
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Transactions</span>
          <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Orders</h1>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-[var(--clx-border-light)] shadow-[var(--clx-shadow-sm)] flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--clx-text-secondary)] uppercase tracking-wider">Total Sales Revenue</span>
          <span className="text-xl font-bold mt-0.5 text-[var(--clx-text-primary)]">₹{totalRevenue?.toLocaleString()}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search order ID, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="luxury-input pl-10 pr-16 py-2.5 text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--clx-black)] text-white text-xs rounded hover:bg-[var(--clx-charcoal)] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="relative w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="luxury-select py-2.5 pl-10 pr-10 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
        </div>
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-[var(--clx-text-secondary)]">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-spacing-0">
              <thead>
                <tr className="bg-[var(--clx-surface)] border-b border-[var(--clx-border-light)] text-[10px] font-semibold tracking-wider text-[var(--clx-text-secondary)] uppercase">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clx-border-light)] text-sm text-[var(--clx-text-primary)]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[var(--clx-surface)]/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-[var(--clx-text-primary)]">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold">{order.user?.name || 'Guest User'}</p>
                      <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">{order.user?.email || ''}</p>
                    </td>
                    <td className="py-4 px-6 text-[var(--clx-text-secondary)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-[var(--clx-text-secondary)]">
                      {order.orderItems?.length || 0} items
                    </td>
                    <td className="py-4 px-6 font-bold">
                      ₹{order.total?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="luxury-btn py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--clx-border-light)] px-6 py-4">
            <span className="text-xs text-[var(--clx-text-secondary)]">
              Showing page <span className="font-semibold text-[var(--clx-text-primary)]">{page}</span> of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in border border-[var(--clx-border-light)]">
            <div className="p-6 border-b border-[var(--clx-border-light)] flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[var(--clx-text-primary)]">
                  Order Details
                </h2>
                <p className="text-xs text-[var(--clx-text-muted)] font-mono mt-0.5">ID: {selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-[var(--clx-surface)]">
                <X className="w-5 h-5 text-[var(--clx-text-secondary)]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--clx-surface)] border border-[var(--clx-border-light)] rounded-xl">
                <div>
                  <span className="text-[10px] font-semibold text-[var(--clx-text-secondary)] uppercase tracking-wider">Date Placed</span>
                  <p className="text-sm font-semibold mt-1 text-[var(--clx-text-primary)]">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[var(--clx-text-secondary)] uppercase tracking-wider">Payment Method</span>
                  <p className="text-sm font-semibold mt-1 text-[var(--clx-text-primary)] uppercase">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[var(--clx-text-secondary)] uppercase tracking-wider">Change Status</span>
                  <div className="mt-1">
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      disabled={updatingStatus}
                      className="luxury-select py-1 px-3 text-xs w-full"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-semibold mb-3 text-[var(--clx-text-secondary)] uppercase tracking-wider">Order Items</h3>
                <div className="space-y-3.5">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item._id} className="flex items-center gap-3.5 p-3 border border-[var(--clx-border-light)] rounded-xl hover:bg-[var(--clx-surface)]/20 transition-colors">
                      <div className="w-14 h-14 bg-white flex items-center justify-center rounded-lg border border-[var(--clx-border-light)] overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />
                        ) : (
                          <span className="text-[9px] text-[var(--clx-text-muted)]">No Img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-[var(--clx-text-primary)]">{item.name}</p>
                        <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">₹{item.finalPrice?.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm text-right flex-shrink-0">
                        ₹{(item.finalPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--clx-border-light)]">
                <div>
                  <h3 className="text-xs font-semibold mb-3 text-[var(--clx-text-secondary)] uppercase tracking-wider">Shipping Address</h3>
                  <div className="p-4 border border-[var(--clx-border-light)] rounded-xl space-y-1 text-sm text-[var(--clx-text-secondary)] leading-relaxed">
                    <p className="font-bold text-[var(--clx-text-primary)]">{selectedOrder.shippingAddress?.name}</p>
                    <p>Mobile: {selectedOrder.shippingAddress?.mobile}</p>
                    <p>{selectedOrder.shippingAddress?.houseNo}, {selectedOrder.shippingAddress?.area}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold mb-3 text-[var(--clx-text-secondary)] uppercase tracking-wider">Order Summary</h3>
                  <div className="p-4 border border-[var(--clx-border-light)] rounded-xl space-y-2 text-sm text-[var(--clx-text-secondary)]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-[var(--clx-text-primary)]">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-[var(--clx-text-primary)]">₹{selectedOrder.shipping?.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-[1px] bg-[var(--clx-border-light)] my-2" />
                    <div className="flex justify-between text-base font-bold text-[var(--clx-text-primary)]">
                      <span>Total Paid</span>
                      <span>₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--clx-border-light)] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="luxury-btn py-2 px-6 text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
