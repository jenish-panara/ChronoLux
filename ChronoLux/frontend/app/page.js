'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';
import { ArrowRight, Star } from 'lucide-react';

export default function Home() {
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
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const ProductCard = ({ product }) => (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">        <div className="relative h-64 bg-white">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
      </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm ml-1">{product.rating || 0}</span>
            <span className="text-gray-400 text-sm ml-1">({product.numReviews || 0})</span>
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
    </Link>
  );

  return (
    <div>
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative h-[500px] rounded-3xl overflow-hidden group">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
              <span className="uppercase tracking-[6px] text-sm mb-4 text-white/70">
                {currentHero.eyebrow}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                {currentHero.title}
              </h1>
              <p className="text-lg md:text-2xl text-white/80 mb-4">
                {currentHero.subtitle}
              </p>
              <p className="max-w-2xl text-base md:text-lg text-white/70 mb-8">
                {currentHero.description}
              </p>
              <div className="flex gap-3">
                <Link href="/products" className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition">
                  Shop Collection
                </Link>
                <Link href="/contact" className="px-6 py-3 rounded-full border border-white/70 text-white hover:bg-white/10 transition">
                  Contact Us
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-md transition"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-md transition"
              aria-label="Next slide"
            >
              →
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <Link href="/products?isNewArrival=true" className="text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Best Sellers</h2>
            <Link href="/products?isBestSeller=true" className="text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-3 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black text-white text-sm font-semibold mb-4">
              Why ChronoLux
            </span>
            <h2 className="text-3xl font-bold mb-3">Why Customers Choose Us</h2>
            <p className="text-gray-600">
              A seamless luxury shopping experience built around trust, quality, and convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="group bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                ⌚
              </div>
              <h3 className="font-semibold text-xl mb-2">Authentic Watches</h3>
              <p className="text-gray-600">100% genuine products from trusted global brands.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                🚚
              </div>
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping across India.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                🔒
              </div>
              <h3 className="font-semibold text-xl mb-2">Secure Payments</h3>
              <p className="text-gray-600">Multiple trusted payment methods for safe checkout.</p>
            </div>

            <div className="group bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-3xl">
                ↩️
              </div>
              <h3 className="font-semibold text-xl mb-2">Easy Returns</h3>
              <p className="text-gray-600">Hassle-free returns for complete peace of mind.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-8">Subscribe to our newsletter for exclusive deals and new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-black"
              required
            />
            <button type="submit" className="px-6 py-3 bg-white text-black rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}