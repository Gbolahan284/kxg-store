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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Select Size
          </h3>
          
          {/* Size Guide Trigger Link */}
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white underline underline-offset-4 flex items-center gap-1 transition-colors"
          >
            Size Guide ↗
          </button>
        </div>

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
      <div className="space-y-3 mb-8">
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

      {/* Accordion Sections */}
      <div className="border-t border-neutral-800">
        {/* Delivery Information Dropdown */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
            className="w-full flex items-center justify-between text-left font-black uppercase tracking-wider text-sm sm:text-base hover:text-neutral-300 transition-colors"
          >
            <span>Delivery Information</span>
            <span
              className="text-xs transition-transform duration-200"
              style={{ transform: isDeliveryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>

          {isDeliveryOpen && (
            <div className="mt-4 space-y-4 text-xs font-mono text-neutral-400 leading-relaxed animate-fadeIn">
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-1">
                  Delivery Timelines
                </h4>
                <p>
                  Shipping of products may vary from 12 to 15 business days depending on the
                  product and your location.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-1">
                  Customs & Import Duties
                </h4>
                <p>
                  All customers outside Nigeria are responsible for any custom fees, duties, or
                  taxes that may be charged by their country for import.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-neutral-800 text-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider">
                  Size Guide & Measurements
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  All measurements are in inches
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Size Chart Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest</th>
                    <th className="py-2.5 px-3">Length</th>
                    <th className="py-2.5 px-3">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  <tr
                    onClick={() => {
                      setSelectedSize('M');
                      setIsSizeGuideOpen(false);
                    }}
                    className="hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-white">M</td>
                    <td className="py-3 px-3 text-neutral-300">40 - 42"</td>
                    <td className="py-3 px-3 text-neutral-300">29"</td>
                    <td className="py-3 px-3 text-neutral-300">18.5"</td>
                  </tr>
                  <tr
                    onClick={() => {
                      setSelectedSize('L');
                      setIsSizeGuideOpen(false);
                    }}
                    className="hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-white">L</td>
                    <td className="py-3 px-3 text-neutral-300">42 - 44"</td>
                    <td className="py-3 px-3 text-neutral-300">30"</td>
                    <td className="py-3 px-3 text-neutral-300">19.5"</td>
                  </tr>
                  <tr
                    onClick={() => {
                      setSelectedSize('XL');
                      setIsSizeGuideOpen(false);
                    }}
                    className="hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-white">XL</td>
                    <td className="py-3 px-3 text-neutral-300">44 - 46"</td>
                    <td className="py-3 px-3 text-neutral-300">31"</td>
                    <td className="py-3 px-3 text-neutral-300">20.5"</td>
                  </tr>
                  <tr
                    onClick={() => {
                      setSelectedSize('2XL');
                      setIsSizeGuideOpen(false);
                    }}
                    className="hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-white">2XL</td>
                    <td className="py-3 px-3 text-neutral-300">46 - 48"</td>
                    <td className="py-3 px-3 text-neutral-300">32"</td>
                    <td className="py-3 px-3 text-neutral-300">21.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <p>Click any row to select that size.</p>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="bg-white text-black font-bold uppercase tracking-wider px-4 py-2 rounded-xl text-xs hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}