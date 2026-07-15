'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistAPI, cartAPI } from '@/lib/api';
import  api  from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
export default function WishlistPage() {

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();
const { setCartCount } = useCartStore();


  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem('user');

      if (!userId) {
        setError('Please login first');
        return;
      }

      const response = await wishlistAPI.getWishlist(userId);
      console.log("🚀 ~ fetchWishlist ~ response:", response.data)

      setWishlist(response?.data?.wishlist?.products || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');

      await api.delete(`/wishlist/${productId}`, { data: { userId } });

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
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (product.stock <= 0) {
            alert('Product is out of stock');
            return;
        }

        setAddingToCart(true);

        try {
            await api.post('/cart/items', { productId: product._id, quantity: 1 });
            await api.delete(`/wishlist/${product._id}`, { data: { userId: localStorage.getItem('userId') } });
        
            const cartResponse = await cartAPI.getCart();

            setCartCount(
                cartResponse?.data?.items?.length || 0
            );

            alert('Added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64 bg-white flex items-center justify-center">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            No Image
          </div>
        )}

        <button
          onClick={() => api.delete(`/wishlist/${product._id}`, { data: { userId: localStorage.getItem('userId') } }).then(() => removeFromWishlist(product._id))}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm mt-1">
          {product.brand}
        </p>

        <div className="mt-3">
          <span className="text-xl font-bold">
            ₹{product.finalPrice?.toLocaleString()}
          </span>
        </div>

              <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                  <ShoppingCart className="w-4 h-4" />

                  {addingToCart
                      ? 'Adding...'
                      : product.stock === 0
                          ? 'Out Of Stock'
                          : 'Add To Cart'}
              </button>
      </div>
    </div>
  );
}