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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { cartCount } = useCartStore();
  const { wishlistCount } = useWishlistStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    searchTerm.trim() ? router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`) : router.push('/products');

    setSearchTerm('');
    setMobileSearchOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="w-28 h-12 sm:w-36 sm:h-16 overflow-hidden flex items-center justify-center">
              <img
                src="/images/Logo1.png"
                alt="ChronoLux Logo"
                className="w-40 sm:w-44 object-cover"
              />
            </div>
          </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="
                        hidden md:flex
                        items-center
                        bg-gray-50
                        border
                        border-gray-200
                        rounded-full
                        px-3
                        py-1.5
                        lg:px-4
                        w-48
                        lg:w-80
                        transition-all
                        duration-300
                        focus-within:border-black
                        focus-within:shadow-lg
                      "
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" />

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                          flex-1
                          ml-2
                          bg-transparent
                          outline-none
                          text-xs
                          lg:text-sm
                          placeholder:text-gray-400
                        "
              />

              <button
                type="submit"
                className="
                          px-2
                          py-1
                          lg:px-4
                          lg:py-2
                          rounded-full
                          bg-black
                          text-white
                          text-xs
                          lg:text-sm
                          font-medium
                          hover:bg-gray-800
                          transition-all
                          flex-shrink-0
                        "
              >
                <span className="hidden lg:inline">Search</span>
                <Search className="w-4 h-4 lg:hidden" />
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 py-2 lg:px-4 lg:py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t py-3 px-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search luxury watches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 ml-2 bg-transparent outline-none text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg text-base font-medium bg-black text-white text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}