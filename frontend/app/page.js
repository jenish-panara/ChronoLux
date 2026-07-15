'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsAPI, cartAPI } from '@/lib/api';
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
      eyebrow: 'The ChronoLux Collection',
      title: 'Timeless Luxury',
      subtitle: 'Precision Crafted for Every Moment',
      description: 'Discover premium timepieces crafted with elegance, precision and an unwavering commitment to excellence.',
    },
    {
      image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
      eyebrow: 'Signature Timepieces',
      title: 'Elevated Elegance',
      subtitle: 'Bold Designs for Modern Connoisseurs',
      description: 'From minimalist classics to statement pieces, find your perfect horological companion.',
    },
    {
      image: 'https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?auto=format&fit=crop&w=1920&q=80',
      eyebrow: 'Limited Editions',
      title: 'Crafted to Impress',
      subtitle: 'Exclusive Releases with Premium Detailing',
      description: 'Explore limited-edition watches designed for collectors and trendsetters alike.',
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
        <div className="luxury-card">
          {/* Image */}
          <div className="relative h-44 sm:h-52 lg:h-64  overflow-hidden">
            {product.images && product.images[0] ? (
              <div className="absolute inset-4 sm:inset-8">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-sm">
                No Image
              </div>
            )}
            {product.discount > 0 && (
              <span className="luxury-badge-gold absolute top-3 left-3">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-1">
              {product.brand}
            </p>
            <h3 className="font-serif font-semibold text-sm sm:text-base lg:text-lg text-[var(--clx-text-primary)] mb-2 line-clamp-1">
              {product.name}
            </h3>

            <div className="flex items-center mb-3">
              <Star className="w-3.5 h-3.5 fill-[var(--clx-gold)] text-[var(--clx-gold)]" />
              <span className="text-xs ml-1 text-[var(--clx-text-primary)] font-medium">
                {product.rating || 0}
              </span>
              <span className="text-[var(--clx-text-muted)] text-xs ml-1">
                ({product.numReviews || 0})
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                {product.discount > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-base sm:text-lg font-bold text-[var(--clx-text-primary)]">
                      ₹{product.finalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--clx-text-muted)] line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-[var(--clx-text-primary)]">
                    ₹{product.finalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-[var(--clx-black)] text-white rounded hover:bg-[var(--clx-charcoal)] disabled:bg-[var(--clx-text-muted)] disabled:cursor-not-allowed text-xs font-medium tracking-wider uppercase transition-all duration-300"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{addingToCart ? '...' : 'Add'}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-[var(--clx-ivory)]">

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="pt-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 sm:py-4">
          <div className="relative min-h-[420px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[620px] xl:min-h-[680px] rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Background Images */}
            <div className="absolute inset-0">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${index === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                    }`}
                />
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 sm:px-8 lg:px-12">
              <span className="tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs mb-3 sm:mb-5 text-[var(--clx-gold)] font-medium uppercase">
                {currentHero.eyebrow}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-5 text-white leading-[1.1]">
                {currentHero.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-2 sm:mb-3 font-light tracking-wide">
                {currentHero.subtitle}
              </p>
              <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/50 mb-6 sm:mb-10 leading-relaxed">
                {currentHero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/products"
                  className="px-8 py-3 sm:py-3.5 bg-[var(--clx-gold)] text-[var(--clx-black)] font-semibold text-sm tracking-[0.1em] uppercase rounded hover:bg-[var(--clx-gold-dark)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)]"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 sm:py-3.5 border border-white/30 text-white font-medium text-sm tracking-[0.1em] uppercase rounded hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide
                    ? 'w-8 sm:w-10 bg-[var(--clx-gold)]'
                    : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ NEW ARRIVALS ══════════════ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 sm:mb-12">
            <div>
              <span className="section-eyebrow">Just Arrived</span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--clx-text-primary)]">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products?isNewArrival=true"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] tracking-wider uppercase transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                  setCartCount={setCartCount}
                />
              ))}
            </div>
          )}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/products?isNewArrival=true"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--clx-gold)] tracking-wider uppercase"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ BEST SELLERS ══════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[var(--clx-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 sm:mb-12">
            <div>
              <span className="section-eyebrow">Most Popular</span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--clx-text-primary)]">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/products?isBestSeller=true"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] tracking-wider uppercase transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                  setCartCount={setCartCount}
                />
              ))}
            </div>
          )}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/products?isBestSeller=true"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--clx-gold)] tracking-wider uppercase"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY CHOOSE US ══════════════ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="section-eyebrow">The ChronoLux Promise</span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--clx-text-primary)] mb-4">
              Why Collectors Choose Us
            </h2>
            <div className="gold-accent-center mb-6" />
            <p className="text-[var(--clx-text-secondary)] text-sm sm:text-base max-w-xl mx-auto">
              A seamless luxury experience built around trust, authenticity, and uncompromising quality.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: '⌚', title: 'Authentic Watches', desc: '100% genuine timepieces from trusted global brands.', bg: 'bg-amber-50' },
              { icon: '🚚', title: 'Swift Delivery', desc: 'Quick, reliable & insured shipping across India.', bg: 'bg-blue-50' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Multiple trusted payment methods for safe checkout.', bg: 'bg-green-50' },
              { icon: '↩️', title: 'Easy Returns', desc: 'Hassle-free returns for complete peace of mind.', bg: 'bg-rose-50' },
            ].map((item) => (
              <div
                key={item.title}
                className="group bg-white border border-[var(--clx-border-light)] rounded-2xl p-5 sm:p-7 lg:p-8 text-center hover:border-[var(--clx-gold)] hover:shadow-[var(--clx-shadow-lg)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`mx-auto mb-4 sm:mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${item.bg} text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-serif font-semibold text-sm sm:text-base lg:text-lg mb-1.5 sm:mb-2 text-[var(--clx-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[var(--clx-text-secondary)] text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[var(--clx-black)] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--clx-gold)]/30 to-transparent" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--clx-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="text-[var(--clx-gold)] text-xs tracking-[0.3em] uppercase font-medium mb-4 block">
            Stay Connected
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4">
            Join the ChronoLux Circle
          </h2>
          <p className="text-white/40 mb-8 sm:mb-10 text-sm sm:text-base">
            Be the first to discover new arrivals, exclusive offers, and horological insights.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 outline-none focus:border-[var(--clx-gold)] transition-colors"
              required
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-[var(--clx-gold)] text-[var(--clx-black)] rounded font-semibold text-sm tracking-wider uppercase hover:bg-[var(--clx-gold-dark)] transition-all duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
