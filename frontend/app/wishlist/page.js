'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useAuthStore, useCartStore, useToastStore } from '@/lib/store';
export default function WishlistPage() {

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, hydrated } = useAuthStore();
const { setCartCount } = useCartStore();

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated) {
        setError('Please login first');
        return;
      }

      const response = await apiClient.get('/wishlist');
      console.log("🚀 ~ fetchWishlist ~ response:", response.data)

      setWishlist(response?.data?.wishlist?.products || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Only fetch wishlist after auth state is hydrated
  useEffect(() => {
    if (hydrated) {
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const removeFromWishlist = async (productId) => {
    try {
      await apiClient.delete(`/wishlist/${productId}`);

      setWishlist((prev) =>
        prev.filter((item) => item._id !== productId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">
          My Wishlist ({wishlist.length})
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-semibold mt-4">
            Your wishlist is empty
          </h2>

          <Link
            href="/products"
            className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
              <WishlistCard
                  key={product._id}
                  product={product}
                  removeFromWishlist={removeFromWishlist}
                  isAuthenticated={isAuthenticated}
                  setCartCount={setCartCount}
              />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ product, removeFromWishlist, isAuthenticated, setCartCount }) {
    const [addingToCart, setAddingToCart] = useState(false);
    const { showToast } = useToastStore();

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (product.stock <= 0) {
            showToast('Product is out of stock', 'error');
            return;
        }

        setAddingToCart(true);

        try {
            await apiClient.post('/cart/items', { productId: product._id, quantity: 1 });
            await apiClient.delete(`/wishlist/${product._id}`);

            const cartResponse = await apiClient.get('/cart');

            setCartCount(
                cartResponse?.data?.cart?.items?.length || 0
            );

            showToast('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add to cart', 'error');
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
        <button
          onClick={() => removeFromWishlist(product._id)}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50 transition-colors"
          style={{ zIndex: 10 }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <Link href={`/products/${product.slug}`} className="block">
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-1">{product.brand}</p>
          <h3 className="font-serif font-semibold text-sm sm:text-base lg:text-lg mb-2 line-clamp-1 text-[var(--clx-text-primary)] hover:text-[var(--clx-gold)] transition-colors">{product.name}</h3>
        </Link>
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