'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getSizeStock, parseSizesToMap } from '@/lib/inventory';

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    sizes?: unknown;
    inStock?: boolean;
  };
}

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL'];

const SIZE_CHART = [
  { size: 'M', chest: '40 - 42"', length: '29"', shoulder: '18.5"' },
  { size: 'L', chest: '42 - 44"', length: '30"', shoulder: '19.5"' },
  { size: 'XL', chest: '44 - 46"', length: '31"', shoulder: '20.5"' },
  { size: '2XL', chest: '46 - 48"', length: '32"', shoulder: '21.5"' },
];

type PixelParams = Record<string, string | number | string[]>;

function trackPixel(eventName: string, params: PixelParams) {
  if (typeof window === 'undefined') return;

  const pixel = (window as Window & {
    fbq?: (action: string, eventName: string, params: PixelParams) => void;
  }).fbq;
  pixel?.('track', eventName, params);
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const sizeStock = parseSizesToMap(product.sizes);
  const sizes = [
    ...SIZE_ORDER.filter((size) => size in sizeStock),
    ...Object.keys(sizeStock).filter((size) => !SIZE_ORDER.includes(size)),
  ];
  const displaySizes = sizes.length > 0 ? sizes : SIZE_ORDER;

  const getSizeQty = (size: string): number => {
    return product.inStock === false ? 0 : getSizeStock(sizeStock, size);
  };

  const firstAvailableSize = displaySizes.find((size) => getSizeQty(size) > 0) ?? '';

  const [selectedSize, setSelectedSize] = useState<string>(firstAvailableSize);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const activeSelectedSize =
    selectedSize && getSizeQty(selectedSize) > 0 ? selectedSize : firstAvailableSize;

  const { addToCart } = useCart();
  const router = useRouter();

  const displayPrice = product.price > 0 ? product.price : 40000;
  const isAnySizeAvailable = Boolean(firstAvailableSize);
  const canSubmit =
    isAnySizeAvailable && Boolean(activeSelectedSize) && getSizeQty(activeSelectedSize) > 0;

  const handleAddToCart = () => {
    if (!canSubmit) return;

    // Fire Meta Pixel AddToCart Event
    trackPixel('AddToCart', {
      content_name: product.name,
      content_ids: [product.id || 'hoody'],
      content_type: 'product',
      value: displayPrice,
      currency: 'NGN',
    });

    addToCart({
      id: product.id || 'hoody',
      name: product.name,
      price: displayPrice,
      image: product.image,
      size: activeSelectedSize,
    });
  };

  const handleBuyNow = () => {
    if (!canSubmit) return;

    // Fire Meta Pixel InitiateCheckout Event for Buy Now
    trackPixel('InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.id || 'hoody'],
      content_type: 'product',
      value: displayPrice,
      currency: 'NGN',
    });

    const query = new URLSearchParams({
      buyNow: 'true',
      id: product.id || '',
      name: product.name,
      price: displayPrice.toString(),
      size: activeSelectedSize,
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
          {displaySizes.map((size) => {
            const isOutOfStock = getSizeQty(size) <= 0;
            const isSelected = !isOutOfStock && activeSelectedSize === size;

            return (
              <button
                key={size}
                type="button"
                disabled={isOutOfStock}
                aria-disabled={isOutOfStock}
                onClick={() => {
                  if (!isOutOfStock) setSelectedSize(size);
                }}
                className={`h-12 min-w-[48px] px-4 rounded-xl border font-bold text-sm flex items-center justify-center transition-all ${
                  isOutOfStock
                    ? 'line-through opacity-40 cursor-not-allowed border-neutral-800 bg-neutral-950 text-neutral-500'
                    : isSelected
                    ? 'bg-white text-black border-white shadow-lg cursor-pointer'
                    : 'border-neutral-800 text-neutral-400 bg-neutral-900 hover:border-neutral-600 hover:text-white cursor-pointer'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-8">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleAddToCart}
          className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all text-sm ${
            canSubmit
              ? 'bg-white text-black hover:bg-neutral-200 active:scale-[0.99] cursor-pointer shadow-md'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {canSubmit
            ? `Add to Cart • ₦${displayPrice.toLocaleString()}`
            : 'Sold Out'}
        </button>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleBuyNow}
          className={`w-full py-4 font-black uppercase tracking-widest rounded-xl border transition-all text-sm ${
            canSubmit
              ? 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800 active:scale-[0.99] cursor-pointer'
              : 'bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed'
          }`}
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
                  {SIZE_CHART.map((row) => {
                    const rowOutOfStock = getSizeQty(row.size) <= 0;

                    return (
                      <tr
                        key={row.size}
                        onClick={() => {
                          if (rowOutOfStock) return;
                          setSelectedSize(row.size);
                          setIsSizeGuideOpen(false);
                        }}
                        className={`transition-colors ${
                          rowOutOfStock
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-neutral-900 cursor-pointer'
                        }`}
                      >
                        <td
                          className={`py-3 px-3 font-bold ${
                            rowOutOfStock ? 'line-through text-neutral-500' : 'text-white'
                          }`}
                        >
                          {row.size}
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{row.chest}</td>
                        <td className="py-3 px-3 text-neutral-300">{row.length}</td>
                        <td className="py-3 px-3 text-neutral-300">{row.shoulder}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <p>Click any available row to select that size.</p>
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