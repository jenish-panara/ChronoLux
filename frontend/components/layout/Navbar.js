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
    { href: '/products', label: 'Collection' },
    ...(isAuthenticated ? [{ href: '/orders', label: 'Orders' }] : []),
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-[var(--clx-border-light)]"
      style={{ transition: 'all var(--transition-base)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <div className="w-28 h-12 sm:w-36 sm:h-16 overflow-hidden flex items-center justify-center">
              <img
                src="/images/Logo1.png"
                alt="ChronoLux Logo"
                className="w-40 sm:w-44 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 relative py-1 ${
                  pathname === link.href
                    ? 'text-[var(--clx-gold)]'
                    : 'text-[var(--clx-text-secondary)] hover:text-[var(--clx-text-primary)]'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--clx-gold)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-[var(--clx-surface)] border border-[var(--clx-border-light)] rounded-full px-4 py-2 w-48 lg:w-72 transition-all duration-300 focus-within:border-[var(--clx-gold)] focus-within:shadow-[0_0_0_3px_rgba(201,169,110,0.1)]"
            >
              <Search className="w-4 h-4 text-[var(--clx-text-muted)] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search timepieces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 ml-2 bg-transparent outline-none border-none focus:outline-none focus:ring-0 shadow-none text-sm text-[var(--clx-text-primary)] placeholder:text-[var(--clx-text-muted)]"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-full bg-[var(--clx-black)] text-white text-xs font-medium tracking-wider uppercase hover:bg-[var(--clx-charcoal)] transition-all flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-[var(--clx-surface)] transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px] text-[var(--clx-text-secondary)]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2.5 rounded-full hover:bg-[var(--clx-surface)] transition-colors relative"
            >
              <Heart className="w-[18px] h-[18px] text-[var(--clx-text-secondary)]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[var(--clx-gold)] text-[var(--clx-black)] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2.5 rounded-full hover:bg-[var(--clx-surface)] transition-colors relative"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-[var(--clx-text-secondary)]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[var(--clx-gold)] text-[var(--clx-black)] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User / Login */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="p-2.5 rounded-full hover:bg-[var(--clx-surface)] transition-colors"
              >
                <User className="w-[18px] h-[18px] text-[var(--clx-text-secondary)]" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-5 py-2 bg-[var(--clx-black)] text-white rounded text-xs font-medium tracking-[0.1em] uppercase hover:bg-[var(--clx-charcoal)] transition-all duration-300"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-[var(--clx-surface)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--clx-text-primary)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--clx-text-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-[var(--clx-border-light)] py-3 px-1 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[var(--clx-surface)] border border-[var(--clx-border)] rounded-full px-4 py-2.5">
                <Search className="w-4 h-4 text-[var(--clx-text-muted)]" />
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
                className="luxury-btn px-4 py-2.5 text-xs rounded-full"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--clx-border-light)] bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3.5 rounded-lg text-sm font-medium tracking-wide uppercase transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[var(--clx-surface)] text-[var(--clx-gold)] border-l-2 border-[var(--clx-gold)]'
                    : 'text-[var(--clx-text-secondary)] hover:bg-[var(--clx-surface)] hover:text-[var(--clx-text-primary)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                className="block px-4 py-3.5 rounded-lg text-sm font-medium tracking-wide uppercase bg-[var(--clx-black)] text-white text-center mt-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}