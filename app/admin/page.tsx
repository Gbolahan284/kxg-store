'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  createProduct,
  updateProduct,
  verifyAdminPasscode,
  getProducts,
  getSubscribers,
  toggleStock,
  deleteProduct,
} from './actions';

interface Subscriber {
  id: string;
  email: string;
  createdAt: Date | string;
}

interface SizeStockItem {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image: string;
  hoverImage?: string | null;
  isFeatured?: boolean;
  inStock: boolean;
  sizes?: unknown;
  createdAt: Date | string;
}

const DEFAULT_SIZES: SizeStockItem[] = [
  { size: 'S', stock: 10 },
  { size: 'M', stock: 20 },
  { size: 'L', stock: 15 },
  { size: 'XL', stock: 5 },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeSizes(rawSizes: unknown): SizeStockItem[] {
  const base = ['S', 'M', 'L', 'XL'];
  const map = new Map<string, number>();

  if (Array.isArray(rawSizes)) {
    for (const entry of rawSizes) {
      if (isRecord(entry) && typeof entry.size === 'string') {
        map.set(entry.size.toUpperCase(), Math.max(0, Number(entry.stock) || 0));
      }
    }
  } else if (isRecord(rawSizes)) {
    for (const [key, val] of Object.entries(rawSizes)) {
      map.set(key.toUpperCase(), Math.max(0, Number(val) || 0));
    }
  }

  return base.map((sz) => ({
    size: sz,
    stock: map.has(sz) ? map.get(sz)! : 0,
  }));
}

// Small badges showing stock per size inside the inventory table
function SizeBadges({ sizes }: { sizes: unknown }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {normalizeSizes(sizes).map((s) => (
        <span
          key={s.size}
          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
            s.stock === 0
              ? 'border-red-800 text-red-400 line-through'
              : s.stock <= 3
              ? 'border-amber-700 text-amber-400'
              : 'border-neutral-700 text-neutral-300'
          }`}
        >
          {s.size}:{s.stock}
        </span>
      ))}
    </div>
  );
}

function formatDate(value: Date | string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'subscribers'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberError, setSubscriberError] = useState<string | null>(null);

  // --- EDIT MODE STATE ---
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [hoverImage, setHoverImage] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- SIZE INVENTORY STATE ---
  const [sizes, setSizes] = useState<SizeStockItem[]>(DEFAULT_SIZES.map((s) => ({ ...s })));

  const handleStockChange = (index: number, newStock: number) => {
    const updated = [...sizes];
    updated[index] = {
      ...updated[index],
      stock: Math.max(0, Number.isNaN(newStock) ? 0 : newStock),
    };
    setSizes(updated);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setName('');
    setCategory('');
    setPrice('');
    setImage('');
    setHoverImage('');
    setDescription('');
    setSizes(DEFAULT_SIZES.map((s) => ({ ...s })));
  };

  const handleSelectProductToEdit = (product: Product) => {
    setError(null);
    setSuccessMessage(null);
    setEditingProductId(product.id);
    setName(product.name || '');
    setCategory(product.category || '');
    setPrice(String(product.price ?? ''));
    setImage(product.image || '');
    setHoverImage(product.hoverImage || '');
    setDescription(product.description || '');
    setSizes(normalizeSizes(product.sizes));
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function loadProductsData() {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  // Subscribers now come from the protected server action (login required)
  async function loadSubscribersData() {
    setLoadingSubscribers(true);
    setSubscriberError(null);
    try {
      const list = await getSubscribers();

      const formatted: Subscriber[] = (list || []).map((sub, index) => ({
        id: sub.id || String(index),
        email: sub.email || 'N/A',
        createdAt: sub.createdAt || new Date().toISOString(),
      }));

      setSubscribers(formatted);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setSubscriberError('Failed to load subscribers. Please log in again and retry.');
    } finally {
      setLoadingSubscribers(false);
    }
  }

  function handleTabChange(tab: 'products' | 'inventory' | 'subscribers') {
    setActiveTab(tab);
    if (tab === 'inventory') {
      void loadProductsData();
    } else if (tab === 'subscribers') {
      void loadSubscribersData();
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    const res = await verifyAdminPasscode(passcode);
    if (res.success) {
      setIsAuthenticated(true);
      loadProductsData();
      loadSubscribersData();
    } else {
      setAuthError(res.error || 'Access denied.');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    const formData = new FormData();
    formData.set('name', name.trim());
    formData.set('category', category.trim());
    formData.set('price', price);
    formData.set('image', image.trim());
    formData.set('hoverImage', hoverImage.trim());
    formData.set('description', description);
    formData.set('sizes', JSON.stringify(sizes));

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, formData);
        setSuccessMessage('Product updated and saved to live store!');
      } else {
        await createProduct(formData);
        setSuccessMessage('Product created successfully and published to live drop!');
      }
      resetProductForm();
      await loadProductsData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : editingProductId
            ? 'Failed to update product.'
            : 'Failed to add product.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStock(productId: string, currentStatus: boolean) {
    setInventoryError(null);
    try {
      await toggleStock(productId, currentStatus);
      await loadProductsData();
    } catch (err) {
      console.error('Failed to toggle stock:', err);
      setInventoryError(
        'Could not change the stock status. If every size is at 0, add stock to a size first (click Edit).'
      );
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setInventoryError(null);
    try {
      await deleteProduct(productId);
      if (editingProductId === productId) {
        resetProductForm();
      }
      await loadProductsData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      setInventoryError('Could not delete the product. Please try again.');
    }
  }

  // --- PASSCODE LOCK SCREEN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="mb-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 block mb-1">
              Restricted Area
            </span>
            <h1 className="text-2xl font-black uppercase">KXG Admin Access</h1>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Unlock Dashboard
            </button>

            <div className="text-center mt-4">
              <Link href="/" className="text-xs text-neutral-500 hover:text-white transition-colors">
                ← Back to Storefront
              </Link>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // --- UNLOCKED ADMIN DASHBOARD ---
  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 block mb-1">
            Back-Office Dashboard
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">KXG Control</h1>
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors border border-neutral-800 px-4 py-2 rounded-xl bg-neutral-900/50"
        >
          ← View Store
        </Link>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => handleTabChange('products')}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-black'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          {editingProductId ? 'Edit Product' : 'Upload New Drop'}
        </button>

        <button
          onClick={() => handleTabChange('inventory')}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-white text-black'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <span>Manage Inventory</span>
          <span className="bg-neutral-800 text-neutral-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('subscribers')}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${
            activeTab === 'subscribers'
              ? 'bg-white text-black'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <span>Subscribers</span>
          <span className="bg-neutral-800 text-neutral-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRODUCT UPLOAD / EDIT */}
      {activeTab === 'products' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8">
          {editingProductId && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/70 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Editing Existing Product: <span className="text-white">{name || editingProductId}</span>
              </div>
              <button
                type="button"
                onClick={resetProductForm}
                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              >
                Cancel Edit (New Drop)
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm font-bold flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm font-bold flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. KXG OVERSIZED HOODIE"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. HOODIES / Drop 01"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Main Image URL *
                </label>
                <input
                  type="text"
                  name="image"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Hover Image URL (Optional)
                </label>
                <input
                  type="text"
                  name="hoverImage"
                  value={hoverImage}
                  onChange={(e) => setHoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            {/* --- SIZE INVENTORY FIELD --- */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Size Stock Quantities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sizes.map((item, idx) => (
                  <div
                    key={item.size}
                    className="flex items-center gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800"
                  >
                    <span className="text-white font-mono font-bold w-6">{item.size}:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => handleStockChange(idx, parseInt(e.target.value, 10) || 0)}
                      className="bg-neutral-900 text-white px-3 py-1 rounded-lg border border-neutral-700 w-full text-sm font-mono focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Heavyweight cotton construction. High density screen print..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {loading
                  ? editingProductId
                    ? 'Saving Changes...'
                    : 'Publishing Drop...'
                  : editingProductId
                  ? 'Save Product Changes'
                  : 'Publish Product to Store'}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="py-4 px-6 bg-neutral-900 text-neutral-300 border border-neutral-800 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-colors text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Current Inventory</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Click any product name or Edit to modify price, sizes, or details.
              </p>
            </div>
            <button
              onClick={loadProductsData}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              Refresh Items
            </button>
          </div>

          {inventoryError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm font-bold flex justify-between items-center gap-4">
              <span>{inventoryError}</span>
              <button onClick={() => setInventoryError(null)} className="text-red-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {loadingProducts ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Loading product list...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">No products found in database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500">
                    <th className="pb-3 px-2">Item</th>
                    <th className="pb-3 px-2">Price</th>
                    <th className="pb-3 px-2">Sizes</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-4 px-2 font-bold">
                        <button
                          type="button"
                          onClick={() => handleSelectProductToEdit(item)}
                          className="text-left font-bold text-white hover:underline cursor-pointer"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="py-4 px-2 text-neutral-400">₦{item.price.toLocaleString()}</td>
                      <td className="py-4 px-2">
                        <SizeBadges sizes={item.sizes} />
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            item.inStock
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSelectProductToEdit(item)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(item.id, item.inStock)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-colors"
                        >
                          {item.inStock ? 'Mark Sold Out' : 'Mark In Stock'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIBERS LIST */}
      {activeTab === 'subscribers' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight">VIP Mailing List</h2>
            <button
              onClick={loadSubscribersData}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              Refresh List
            </button>
          </div>

          {loadingSubscribers ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Loading subscriber database...</p>
          ) : subscriberError ? (
            <p role="alert" className="text-sm text-red-400 py-8 text-center">
              {subscriberError}
            </p>
          ) : subscribers.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">No subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500">
                    <th className="pb-3 px-2">Email Address</th>
                    <th className="pb-3 px-2 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-4 px-2 font-mono text-neutral-200">{sub.email}</td>
                      <td className="py-4 px-2 text-right text-xs text-neutral-500">
                        {formatDate(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}