'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { TrendingUp, Users, ShoppingCart, Package, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const productStats = await productsAPI.getProductStats();
      const orders = await ordersAPI.getOrders();
      setStats({
        totalRevenue: 1250000,
        totalOrders: orders.data.orders?.length || 0,
        totalProducts: productStats.data.stats?.totalProducts || 0,
        totalCustomers: 450,
      });
      setRecentOrders(orders.data.orders?.slice(0, 5) || []);
      setTopProducts(productStats.data.topRatedProducts || []);
    } catch (error) { console.error('Error fetching dashboard data:', error); } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600 bg-green-50', trend: '+12.5%', trendUp: true },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-600 bg-blue-50', trend: '+8.2%', trendUp: true },
    { title: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-600 bg-purple-50', trend: '+5.4%', trendUp: true },
    { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-amber-600 bg-amber-50', trend: '+15.3%', trendUp: true },
  ];

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <span className="section-eyebrow">Dashboard</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 hover:shadow-[var(--clx-shadow-md)] transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--clx-text-muted)] text-xs tracking-wider uppercase font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1.5 text-[var(--clx-text-primary)]">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                    <span className="text-xs font-medium">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
            <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-[var(--clx-surface)] rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-[var(--clx-text-primary)]">Order #{order._id.slice(-6)}</p>
                      <p className="text-xs text-[var(--clx-text-muted)]">{order.orderItems?.length || 0} items • ₹{order.total?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                        order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700' : order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                      <p className="text-[10px] text-[var(--clx-text-muted)] mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--clx-text-muted)] text-center py-8 text-sm">No orders yet</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 sm:p-6">
            <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Top Products</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 p-3 bg-[var(--clx-surface)] rounded-xl">
                    <div className="w-14 h-14 bg-white flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-[9px]">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1 text-[var(--clx-text-primary)]">{product.name}</h4>
                      <p className="text-xs text-[var(--clx-text-muted)]">{product.brand}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[var(--clx-gold)] text-xs">★ {product.rating || 0}</span>
                        <span className="text-[var(--clx-text-muted)] text-[10px]">({product.numReviews || 0})</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">₹{product.finalPrice?.toLocaleString() || 0}</p>
                      <p className="text-[10px] text-[var(--clx-text-muted)]">{product.stock || 0} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--clx-text-muted)] text-center py-8 text-sm">No products yet</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { href: '/admin/products', icon: Package, color: 'text-purple-600', title: 'Manage Products', desc: 'Add, edit, or delete products' },
            { href: '/admin/orders', icon: ShoppingCart, color: 'text-blue-600', title: 'Manage Orders', desc: 'View and update order status' },
            { href: '/admin/users', icon: Users, color: 'text-amber-600', title: 'Manage Users', desc: 'View and manage customers' },
            { href: '/admin/analytics', icon: TrendingUp, color: 'text-green-600', title: 'View Analytics', desc: 'Sales reports and insights' },
          ].map((link) => (
            <a key={link.href} href={link.href} className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-5 hover:shadow-[var(--clx-shadow-md)] hover:border-[var(--clx-gold)] transition-all duration-300 group">
              <link.icon className={`w-7 h-7 ${link.color} mb-3 group-hover:text-[var(--clx-gold)] transition-colors`} />
              <h3 className="font-serif font-semibold text-sm text-[var(--clx-text-primary)]">{link.title}</h3>
              <p className="text-xs text-[var(--clx-text-muted)] mt-1">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}