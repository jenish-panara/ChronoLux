'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [statusSummary, setStatusSummary] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
        setStatusSummary(response.data.statusSummary || {});
        setRecentOrders(response.data.recentOrders || []);
        setTopProducts(response.data.topProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { title: 'Total Orders', value: stats.totalOrders?.toString() || '0', icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { title: 'Total Products', value: stats.totalProducts?.toString() || '0', icon: Package, color: 'text-purple-600 bg-purple-50' },
    { title: 'Total Customers', value: stats.totalCustomers?.toString() || '0', icon: Users, color: 'text-amber-600 bg-amber-50' },
  ];

  const statusList = [
    { label: 'Pending', count: statusSummary.pending || 0, icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { label: 'Confirmed', count: statusSummary.confirmed || 0, icon: Activity, color: 'text-blue-500 bg-blue-50' },
    { label: 'Packed', count: statusSummary.packed || 0, icon: Package, color: 'text-indigo-500 bg-indigo-50' },
    { label: 'Shipped', count: statusSummary.shipped || 0, icon: Truck, color: 'text-cyan-500 bg-cyan-50' },
    { label: 'Delivered', count: statusSummary.delivered || 0, icon: CheckCircle, color: 'text-green-500 bg-green-50' },
    { label: 'Cancelled', count: statusSummary.cancelled || 0, icon: XCircle, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Overview</span>
        <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 hover:shadow-[var(--clx-shadow-md)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--clx-text-muted)] text-xs tracking-wider uppercase font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-1.5 text-[var(--clx-text-primary)]">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
        <h2 className="font-serif text-lg font-semibold mb-5 text-[var(--clx-text-primary)]">Order Status Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusList.map((status) => (
            <div key={status.label} className="flex flex-col items-center p-4 rounded-xl bg-[var(--clx-surface)] border border-[var(--clx-border-light)] hover:shadow-sm transition-all text-center">
              <div className={`p-2.5 rounded-full ${status.color} mb-3`}>
                <status.icon className="w-4 h-4" />
              </div>
              <span className="text-xs text-[var(--clx-text-secondary)] font-medium">{status.label}</span>
              <span className="text-xl font-bold mt-1 text-[var(--clx-text-primary)]">{status.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3.5">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-[var(--clx-surface)] rounded-xl">
                  <div>
                    <p className="font-semibold text-sm text-[var(--clx-text-primary)]">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">{order.user?.name || 'Guest User'} • {order.orderItems?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                      order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700' : 
                      order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                      order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <p className="text-[10px] text-[var(--clx-text-muted)] mt-1.5 font-medium">₹{order.total?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--clx-text-muted)] text-center py-8 text-sm">No orders yet</p>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-3.5 p-3 bg-[var(--clx-surface)] rounded-xl">
                  <div className="w-12 h-12 bg-white flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden border border-[var(--clx-border-light)]">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-[9px]">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1 text-[var(--clx-text-primary)]">{product.name}</h4>
                    <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">{product.quantitySold} units sold</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-[var(--clx-text-primary)]">₹{product.revenue?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--clx-text-muted)] text-center py-8 text-sm">No sales data yet</p>
          )}
        </div>

      </div>
    </div>
  );
}