'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { openCart, cart } = useCart();
  
  // Check if the current route is an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
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
          {/* Cart Button - Hidden on Admin Pages */}
          {!isAdminPage && (
            <button
              onClick={openCart}
              className="relative bg-white text-black p-2.5 sm:px-4 sm:py-2.5 rounded-full hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              aria-label="Open Cart"
            >
              {/* Lucide Shopping Bag Icon */}
              <ShoppingBag className="w-5 h-5 stroke-[2]" />

              {/* Dynamic Item Counter Badge */}
              {itemCount > 0 && (
                <span className="bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}