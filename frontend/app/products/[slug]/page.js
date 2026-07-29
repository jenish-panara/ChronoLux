'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore, useCartStore, useWishlistStore, useToastStore } from '@/lib/store';
import {
  Star, Plus, Minus, ShoppingCart, Heart, Share2, Truck,
  Shield, RotateCcw, CheckCircle2, Pencil, Trash2, Camera,
} from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ReviewImageLightbox from '@/components/ReviewImageLightbox';

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 'sm' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(rating)
              ? 'fill-[var(--clx-gold)] text-[var(--clx-gold)]'
              : 'text-[var(--clx-border)]'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-[var(--clx-text-secondary)]">{star}</span>
      <Star className="w-3 h-3 fill-[var(--clx-gold)] text-[var(--clx-gold)] flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-[var(--clx-border-light)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--clx-gold)' }}
        />
      </div>
      <span className="w-5 text-[var(--clx-text-muted)]">{count}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { slug } = params;
  const initialTab = searchParams.get('tab') || 'description';
  const { isAuthenticated, user } = useAuthStore();
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
  const [activeTab, setActiveTab] = useState(initialTab);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Lightbox
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  useEffect(() => { fetchProduct(); }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${slug}`);
      setProduct(response.data.product);
      setRelatedProducts(response.data.relatedProducts || []);
      if (response.data.product.images?.length > 0) setSelectedImage(0);
      fetchReviews(response.data.product._id);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}`);
      setReviews(response.data.reviews || []);
      setRatingBreakdown(response.data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setCanReview(response.data.canReview || false);
      setUserReview(response.data.userReview || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (product.stock < quantity) { showToast('Insufficient stock', 'error'); return; }
    setAddingToCart(true);
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity });
      const cartResponse = await apiClient.get('/cart');
      setCartCount(cartResponse.data.items?.length || 0);
      showToast('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAddingToWishlist(true);
    try {
      await apiClient.post('/wishlist', { productId: product._id });
      const wishlistResponse = await apiClient.get('/wishlist');
      setWishlistCount(wishlistResponse.data.products?.length || 0);
      showToast('Added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add to wishlist', 'error');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleReviewSuccess = (newReview) => {
    if (editingReview) {
      setReviews((prev) => prev.map((r) => (r._id === newReview._id ? newReview : r)));
      setUserReview(newReview);
      setEditingReview(null);
      showToast('Review updated!');
    } else {
      setReviews((prev) => [newReview, ...prev]);
      setUserReview(newReview);
      setCanReview(false);
      setShowForm(false);
      showToast('Review submitted!');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    setDeletingReviewId(reviewId);
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setUserReview(null);
      setCanReview(true);
      showToast('Review deleted');
    } catch (err) {
      showToast('Failed to delete review', 'error');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const openLightbox = (images, startIndex) => {
    setLightbox({ open: true, images, index: startIndex });
  };

  // ─── Loading / Not found ──────────────────────────────────────────────────

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

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Product Images ─────────────────────────────────────────────── */}
          <div>
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] overflow-hidden mb-4">
              <div className="relative h-72 sm:h-96 lg:h-[480px] bg-[var(--clx-surface)]">
                {product.images && product.images[selectedImage] ? (
                  <div className="absolute inset-8 sm:inset-12">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--clx-text-muted)]">No Image</div>
                )}
                {product.discount > 0 && (
                  <span className="luxury-badge-gold absolute top-4 left-4">{product.discount}% OFF</span>
                )}
              </div>
            </div>

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

          {/* ── Product Info ───────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)] mb-2">{product.brand}</p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--clx-text-primary)] mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-5">
              <StarRow rating={product.rating || 0} />
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

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <p className="text-green-600 text-sm font-medium">✓ In Stock</p>
              ) : product.stock > 0 ? (
                <p className="text-amber-600 text-sm font-medium">⚡ Only {product.stock} items left</p>
              ) : (
                <p className="text-red-500 text-sm font-medium">✕ Out of Stock</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="luxury-btn-gold flex-1 py-3.5 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className="w-12 h-12 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] disabled:opacity-40 transition-all"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Pills */}
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

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="border-t border-[var(--clx-border-light)]">
              <div className="flex border-b border-[var(--clx-border-light)] overflow-x-auto">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    id={`product-tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium tracking-wider uppercase whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-[var(--clx-gold)] text-[var(--clx-gold)]'
                        : 'text-[var(--clx-text-muted)] hover:text-[var(--clx-text-primary)]'
                    }`}
                  >
                    {tab === 'reviews' ? `Reviews (${totalReviews})` : tab}
                  </button>
                ))}
              </div>

              <div className="py-5">
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div className="text-sm text-[var(--clx-text-secondary)] leading-relaxed">
                    <p>{product.description}</p>
                  </div>
                )}

                {/* Specifications Tab */}
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

                {/* ── Reviews Tab ─────────────────────────────────────────── */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">

                    {/* ── Rating Summary Card ── */}
                    {totalReviews > 0 && (
                      <div className="flex flex-col sm:flex-row gap-6 bg-[var(--clx-surface)] rounded-2xl p-5 border border-[var(--clx-border-light)]">
                        {/* Left: big number */}
                        <div className="flex flex-col items-center justify-center min-w-[110px] py-2">
                          <span className="font-serif text-5xl font-bold text-[var(--clx-text-primary)] leading-none">{avgRating}</span>
                          <StarRow rating={parseFloat(avgRating)} size="lg" />
                          <span className="mt-1.5 text-xs text-[var(--clx-text-muted)]">
                            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {/* Right: bar breakdown */}
                        <div className="flex-1 flex flex-col justify-center gap-2">
                          {[5, 4, 3, 2, 1].map((s) => (
                            <RatingBar
                              key={s}
                              star={s}
                              count={ratingBreakdown[s] || 0}
                              total={totalReviews}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Review Form Gate ── */}
                    {!isAuthenticated && (
                      <div className="flex items-center gap-3 p-4 bg-[var(--clx-surface)] rounded-xl border border-[var(--clx-border-light)]">
                        <Star className="w-5 h-5 text-[var(--clx-gold)] flex-shrink-0" />
                        <p className="text-sm text-[var(--clx-text-secondary)]">
                          <a href="/login" className="text-[var(--clx-gold)] font-medium hover:underline">Log in</a>
                          {' '}to write a review for this product.
                        </p>
                      </div>
                    )}

                    {isAuthenticated && canReview && !showForm && !editingReview && (
                      <button
                        id="write-review-btn"
                        onClick={() => setShowForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[var(--clx-gold)]/50 rounded-xl text-sm font-medium text-[var(--clx-gold)] hover:bg-[var(--clx-gold)]/5 hover:border-[var(--clx-gold)] transition-all"
                      >
                        <Star className="w-4 h-4" />
                        Write a Review
                      </button>
                    )}

                    {isAuthenticated && canReview && showForm && !editingReview && (
                      <ReviewForm
                        productId={product._id}
                        onSuccess={handleReviewSuccess}
                        onCancel={() => setShowForm(false)}
                      />
                    )}

                    {isAuthenticated && !canReview && !userReview && (
                      <div className="p-4 bg-[var(--clx-surface)] rounded-xl border border-[var(--clx-border-light)] text-sm text-[var(--clx-text-muted)] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--clx-text-muted)] flex-shrink-0" />
                        Only customers who have received this product can leave a review.
                      </div>
                    )}

                    {/* Edit form */}
                    {editingReview && (
                      <ReviewForm
                        productId={product._id}
                        initialData={editingReview}
                        onSuccess={handleReviewSuccess}
                        onCancel={() => setEditingReview(null)}
                      />
                    )}

                    {/* ── Individual Reviews ── */}
                    {reviews.length > 0 ? (
                      <div className="space-y-5">
                        {reviews.map((review) => {
                          const isOwner = user && review.user?._id?.toString() === user._id?.toString();
                          return (
                            <div
                              key={review._id}
                              className={`rounded-2xl border p-5 transition-all ${
                                isOwner
                                  ? 'border-[var(--clx-gold)]/30 bg-[var(--clx-gold)]/3'
                                  : 'border-[var(--clx-border-light)] bg-white'
                              }`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {/* Avatar */}
                                  <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, var(--clx-gold), #b8862e)' }}
                                  >
                                    {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm text-[var(--clx-text-primary)]">
                                        {review.user?.name}
                                      </span>
                                      {review.isVerifiedPurchase && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          Verified Purchase
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[var(--clx-text-muted)] mt-0.5">
                                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Owner actions */}
                                {isOwner && (
                                  <div className="flex gap-1.5 flex-shrink-0">
                                    <button
                                      id={`edit-review-${review._id}`}
                                      onClick={() => { setEditingReview(review); setShowForm(false); }}
                                      className="p-1.5 rounded-lg border border-[var(--clx-border)] hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all"
                                      title="Edit review"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`delete-review-${review._id}`}
                                      onClick={() => handleDeleteReview(review._id)}
                                      disabled={deletingReviewId === review._id}
                                      className="p-1.5 rounded-lg border border-[var(--clx-border)] hover:border-red-400 hover:text-red-500 transition-all disabled:opacity-50"
                                      title="Delete review"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Stars */}
                              <StarRow rating={review.rating} />

                              {/* Title */}
                              {review.title && (
                                <h4 className="font-semibold text-sm mt-2 text-[var(--clx-text-primary)]">{review.title}</h4>
                              )}

                              {/* Comment */}
                              <p className="text-sm text-[var(--clx-text-secondary)] mt-1.5 leading-relaxed">{review.comment}</p>

                              {/* Images */}
                              {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {review.images.map((img, imgIdx) => (
                                    <button
                                      key={img.publicId || imgIdx}
                                      id={`review-img-${review._id}-${imgIdx}`}
                                      onClick={() => openLightbox(review.images, imgIdx)}
                                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--clx-border-light)] hover:border-[var(--clx-gold)] transition-all group"
                                    >
                                      <img
                                        src={img.url}
                                        alt={`Review photo ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      {imgIdx === 2 && review.images.length > 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">+{review.images.length - 3}</span>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => openLightbox(review.images, 0)}
                                    className="flex items-center gap-1 text-xs text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] transition-colors self-center ml-1"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                    {review.images.length} photo{review.images.length > 1 ? 's' : ''}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Star className="w-10 h-10 text-[var(--clx-border)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--clx-text-muted)]">No reviews yet. Be the first to review this timepiece!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────────────────── */}
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
                        <img
                          src={rp.images[0]}
                          alt={rp.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                        />
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

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox.open && (
        <ReviewImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
          onNav={(i) => setLightbox((prev) => ({ ...prev, index: i }))}
        />
      )}
    </div>
  );
}