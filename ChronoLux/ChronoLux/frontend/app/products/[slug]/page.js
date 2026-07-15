'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store';
import { Star, Plus, Minus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { slug } = params;
  const { isAuthenticated } = useAuthStore();
  const { setCartCount } = useCartStore();
  const { setWishlistCount } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProduct(slug);
      console.log("🚀 ~ fetchProduct ~ response:", response)
      setProduct(response.data.product);
      setRelatedProducts(response.data.relatedProducts || []);
      if (response.data.product.images && response.data.product.images.length > 0) {
        setSelectedImage(0);
      }
      fetchReviews(response.data.product._id);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await reviewsAPI.getProductReviews(productId);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (product.stock < quantity) {
      alert('Insufficient stock');
      return;
    }

    setAddingToCart(true);
    try {
      console.log('Adding to cart:', { productId: product._id, quantity });
      await api.post('/cart/items',{ productId: product._id, quantity })
      // Update cart count
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

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setAddingToWishlist(true);
    try {
      await wishlistAPI.addToWishlist({
        productId: product._id,
      });

      // Update wishlist count
      const wishlistResponse = await wishlistAPI.getWishlist();
      setWishlistCount(wishlistResponse.data.products?.length || 0);

      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="relative h-96 bg-white">
              {product.images && product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                  No Image
                </div>
              )}
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.brand}</p>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating || 0} out of 5 ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.discount > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">₹{product.finalPrice.toLocaleString()}</span>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="text-red-600 font-semibold">Save {product.discount}%</span>
                
              </div>
            ) : (
              <span className="text-3xl font-bold">₹{product.finalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 10 ? (
              <p className="text-green-600">In Stock</p>
            ) : product.stock > 0 ? (
              <p className="text-orange-600">Only {product.stock} items left</p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity:</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border rounded-md hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 border rounded-md hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              className="p-3 border rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 border rounded-md hover:bg-gray-100">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <Truck className="w-6 h-6 mb-2" />
              <span className="text-xs text-center">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-xs text-center">2 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <RotateCcw className="w-6 h-6 mb-2" />
              <span className="text-xs text-center">30 Day Returns</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-600'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'specifications'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-600'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-600'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="py-4">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  {product.specifications ? (
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="font-medium">{key}</dt>
                          <dd className="text-gray-600">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-gray-600">No specifications available</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">{review.user?.name}</span>
                          </div>
                          {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct._id}
                href={`/products/${relatedProduct.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-white flex items-center justify-center">
                  {relatedProduct.images && relatedProduct.images[0] ? (
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{relatedProduct.name}</h3>
                  <p className="text-gray-600 text-sm">{relatedProduct.brand}</p>
                  <p className="font-bold mt-2">₹{relatedProduct.finalPrice.toLocaleString()}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}