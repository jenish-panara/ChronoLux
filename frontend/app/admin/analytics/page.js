'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { TrendingUp, ShoppingCart, BarChart3, AlertTriangle, Star, CheckCircle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const monthlyData = data?.monthlyData || [];
  const bestSelling = data?.bestSelling || [];
  const highestRevenue = data?.highestRevenue || [];
  const lowStock = data?.lowStock || [];
  const summary = data?.summary || { totalRevenue: 0, totalOrders: 0 };

  // Calculate max values for bar chart scales
  const maxRevenue = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.revenue)) : 1;
  const maxOrders = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.orders)) : 1;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Reports</span>
        <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Analytics</h1>
      </div>

      {/* Top Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--clx-text-secondary)] font-semibold uppercase tracking-wider">Total Revenue (All Sales)</span>
            <p className="text-3xl font-bold mt-1 text-[var(--clx-text-primary)]">₹{summary.totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--clx-text-secondary)] font-semibold uppercase tracking-wider">Total Orders Placed</span>
            <p className="text-3xl font-bold mt-1 text-[var(--clx-text-primary)]">{summary.totalOrders}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts (Monthly performance) */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
        <h2 className="font-serif text-lg font-semibold mb-6 text-[var(--clx-text-primary)]">Monthly Sales Trend (Last 6 Months)</h2>
        
        {monthlyData.length === 0 ? (
          <p className="text-center text-[var(--clx-text-secondary)] py-10">No sales data available yet.</p>
        ) : (
          <div className="space-y-8">
            {/* Revenue Bar Chart */}
            <div>
              <h3 className="text-xs font-semibold mb-4 text-[var(--clx-text-secondary)] uppercase tracking-wider">Revenue (₹)</h3>
              <div className="flex items-end justify-between gap-3 h-48 border-b border-[var(--clx-border-light)] pb-2 px-4">
                {monthlyData.map((item, idx) => {
                  const percentage = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <span className="text-[10px] font-semibold text-[var(--clx-text-primary)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{item.revenue >= 100000 ? `${(item.revenue / 100000).toFixed(1)}L` : item.revenue.toLocaleString()}
                      </span>
                      <div 
                        style={{ height: `${Math.max(percentage, 5)}%` }} 
                        className="w-full max-w-[40px] bg-[var(--clx-gold)] rounded-t-md hover:bg-[var(--clx-gold-dark)] transition-colors cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-[var(--clx-text-secondary)] mt-2 uppercase tracking-wide">
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders Bar Chart */}
            <div>
              <h3 className="text-xs font-semibold mb-4 text-[var(--clx-text-secondary)] uppercase tracking-wider">Orders Count</h3>
              <div className="flex items-end justify-between gap-3 h-48 border-b border-[var(--clx-border-light)] pb-2 px-4">
                {monthlyData.map((item, idx) => {
                  const percentage = (item.orders / maxOrders) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <span className="text-[10px] font-semibold text-[var(--clx-text-primary)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.orders}
                      </span>
                      <div 
                        style={{ height: `${Math.max(percentage, 5)}%` }} 
                        className="w-full max-w-[40px] bg-black/60 rounded-t-md hover:bg-black/80 transition-colors cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-[var(--clx-text-secondary)] mt-2 uppercase tracking-wide">
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Product Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
          <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Best Selling Timepieces</h2>
          {bestSelling.length > 0 ? (
            <div className="space-y-3.5">
              {bestSelling.map((prod, index) => (
                <div key={prod._id} className="flex items-center gap-3 p-3 bg-[var(--clx-surface)] rounded-xl">
                  <span className="font-serif text-sm font-bold text-[var(--clx-gold)] w-4 text-center">{index + 1}</span>
                  <div className="w-10 h-10 bg-white border border-[var(--clx-border-light)] rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                    {prod.image && <img src={prod.image} alt={prod.name} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">{prod.name}</p>
                    <p className="text-[10px] text-[var(--clx-text-muted)] mt-0.5">{prod.quantitySold} units sold</p>
                  </div>
                  <p className="font-bold text-xs text-[var(--clx-text-primary)]">₹{prod.revenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[var(--clx-text-secondary)] py-10">No sales data yet.</p>
          )}
        </div>

        {/* Highest Revenue */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
          <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Highest Revenue Generated</h2>
          {highestRevenue.length > 0 ? (
            <div className="space-y-3.5">
              {highestRevenue.map((prod, index) => (
                <div key={prod._id} className="flex items-center gap-3 p-3 bg-[var(--clx-surface)] rounded-xl">
                  <span className="font-serif text-sm font-bold text-black/40 w-4 text-center">{index + 1}</span>
                  <div className="w-10 h-10 bg-white border border-[var(--clx-border-light)] rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                    {prod.image && <img src={prod.image} alt={prod.name} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">{prod.name}</p>
                    <p className="text-[10px] text-[var(--clx-text-muted)] mt-0.5">{prod.quantitySold} units sold</p>
                  </div>
                  <p className="font-bold text-xs text-green-600">₹{prod.revenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[var(--clx-text-secondary)] py-10">No sales data yet.</p>
          )}
        </div>
      </div>

      {/* Low Stock alerts */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--clx-text-primary)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock Timepieces
          </h2>
          <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 font-bold uppercase tracking-wider rounded">Stock Warning</span>
        </div>

        {lowStock.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-sm font-semibold text-green-700">All products are well stocked!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStock.map((prod) => (
              <div key={prod._id} className="p-4 border border-[var(--clx-border-light)] rounded-xl bg-[var(--clx-surface)]/30 hover:border-amber-200 transition-colors">
                <p className="text-[10px] font-semibold text-[var(--clx-gold)] uppercase tracking-wider">{prod.brand}</p>
                <h4 className="font-semibold text-sm truncate text-[var(--clx-text-primary)] mt-0.5">{prod.name}</h4>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[var(--clx-border-light)]">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded">
                    Only {prod.stock} left
                  </span>
                  <span className="font-bold text-xs text-[var(--clx-text-primary)]">₹{prod.price?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
