'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { Search, Plus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    brand: '',
    stock: '',
    images: '',
    isFeatured: false,
  });
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search: search.trim(),
        category: categoryFilter,
      };
      const response = await apiClient.get('/products', { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '0',
      category: categories[0]?._id || '',
      brand: '',
      stock: '',
      images: '',
      isFeatured: false,
    });
    setSubmitError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price?.toString(),
      discount: product.discount?.toString() || '0',
      category: product.category?._id || product.category || '',
      brand: product.brand,
      stock: product.stock?.toString(),
      images: product.images?.join(', ') || '',
      isFeatured: !!product.isFeatured,
    });
    setSubmitError('');
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    // Form validation
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || !formData.stock) {
      setSubmitError('Please fill in all required fields');
      setSubmitLoading(false);
      return;
    }

    const priceNum = parseFloat(formData.price);
    const discountNum = parseFloat(formData.discount || 0);
    const stockNum = parseInt(formData.stock);

    if (isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
      setSubmitError('Price and stock must be positive numbers');
      setSubmitLoading(false);
      return;
    }

    // Split images
    const imagesArray = formData.images
      .split(',')
      .map((img) => img.trim())
      .filter((img) => img !== '');

    const payload = {
      ...formData,
      price: priceNum,
      discount: discountNum,
      stock: stockNum,
      images: imagesArray.length > 0 ? imagesArray : undefined,
    };

    try {
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError(error.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timepiece?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Catalog</span>
          <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Products</h1>
        </div>
        <button
          onClick={openAddModal}
          className="luxury-btn-gold inline-flex items-center gap-2 self-start py-2.5 px-5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Timepiece
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search timepiece name, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="luxury-input pl-10 pr-16 py-2.5 text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--clx-black)] text-white text-xs rounded hover:bg-[var(--clx-charcoal)] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="luxury-select py-2.5 pl-10 pr-10 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-[var(--clx-text-secondary)]">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--clx-surface)] border-b border-[var(--clx-border-light)] text-[10px] font-semibold tracking-wider text-[var(--clx-text-secondary)] uppercase">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Brand</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price (Final)</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clx-border-light)] text-sm text-[var(--clx-text-primary)]">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-[var(--clx-surface)]/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--clx-surface)] rounded overflow-hidden flex items-center justify-center flex-shrink-0 border border-[var(--clx-border-light)]">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />
                        ) : (
                          <span className="text-[8px] text-[var(--clx-text-muted)]">No Img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-xs">{product.name}</p>
                        {product.isFeatured && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 text-[8px] font-bold tracking-wider uppercase rounded">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{product.brand}</td>
                    <td className="py-4 px-6 text-[var(--clx-text-secondary)]">
                      {product.category?.name || product.category || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">₹{product.finalPrice?.toLocaleString()}</div>
                      {product.discount > 0 && (
                        <div className="text-[10px] text-red-500 font-medium">-{product.discount}% OFF</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        product.stock === 0 ? 'bg-red-50 text-red-700' :
                        product.stock < 10 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-[var(--clx-text-secondary)] hover:text-[var(--clx-gold)] transition-colors rounded hover:bg-[var(--clx-surface)]"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-1.5 text-[var(--clx-text-secondary)] hover:text-red-600 transition-colors rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--clx-border-light)] px-6 py-4">
            <span className="text-xs text-[var(--clx-text-secondary)]">
              Showing page <span className="font-semibold text-[var(--clx-text-primary)]">{page}</span> of {totalPages} ({totalProducts} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-[var(--clx-border)] rounded-lg hover:border-[var(--clx-gold)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in border border-[var(--clx-border-light)]">
            <div className="p-6 border-b border-[var(--clx-border-light)] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-serif text-xl font-semibold text-[var(--clx-text-primary)]">
                {editingProduct ? 'Edit Timepiece' : 'Add New Timepiece'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-[var(--clx-surface)]">
                <X className="w-5 h-5 text-[var(--clx-text-secondary)]" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="luxury-input text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    className="luxury-input text-sm py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="luxury-input text-sm py-2 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="luxury-input text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleFormChange}
                    className="luxury-input text-sm py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    className="luxury-input text-sm py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="luxury-select text-sm py-2"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded border-[var(--clx-border)] accent-[var(--clx-gold)]"
                    />
                    <span className="text-xs font-semibold text-[var(--clx-text-secondary)] uppercase tracking-wider">Featured Product</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Image URLs (comma separated)</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleFormChange}
                  placeholder="https://image1.com, https://image2.com"
                  className="luxury-input text-sm py-2"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--clx-border-light)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[var(--clx-border)] rounded-lg text-xs font-medium uppercase tracking-wider hover:bg-[var(--clx-surface)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="luxury-btn-gold px-6 py-2.5 text-xs"
                >
                  {submitLoading ? 'Saving...' : 'Save Timepiece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
