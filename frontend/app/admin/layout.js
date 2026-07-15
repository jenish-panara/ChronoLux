'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'CSV Import', href: '/admin/csv-import', icon: FileSpreadsheet },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (!hydrated || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clx-ivory)] flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[var(--clx-black)] text-white px-4 py-4 flex items-center justify-between border-b border-white/10">
        <Link href="/admin" className="font-serif text-lg font-semibold tracking-tight">
          Chrono<span className="text-[var(--clx-gold)]">Lux</span> <span className="text-xs uppercase font-sans tracking-[0.2em] ml-2 text-white/60">Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[var(--clx-black)] text-white flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 hidden md:block">
          <Link href="/admin" className="font-serif text-xl sm:text-2xl font-semibold tracking-tight">
            Chrono<span className="text-[var(--clx-gold)]">Lux</span>
          </Link>
          <div className="text-[10px] uppercase font-sans tracking-[0.2em] mt-1 text-[var(--clx-gold)] font-medium">
            Management Panel
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-[var(--clx-gold)] font-serif font-bold">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                  ${isActive 
                    ? 'bg-[var(--clx-gold)] text-[var(--clx-black)] font-semibold shadow-md shadow-[var(--clx-gold)]/10' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
        
        {/* Children Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
