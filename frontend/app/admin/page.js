'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch product stats
      const productStats = await productsAPI.getProductStats();

      // Fetch recent orders
      const orders = await ordersAPI.getOrders();

      setStats({
        totalRevenue: 1250000, // This would come from orders aggregation
        totalOrders: orders.data.orders?.length || 0,
        totalProducts: productStats.data.stats?.totalProducts || 0,
        totalCustomers: 450, // This would come from user count API
      });

      setRecentOrders(orders.data.orders?.slice(0, 5) || []);
      setTopProducts(productStats.data.topRatedProducts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      trend: '+5.4%',
      trendUp: true,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'bg-orange-500',
      trend: '+15.3%',
      trendUp: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <div className={`flex items-center mt-2 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm">{stat.trend}</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {order.orderItems?.length || 0} items • ₹{order.total?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.orderStatus === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.orderStatus || 'Pending'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white flex items-center justify-center rounded-md flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-md text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-600">★ {product.rating || 0}</span>
                      <span className="text-gray-500">({product.numReviews || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{product.finalPrice?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-500">{product.stock || 0} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No products yet</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <a
          href="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <Package className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Manage Products</h3>
          <p className="text-sm text-gray-600">Add, edit, or delete products</p>
        </a>

        <a
          href="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Manage Orders</h3>
          <p className="text-sm text-gray-600">View and update order status</p>
        </a>

        <a
          href="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <Users className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-gray-600">View and manage customers</p>
        </a>

        <a
          href="/admin/analytics"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold">View Analytics</h3>
          <p className="text-sm text-gray-600">Sales reports and insights</p>
        </a>
      </div>
    </div>
  );
}