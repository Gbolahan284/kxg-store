'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

const SIZES = ['M', 'L', 'XL', '2XL'];

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const [selectedSize, setSelectedSize] = useState('M');
  const { addToCart } = useCart();
  const router = useRouter();

  const displayPrice = product.price > 0 ? product.price : 40000;

  const handleAddToCart = () => {
    addToCart({
      id: product.id || 'hoody',
      name: product.name,
      price: displayPrice,
      image: product.image,
      size: selectedSize,
    });
  };

  const handleBuyNow = () => {
    // Pass single product data via URL query params to isolate checkout
    const query = new URLSearchParams({
      buyNow: 'true',
      id: product.id || '',
      name: product.name,
      price: displayPrice.toString(),
      size: selectedSize,
      image: product.image || '',
    }).toString();

    router.push(`/checkout?${query}`);
  };

  return (
    <div>
      {/* Size Selector */}
      <div className="border-t border-b border-neutral-800 py-6 my-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Select Size
        </h3>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`h-12 min-w-[48px] px-4 rounded-xl border font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${
                selectedSize === size
                  ? 'bg-white text-black border-white shadow-lg'
                  : 'border-neutral-800 text-neutral-400 bg-neutral-900 hover:border-neutral-600 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 active:scale-[0.99] transition-all cursor-pointer shadow-md text-sm"
        >
          Add to Cart • ₦{displayPrice.toLocaleString()}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full py-4 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-xl border border-neutral-800 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}