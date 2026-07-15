'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsAPI ,cartAPI } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { setCartCount } = useCartStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.pexels.com/photos/34952855/pexels-photo-34952855.jpeg',
      eyebrow: 'ChronoLux Collection',
      title: 'Timeless Luxury',
      subtitle: 'Precision Crafted Watches For Every Moment',
      description: 'Discover premium watches crafted with elegance, precision and timeless design.',
    },
    {
      image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
      eyebrow: 'Signature Timepieces',
      title: 'Elevated Elegance',
      subtitle: 'Bold designs for modern connoisseurs',
      description: 'From minimalist classics to statement pieces, find your perfect companion.',
    },
    {
      image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg',
      eyebrow: 'Limited Editions',
      title: 'Crafted to Impress',
      subtitle: 'Exclusive releases with premium detailing',
      description: 'Explore limited-edition watches designed for collectors and trendsetters.',
    },
  ];

  const fetchHomeData = async () => {
    try {
      const [featuredRes, newArrivalsRes, bestSellersRes] = await Promise.all([
        productsAPI.getProducts({ isFeatured: true, limit: 8 }),
        productsAPI.getProducts({ isNewArrival: true, limit: 8 }),
        productsAPI.getProducts({ isBestSeller: true, limit: 8 }),
      ]);

      setFeaturedProducts(featuredRes.data.products || []);
      setNewArrivals(newArrivalsRes.data.products || []);
      setBestSellers(bestSellersRes.data.products || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentSlide];

  const goToSlide = (index) => setCurrentSlide(index);

  const ProductCard = ({ product, isAuthenticated, setCartCount }) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">

        <div className="relative h-40 sm:h-48 lg:h-64 bg-white">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
        </div>

        <div className="p-2.5 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 line-clamp-1 min-h-[20px] sm:min-h-[24px]">
            {product.name}
          </h3>

          <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2">
            {product.brand}
          </p>

          <div className="flex items-center mb-1.5 sm:mb-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm ml-1">
              {product.rating || 0}
            </span>
            <span className="text-gray-400 text-[10px] sm:text-xs sm:ml-1">
              ({product.numReviews || 0})
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex-1">
              {product.discount > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm sm:text-base lg:text-lg font-bold leading-tight">
                    ₹{product.finalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base lg:text-lg font-bold leading-tight">
                  ₹{product.finalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-xs sm:text-sm min-w-[60px] sm:min-w-auto"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{addingToCart ? 'Adding...' : 'Add'}</span>
              <span className="sm:hidden">{addingToCart ? '...' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

  return (
    <div>
      <section className="py-2 sm:py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px] xl:min-h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden group">
            <div className="absolute inset-0">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                  }`}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
              <span className="uppercase tracking-[3px] sm:tracking-[6px] text-[10px] sm:text-xs mb-2 sm:mb-4 text-white/70">
                {currentHero.eyebrow}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-3 sm:mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent px-2">
                {currentHero.title}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-2 sm:mb-4 px-2">
                {currentHero.subtitle}
              </p>
              <p className="max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg text-white/70 mb-4 sm:mb-8 px-4">
                {currentHero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto px-4">
                <Link
                  href="/products"
                  className="px-6 py-2.5 sm:py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition text-sm sm:text-base text-center"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2.5 sm:py-3 rounded-full border border-white/70 text-white hover:bg-white/10 transition text-sm sm:text-base text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 sm:w-8 bg-white' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">New Arrivals</h2>
            <Link href="/products?isNewArrival=true" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                  setCartCount={setCartCount}
                />              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Best Sellers</h2>
            <Link href="/products?isBestSeller=true" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                  setCartCount={setCartCount}
                />              ))}
            </div>
          )}
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-12">
            <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-black text-white text-[10px] sm:text-xs lg:text-sm font-semibold mb-3 sm:mb-4">
              Why ChronoLux
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">Why Customers Choose Us</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              A seamless luxury shopping experience built around trust, quality, and convenience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="group bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-14 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100 text-2xl sm:text-3xl">
                ⌚
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-xl mb-1 sm:mb-2">Authentic Watches</h3>
              <p className="text-gray-600 text-xs sm:text-sm">100% genuine products from trusted global brands.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-14 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-100 text-2xl sm:text-3xl">
                🚚
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-xl mb-1 sm:mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Quick and reliable shipping across India.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-14 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-green-100 text-2xl sm:text-3xl">
                🔒
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-xl mb-1 sm:mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Multiple trusted payment methods for safe checkout.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-14 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-100 text-2xl sm:text-3xl">
                ↩️
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-xl mb-1 sm:mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Hassle-free returns for complete peace of mind.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Section */}
      <section className="py-10 sm:py-12 lg:py-16 bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-4 sm:mb-8 text-sm sm:text-base">Subscribe to our newsletter for exclusive deals and new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-md text-black text-sm sm:text-base"
              required
            />
            <button type="submit" className="px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-black rounded-md font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
