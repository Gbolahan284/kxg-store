'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  createProduct, 
  verifyAdminPasscode, 
  getProducts, 
  toggleStock, 
  deleteProduct 
} from './actions';

interface Subscriber {
  id: string;
  email: string;
  createdAt: Date | string;
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
  createdAt: Date | string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'subscribers'>('products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProductsData() {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts((data as any) || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  // --- SAFELY FETCH AND PARSE SUBSCRIBERS ---
  async function loadSubscribersData() {
    setLoadingSubscribers(true);
    try {
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      
      // Handle array or object payloads safely ({ subscribers: [...] } vs [...])
      const list = Array.isArray(data) ? data : (data.subscribers || data.data || []);

      const formatted: Subscriber[] = list.map((sub: any, index: number) => ({
        id: sub.id || String(index),
        email: typeof sub === 'string' ? sub : (sub.email || 'N/A'),
        createdAt: typeof sub === 'object' && sub !== null 
          ? (sub.createdAt || sub.date || sub.timestamp || new Date().toISOString()) 
          : new Date().toISOString(),
      }));
      
      setSubscribers(formatted);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setSubscribers([]);
    } finally {
      setLoadingSubscribers(false);
    }
  }

  // Auto-fetch data when switching tabs while authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'inventory') {
        loadProductsData();
      } else if (activeTab === 'subscribers') {
        loadSubscribersData();
      }
    }
  }, [activeTab, isAuthenticated]);

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
    setSuccess(false);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createProduct(formData);
      setSuccess(true);
      (event.target as HTMLFormElement).reset();
      loadProductsData();
    } catch (err: any) {
      setError(err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStock(productId: string, currentStatus: boolean) {
    try {
      await toggleStock(productId, currentStatus);
      await loadProductsData();
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      await loadProductsData();
    } catch (err) {
      console.error('Failed to delete product:', err);
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
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-black'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          Upload New Drop
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
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
          onClick={() => setActiveTab('subscribers')}
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

      {/* TAB 1: PRODUCT UPLOAD */}
      {activeTab === 'products' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm font-bold flex justify-between items-center">
              <span>Product created successfully and published to live drop!</span>
              <button onClick={() => setSuccess(false)} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm font-bold flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
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
                  placeholder="50000"
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
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Heavyweight cotton construction. High density screen print..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing Drop...' : 'Publish Product to Store'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight">Current Inventory</h2>
            <button
              onClick={loadProductsData}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              Refresh Items
            </button>
          </div>

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
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-4 px-2 font-bold">{item.name}</td>
                      <td className="py-4 px-2 text-neutral-400">₦{item.price.toLocaleString()}</td>
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
                      <td className="py-4 px-2 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStock(item.id, item.inStock)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-colors"
                        >
                          {item.inStock ? 'Mark Sold Out' : 'Mark In Stock'}
                        </button>
                        <button
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
                        {typeof sub.createdAt === 'string' ? sub.createdAt : new Date(sub.createdAt).toLocaleDateString()}
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