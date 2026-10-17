'use client';

import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to subscribe. Please try again.');
        return;
      }

      setSubscribed(true);
      setEmail('');
    } catch {
      setError('Unable to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-900 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-neutral-900">
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase tracking-tight">KXG</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-300">
            ALWAYS STAY FLY, NEVER FOLLOW
          </p>
          <p className="text-xs text-neutral-500 max-w-sm">
            Sign up to get notified about secret drops, early access codes, and exclusive releases.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
            Join the Inner Circle
          </h3>
          {subscribed ? (
            <p className="text-sm font-bold text-emerald-400">
              You&apos;re in. Watch your inbox for the next drop.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 flex-1"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
                {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-neutral-600 uppercase tracking-wider">
          © {new Date().getFullYear()} KXG. All rights reserved.
        </p>

        <div className="flex items-center space-x-6 text-xs font-bold uppercase tracking-widest text-neutral-400">
          <a
            href="https://www.instagram.com/fitby_kxg?igsi=MWR0bDhnMnBxZngwcQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://x.com/fitbykxg?s=11"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter / X
          </a>
          <a
            href="https://www.tiktok.com/@fitby_kxg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}