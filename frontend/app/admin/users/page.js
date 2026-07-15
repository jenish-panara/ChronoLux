'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Search, Users, ChevronLeft, ChevronRight, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim(),
      };
      const response = await adminAPI.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Directory</span>
        <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Customers</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search customer name, email, phone..."
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
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[var(--clx-text-secondary)]">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-spacing-0">
              <thead>
                <tr className="bg-[var(--clx-surface)] border-b border-[var(--clx-border-light)] text-[10px] font-semibold tracking-wider text-[var(--clx-text-secondary)] uppercase">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Contact info</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Orders Count</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clx-border-light)] text-sm text-[var(--clx-text-primary)]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-[var(--clx-surface)]/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 bg-[var(--clx-surface)] rounded-full flex items-center justify-center text-[var(--clx-gold)] font-serif font-bold border border-[var(--clx-border-light)] flex-shrink-0">
                        {user.name ? user.name[0].toUpperCase() : <Users className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold">{user.name}</span>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--clx-text-secondary)]">
                        <Mail className="w-3.5 h-3.5 text-[var(--clx-text-muted)]" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--clx-text-secondary)]">
                          <Phone className="w-3.5 h-3.5 text-[var(--clx-text-muted)]" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[var(--clx-text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--clx-text-muted)]" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-[var(--clx-text-secondary)]">
                      {user.orderCount || 0} orders
                    </td>
                    <td className="py-4 px-6 font-bold text-right text-[var(--clx-text-primary)]">
                      ₹{user.totalSpent?.toLocaleString() || 0}
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
    </div>
  );
}
