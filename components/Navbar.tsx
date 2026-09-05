'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { openCart, cart } = useCart();
  
  // Calculate total number of items in cart
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b border-neutral-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img
            src="https://res.cloudinary.com/patkysps/image/upload/v1787616698/photo_2026-08-04_12-46-34_qqayio.jpg"
            alt="KXG Logo"
            className="h-10 w-auto object-contain mix-blend-screen"
          />
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-6">
          <Link 
            href="/admin" 
            className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            Admin
          </Link>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative bg-white text-black font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-all flex items-center gap-2"
            aria-label="Open Cart"
          >
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}