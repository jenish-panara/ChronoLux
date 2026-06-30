'use client';

import { useState, useEffect, useRef, Suspense} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { productsAPI, categoriesAPI ,cartAPI } from '@/lib/api';
import {ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Filter, Search } from 'lucide-react';
import "./product.css";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
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

  (()=>{
      try {
        console.log("Fetching categories...");
      }
      catch (err) {
        console.error('Error fetching categories:', err);
      }

  })();
  // Sync URL parameters with component state
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';

    const categoryFromUrl = searchParams.get('category') || '';

    setSearchInput(searchFromUrl);
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters.search !== searchFromUrl) {
        newFilters.search = searchFromUrl;
      }
      if (newFilters.category !== categoryFromUrl) {
        newFilters.category = categoryFromUrl;
      }
      return newFilters;
    });
  }, [searchParams]);

  // Debounce search input to avoid flooding the API on every keystroke
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
        const params = {
          ...filters,
          page,
          limit: 12,
        };

        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] == null) {
            delete params[key];
          }
        });

        const response = await productsAPI.getProducts(params, {
          signal: controller.signal,
        });

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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [filters, page, retryCount]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      setSearchInput(value);
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      gender: '',
      search: '',
      sortBy: 'latest',
    });
    setPage(1);
  };

  const brands = ['Rolex', 'Titan', 'Casio', 'Fossil', 'Seiko', 'Omega', 'Tag Heuer'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden w-full mb-4 flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <span className="flex items-center font-medium">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </span>
        <span className="text-gray-500">
          {showMobileFilters ? '▲' : '▼'}
        </span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 xl:w-72 flex-shrink-0`}>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold flex items-center">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Price Range</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Minimum Rating</h3>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="">All Ratings</option>
                  <option value="4">4★ & above</option>
                  <option value="3">3★ & above</option>
                  <option value="2">2★ & above</option>
                  <option value="1">1★ & above</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Gender</h3>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {products.length} of {totalProducts} products
            </p>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black w-full sm:w-auto"
              >
                <option value="latest">Latest</option>
                <option value="popularity">Popularity</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {searchParams.toString() && (
            <div className="mb-4">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  router.replace(
                    `${pathname}${params.toString() ? `?${params.toString()}` : ''
                    }`
                  );
                  setSearchInput('');
                  setFilters((prev) => ({
                    ...prev,
                    search: '',
                  }));
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-black hover:text-white hover:border-black transition-all active:scale-95"
              >
                ✕ Reset Search
              </button>
            </div>
          )}

          {/* Products */}
          {error ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-red-600 text-base sm:text-lg mb-2">{error}</p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="mt-4 px-4 py-2 sm:px-6 sm:py-2.5 bg-black text-white rounded-md hover:bg-gray-800 text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-black"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 text-base sm:text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 sm:px-6 sm:py-2.5 bg-black text-white rounded-md hover:bg-gray-800 text-sm sm:text-base"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          isAuthenticated={isAuthenticated}
                          setCartCount={setCartCount}
                        />
                      ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base hover:border-black transition-colors min-w-[80px] sm:min-w-[100px]"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base hover:border-black transition-colors min-w-[80px] sm:min-w-[100px]"
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
  );
}

function ProductCard({ product, isAuthenticated, setCartCount }) {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
  if (!isAuthenticated) {
    window.location.href = '/login';
    return;
  }

  if (product.stock < 1) {
    alert('Out of stock');
    return;
  }

  setAddingToCart(true);

  try {
    await api.post('/cart/items', {
      productId: product._id,
      quantity: 1,
    });
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
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-40 sm:h-48 lg:h-64 bg-white">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-semibold">
            {product.discount}% OFF
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-orange-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gray-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-4">
        <a href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 line-clamp-1 min-h-[20px] sm:min-h-[24px] hover:text-blue-600">{product.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2">{product.brand}</p>
        </a>
        <div className="flex items-center mb-1.5 sm:mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xs sm:text-sm ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-[10px] sm:text-xs ml-1.5 sm:ml-2 text-gray-500">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex-1">
            {product.discount > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-sm sm:text-base lg:text-lg font-bold leading-tight">₹{product.finalPrice.toLocaleString()}</span>
                <span className="text-[10px] sm:text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base lg:text-lg font-bold leading-tight">₹{product.finalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-xs sm:text-sm min-w-[60px] sm:min-w-auto"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{addingToCart ? 'Adding...' : 'Add'}</span>
            <span className="sm:hidden">{addingToCart ? '...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}