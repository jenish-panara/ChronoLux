'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore, useCartStore, useWishlistStore, useToastStore } from '@/lib/store';
import { Star, Plus, Minus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { slug } = params;
  const { isAuthenticated } = useAuthStore();
  const { setCartCount } = useCartStore();
  const { setWishlistCount } = useWishlistStore();
  const { showToast } = useToastStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);

  useEffect(() => { fetchProduct(); }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProduct(slug);
      setProduct(response.data.product);
      setRelatedProducts(response.data.relatedProducts || []);
      if (response.data.product.images?.length > 0) setSelectedImage(0);
      fetchReviews(response.data.product._id);
    } catch (error) { console.error('Error fetching product:', error); } finally { setLoading(false); }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await reviewsAPI.getProductReviews(productId);
      setReviews(response.data.reviews || []);
    } catch (error) { console.error('Error fetching reviews:', error); }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (product.stock < quantity) { showToast('Insufficient stock', 'error'); return; }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { productId: product._id, quantity });
      const cartResponse = await cartAPI.getCart();
      setCartCount(cartResponse.data.items?.length || 0);
      showToast('Added to cart');
    } catch (error) { console.error('Error adding to cart:', error); showToast('Failed to add to cart', 'error'); } finally { setAddingToCart(false); }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAddingToWishlist(true);
    try {
      await wishlistAPI.addToWishlist({ productId: product._id });
      const wishlistResponse = await wishlistAPI.getWishlist();
      setWishlistCount(wishlistResponse.data.products?.length || 0);
      showToast('Added to wishlist');
    } catch (error) { console.error('Error adding to wishlist:', error); showToast('Failed to add to wishlist', 'error'); } finally { setAddingToWishlist(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--clx-ivory)]">
        <p className="font-serif text-xl text-[var(--clx-text-secondary)]">Product not found</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Product Images */}
          <div>
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] overflow-hidden mb-4">
              <div className="relative h-72 sm:h-96 lg:h-[480px] bg-[var(--clx-surface)]">
                {product.images && product.images[selectedImage] ? (
                  <div className="absolute inset-8 sm:inset-12">
                    <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)]">No Image</div>
                )}
                {product.discount > 0 && (
                  <span className="luxury-badge-gold absolute top-4 left-4">{product.discount}% OFF</span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white rounded-xl shadow-[var(--clx-shadow-sm)] overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-[var(--clx-gold)]' : 'border-transparent hover:border-[var(--clx-border)]'
                    }`}
                  >
                    <img src={image} alt={`${product.name} - ${index + 1}`} className="w-full h-16 sm:h-20 object-cover mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)] mb-2">{product.brand}</p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--clx-text-primary)] mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-[var(--clx-gold)] text-[var(--clx-gold)]' : 'text-[var(--clx-border)]'}`} />
                ))}
              </div>
              <span className="ml-2 text-[var(--clx-text-secondary)] text-sm">
                {product.rating || 0} ({product.numReviews || 0} reviews)
              </span>
            </div>

            <div className="w-full h-[1px] bg-[var(--clx-border-light)] mb-5" />

            {/* Price */}
            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-serif text-3xl font-bold text-[var(--clx-text-primary)]">₹{product.finalPrice.toLocaleString()}</span>
                  <span className="text-lg text-[var(--clx-text-muted)] line-through">₹{product.price.toLocaleString()}</span>
                  <span className="luxury-badge-gold">{product.discount}% OFF</span>
                </div>
              ) : (
                <span className="font-serif text-3xl font-bold text-[var(--clx-text-primary)]">₹{product.finalPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <p className="text-green-600 text-sm font-medium">✓ In Stock</p>
              ) : product.stock > 0 ? (
                <p className="text-amber-600 text-sm font-medium">⚡ Only {product.stock} items left</p>
              ) : (
                <p className="text-red-500 text-sm font-medium">✕ Out of Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} className="w-10 h-10 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart} className="luxury-btn-gold flex-1 py-3.5 text-sm">
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleAddToWishlist} disabled={addingToWishlist} className="w-12 h-12 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] disabled:opacity-40 transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: '2 Year Warranty' },
                { icon: RotateCcw, label: '30 Day Returns' },
              ].map((feature) => (
                <div key={feature.label} className="flex flex-col items-center p-3 bg-[var(--clx-surface)] rounded-xl border border-[var(--clx-border-light)]">
                  <feature.icon className="w-5 h-5 mb-1.5 text-[var(--clx-gold)]" />
                  <span className="text-[10px] sm:text-xs text-center text-[var(--clx-text-secondary)] font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-[var(--clx-border-light)]">
              <div className="flex border-b border-[var(--clx-border-light)] overflow-x-auto">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium tracking-wider uppercase whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-[var(--clx-gold)] text-[var(--clx-gold)]'
                        : 'text-[var(--clx-text-muted)] hover:text-[var(--clx-text-primary)]'
                    }`}
                  >
                    {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                  </button>
                ))}
              </div>

              <div className="py-5">
                {activeTab === 'description' && (
                  <div className="text-sm text-[var(--clx-text-secondary)] leading-relaxed"><p>{product.description}</p></div>
                )}
                {activeTab === 'specifications' && (
                  <div>
                    {product.specifications ? (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="bg-[var(--clx-surface)] p-3 rounded-lg border border-[var(--clx-border-light)]">
                            <dt className="text-xs font-semibold text-[var(--clx-text-secondary)] tracking-wider uppercase">{key}</dt>
                            <dd className="text-sm text-[var(--clx-text-primary)] mt-1">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-sm text-[var(--clx-text-muted)]">No specifications available</p>
                    )}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-[var(--clx-border-light)] pb-4 last:border-b-0">
                            <div className="flex items-center mb-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[var(--clx-gold)] text-[var(--clx-gold)]' : 'text-[var(--clx-border)]'}`} />
                                ))}
                              </div>
                              <span className="ml-2 font-medium text-sm text-[var(--clx-text-primary)]">{review.user?.name}</span>
                            </div>
                            {review.title && <h4 className="font-medium text-sm mb-1">{review.title}</h4>}
                            <p className="text-sm text-[var(--clx-text-secondary)]">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--clx-text-muted)]">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div className="text-center mb-10">
              <span className="section-eyebrow">You May Also Like</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">Related Timepieces</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <a key={rp._id} href={`/products/${rp.slug}`} className="luxury-card group">
                  <div className="relative h-40 sm:h-52 bg-[var(--clx-surface)] overflow-hidden">
                    {rp.images && rp.images[0] ? (
                      <div className="absolute inset-4 sm:inset-8">
                        <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)] text-xs">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-1">{rp.brand}</p>
                    <h3 className="font-serif font-semibold text-sm line-clamp-1 text-[var(--clx-text-primary)]">{rp.name}</h3>
                    <p className="font-bold mt-2 text-sm">₹{rp.finalPrice.toLocaleString()}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}