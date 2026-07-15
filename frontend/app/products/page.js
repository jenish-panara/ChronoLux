'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { productsAPI, categoriesAPI, cartAPI } from '@/lib/api';
import { ShoppingCart, Star } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Filter, Search } from 'lucide-react';
import "./product.css";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthStore();
  const { setCartCount } = useCartStore();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    gender: '',
    search: searchParams.get('search') || '',
    sortBy: 'latest',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    setSearchInput(searchFromUrl);
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters.search !== searchFromUrl) newFilters.search = searchFromUrl;
      if (newFilters.category !== categoryFromUrl) newFilters.category = categoryFromUrl;
      return newFilters;
    });
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        setPage(1);
        return { ...prev, search: searchInput };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { ...filters, page, limit: 12 };
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] == null) delete params[key];
        });
        const response = await productsAPI.getProducts(params, { signal: controller.signal });
        setProducts(response.data.products || []);
        setTotalPages(response.data.pages || 1);
        setTotalProducts(response.data.total || 0);
      } catch (err) {
        if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
        console.error('Error fetching products:', err);
        if (err.response?.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out. The server may be slow — please try again.');
        } else {
          setError('Failed to load products. Make sure the backend server is running on port 5000.');
        }
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [filters, page, retryCount]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') { setSearchInput(value); return; }
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', minRating: '', gender: '', search: '', sortBy: 'latest' });
    setPage(1);
  };

  const brands = ['Rolex', 'Titan', 'Casio', 'Fossil', 'Seiko', 'Omega', 'Tag Heuer'];

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      {/* Page Header */}
      <div className="bg-[var(--clx-black)] text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[var(--clx-gold)] text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
            Explore Our
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold mb-3">Collection</h1>
          <div className="w-12 h-[2px] bg-[var(--clx-gold)] mx-auto" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden w-full mb-5 flex items-center justify-between px-5 py-3.5 bg-white border border-[var(--clx-border-light)] rounded-xl shadow-[var(--clx-shadow-sm)]"
        >
          <span className="flex items-center text-sm font-medium text-[var(--clx-text-primary)]">
            <Filter className="w-4 h-4 mr-2 text-[var(--clx-gold)]" />
            Filters
          </span>
          <span className="text-[var(--clx-text-muted)] text-xs">{showMobileFilters ? '▲' : '▼'}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 xl:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-2xl border border-[var(--clx-border-light)] p-5 sm:p-6 shadow-[var(--clx-shadow-sm)] sticky top-24">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-base sm:text-lg font-semibold flex items-center text-[var(--clx-text-primary)]">
                  <Filter className="w-4 h-4 mr-2 text-[var(--clx-gold)]" />
                  Filters
                </h2>
                <button onClick={clearFilters} className="text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] text-xs font-medium tracking-wider uppercase transition-colors">
                  Clear All
                </button>
              </div>

              <div className="space-y-5">
                {/* Category Filter */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Category</h3>
                  <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="luxury-select">
                    <option value="">All Categories</option>
                    {categories.map((category) => (<option key={category._id} value={category._id}>{category.name}</option>))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Brand</h3>
                  <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)} className="luxury-select">
                    <option value="">All Brands</option>
                    {brands.map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Price Range</h3>
                  <div className="flex gap-2 items-center">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="luxury-input text-sm py-2.5" />
                    <span className="text-[var(--clx-text-muted)] text-xs">—</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="luxury-input text-sm py-2.5" />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Minimum Rating</h3>
                  <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="luxury-select">
                    <option value="">All Ratings</option>
                    <option value="4">4★ & above</option>
                    <option value="3">3★ & above</option>
                    <option value="2">2★ & above</option>
                    <option value="1">1★ & above</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Gender</h3>
                  <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)} className="luxury-select">
                    <option value="">All</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <p className="text-[var(--clx-text-secondary)] text-sm">
                Showing <span className="font-semibold text-[var(--clx-text-primary)]">{products.length}</span> of {totalProducts} timepieces
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs font-medium text-[var(--clx-text-secondary)] tracking-wider uppercase whitespace-nowrap">Sort:</label>
                <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className="luxury-select py-2 text-sm">
                  <option value="latest">Latest</option>
                  <option value="popularity">Popularity</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {searchParams.toString() && (
              <div className="mb-5">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
                    setSearchInput('');
                    setFilters((prev) => ({ ...prev, search: '' }));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--clx-border)] rounded-lg text-xs font-medium text-[var(--clx-text-secondary)] hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all"
                >
                  ✕ Reset Search
                </button>
              </div>
            )}

            {/* Products */}
            {error ? (
              <div className="text-center py-16">
                <p className="text-red-500 text-base mb-2">{error}</p>
                <button onClick={() => setRetryCount((c) => c + 1)} className="luxury-btn mt-4">Retry</button>
              </div>
            ) : loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--clx-text-secondary)] text-lg font-serif">No timepieces found</p>
                <button onClick={clearFilters} className="luxury-btn mt-5">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} isAuthenticated={isAuthenticated} setCartCount={setCartCount} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-10 sm:mt-12">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="luxury-btn-outline px-5 py-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-[var(--clx-text-secondary)]">
                      Page <span className="font-semibold text-[var(--clx-text-primary)]">{page}</span> of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="luxury-btn-outline px-5 py-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, isAuthenticated, setCartCount }) {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (product.stock < 1) { alert('Out of stock'); return; }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { productId: product._id, quantity: 1 });
      const cartResponse = await cartAPI.getCart();
      setCartCount(cartResponse.data.items?.length || 0);
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="luxury-card group bg-white">
      <div className="relative h-44 sm:h-52 lg:h-64  overflow-hidden">
        {product.images && product.images[0] ? (
          <div className="absolute inset-4 sm:inset-8">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-sm">No Image</div>
        )}
        {product.discount > 0 && (
          <span className="luxury-badge-gold absolute top-3 left-3">{product.discount}% OFF</span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="luxury-badge-dark absolute top-3 right-3">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-[var(--clx-text-muted)] text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">Sold Out</span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <a href={`/products/${product.slug}`} className="block">
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-1">{product.brand}</p>
          <h3 className="font-serif font-semibold text-sm sm:text-base lg:text-lg mb-2 line-clamp-1 text-[var(--clx-text-primary)] hover:text-[var(--clx-gold)] transition-colors">{product.name}</h3>
        </a>
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-xs ${i < Math.floor(product.rating || 0) ? 'text-[var(--clx-gold)]' : 'text-[var(--clx-border)]'}`}>★</span>
          ))}
          <span className="text-[10px] ml-1.5 text-[var(--clx-text-muted)]">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            {product.discount > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-base sm:text-lg font-bold text-[var(--clx-text-primary)]">₹{product.finalPrice.toLocaleString()}</span>
                <span className="text-xs text-[var(--clx-text-muted)] line-through">₹{product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-[var(--clx-text-primary)]">₹{product.finalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--clx-black)] text-white rounded hover:bg-[var(--clx-charcoal)] disabled:bg-[var(--clx-text-muted)] disabled:cursor-not-allowed text-xs font-medium tracking-wider uppercase transition-all duration-300"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{addingToCart ? '...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}