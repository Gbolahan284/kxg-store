'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
      setSuccessMessage(data.message || 'You are subscribed. Check your inbox for a welcome email.');
      setEmail('');
    } catch {
      setError('Unable to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-[#F5EED8] text-[#2C1509] border-t border-[#2C1509]/20 pt-16 pb-12 px-6">
      {/* Top Grid: Brand, Help, Legal, and Newsletter */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2C1509]/20">

        {/* Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <h2 className="text-4xl font-black uppercase tracking-tight text-[#2C1509]">KXG</h2>
          <p className="text-base font-black uppercase tracking-widest text-[#2C1509]">
            ALWAYS STAY FLY, NEVER FOLLOW
          </p>
          <p className="text-sm font-semibold text-[#2C1509]/85 max-w-sm leading-relaxed">
            Sign up to get notified about secret drops, early access codes, and exclusive releases.
          </p>
        </div>

        {/* HELP Column */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#2C1509] mb-4">
            HELP
          </h3>
          <ul className="space-y-3 text-sm font-extrabold font-mono uppercase text-[#2C1509]">
            <li>
              <Link href="/shipping" className="hover:text-[#2C1509]/70 transition-colors">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-[#2C1509]/70 transition-colors">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#2C1509]/70 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL Column */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#2C1509] mb-4">
            LEGAL
          </h3>
          <ul className="space-y-3 text-sm font-extrabold font-mono uppercase text-[#2C1509]">
            <li>
              <Link href="/privacy" className="hover:text-[#2C1509]/70 transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#2C1509]/70 transition-colors">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription Column */}
        <div className="md:col-span-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#2C1509] mb-4">
            Join the Inner Circle
          </h3>
          {subscribed ? (
            <p className="text-base font-black text-[#2C1509]">
              {successMessage}
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="bg-[#EDE2C4] border border-[#2C1509]/25 rounded-xl px-4 py-3.5 text-base font-bold text-[#2C1509] placeholder:text-[#2C1509]/60 focus:outline-none focus:border-[#2C1509] w-full"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2C1509] text-[#F5EED8] font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-[#3E1F0E] transition-colors disabled:opacity-50 w-full cursor-pointer"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
                {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar: Copyright and Socials */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-sm font-extrabold text-[#2C1509] uppercase tracking-wider">
          © {new Date().getFullYear()} KXG. All rights reserved.
        </p>

        <div className="flex items-center space-x-6 text-sm font-black uppercase tracking-widest text-[#2C1509]">
          <a
            href="https://www.instagram.com/fitby_kxg?igsi=MWR0bDhnMnBxZngwcQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#2C1509]/70 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://x.com/fitbykxg?s=11"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#2C1509]/70 transition-colors"
          >
            Twitter / X
          </a>
          <a
            href="https://www.tiktok.com/@fitby_kxg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#2C1509]/70 transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}