'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Search } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { cartCount } = useCartStore();
  const { wishlistCount } = useWishlistStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    searchTerm.trim() ? router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`) : router.push('/products');

    setSearchTerm('');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-white rounded-xl border border-gray-300 px-4 py-2 shadow-sm hover:shadow-lg transition-all duration-300">
              <img
                src="/images/Logo1.png"
                alt="ChronoLux Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
          </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-15">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-black ${
                  pathname === link.href ? 'text-black' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <form
              onSubmit={handleSearch}
              className="
                        hidden md:flex
                        items-center
                        bg-gray-50
                        border
                        border-gray-200
                        rounded-full
                        px-4
                        py-2
                        w-80
                        transition-all
                        duration-300
                        focus-within:border-black
                        focus-within:shadow-lg
                      "
            >
              <Search className="w-5 h-5 text-gray-400" />

              <input
                type="text"
                placeholder="Search luxury watches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                          flex-1
                          ml-3
                          bg-transparent
                          outline-none
                          text-sm
                          placeholder:text-gray-400
                        "
              />

              <button
                type="submit"
                className="
                          px-4
                          py-2
                          rounded-full
                          bg-black
                          text-white
                          text-sm
                          font-medium
                          hover:bg-gray-800
                          transition-all
                        "
              >
                Search
              </button>
            </form>
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}