'use client';

import { useState, useEffect, useRef, Suspense} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
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
    <div className="max-w-7xl mx-auto px-0 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="filter-sidebar">
          <div className="filter-card">
            <div className="filter-header">
              <h2 className="filter-title">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="clear-filter-btn"
              >
                Clear All
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden w-full py-2 px-4 bg-gray-100 rounded-md mb-4"
            >
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Category Filter */}
              <div>
                <h3 className="filter-label">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
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
                <h3 className="filter-label">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="filter-select"
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
                <h3 className="filter-label">Price Range</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="filter-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="filter-label">Minimum Rating</h3>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="filter-select"
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
                <h3 className="filter-label">Gender</h3>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="filter-select"
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
        <div className="flex-1">
          {/* Sort and Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600">
              Showing {products.length} of {totalProducts} products
            </p>
            {searchParams.toString() && (
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
                className="
    inline-flex items-center gap-2
    px-5 py-2.5
    bg-white
    border border-gray-300
    rounded-xl
    text-sm font-medium
    text-gray-700
    shadow-sm
    hover:bg-black
    hover:text-white
    hover:border-black
    transition-all duration-300
    hover:shadow-md
    active:scale-95
  "
              >
                ✕ Reset Filters
              </button>
            )}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="latest">Latest</option>
                <option value="popularity">Popularity</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-2">{error}</p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 bg-white">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.discount}% OFF
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <a href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-blue-600">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
        </a>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm ml-2">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-bold">₹{product.finalPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-400 line-through ml-2">₹{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-lg font-bold">₹{product.finalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}