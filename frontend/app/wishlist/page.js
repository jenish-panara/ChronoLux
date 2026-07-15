'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistAPI, cartAPI } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { setCartCount } = useCartStore();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user');
      if (!userId) { setError('Please login first'); return; }
      const response = await wishlistAPI.getWishlist(userId);
      setWishlist(response?.data?.wishlist?.products || []);
    } catch (err) { console.error(err); setError('Failed to load wishlist'); } finally { setLoading(false); }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.delete(`/wishlist/${productId}`, { data: { userId } });
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center bg-[var(--clx-ivory)]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center bg-[var(--clx-ivory)]">
        <p className="text-red-500 text-base">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-[var(--clx-gold)]" />
          <div>
            <span className="section-eyebrow">Saved Items</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">
              My Wishlist ({wishlist.length})
            </h1>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="mx-auto w-16 h-16 text-[var(--clx-border)]" />
            <h2 className="font-serif text-2xl font-semibold mt-4 text-[var(--clx-text-primary)]">Your wishlist is empty</h2>
            <p className="text-[var(--clx-text-secondary)] text-sm mt-2 mb-8">Save items you love to come back to them later.</p>
            <Link href="/products" className="luxury-btn-gold px-8 py-3">Explore Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} removeFromWishlist={removeFromWishlist} isAuthenticated={isAuthenticated} setCartCount={setCartCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WishlistCard({ product, removeFromWishlist, isAuthenticated, setCartCount }) {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (product.stock <= 0) { alert('Product is out of stock'); return; }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { productId: product._id, quantity: 1 });
      await api.delete(`/wishlist/${product._id}`, { data: { userId: localStorage.getItem('userId') } });
      const cartResponse = await cartAPI.getCart();
      setCartCount(cartResponse?.data?.items?.length || 0);
      alert('Added to cart successfully!');
    } catch (error) { console.error('Error adding to cart:', error); alert('Failed to add to cart'); } finally { setAddingToCart(false); }
  };

  return (
    <div className="luxury-card group">
      <div className="relative h-56 bg-[var(--clx-surface)] overflow-hidden">
        {product.images?.[0] ? (
          <div className="absolute inset-4 sm:inset-8">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--clx-text-muted)]">No Image</div>
        )}
        <button
          onClick={() => api.delete(`/wishlist/${product._id}`, { data: { userId: localStorage.getItem('userId') } }).then(() => removeFromWishlist(product._id))}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-[var(--clx-shadow-sm)] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <Link href={`/products/${product.slug}`}>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--clx-gold)] mb-1">{product.brand}</p>
          <h3 className="font-serif font-semibold text-base hover:text-[var(--clx-gold)] transition-colors">{product.name}</h3>
        </Link>
        <div className="mt-3">
          <span className="text-lg font-bold text-[var(--clx-text-primary)]">₹{product.finalPrice?.toLocaleString()}</span>
        </div>
        <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0} className="luxury-btn w-full mt-4 py-2.5 text-xs">
          <ShoppingCart className="w-4 h-4" />
          {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out Of Stock' : 'Add To Cart'}
        </button>
      </div>
    </div>
  );
}