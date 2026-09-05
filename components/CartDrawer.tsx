'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart = [],
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal = 0,
  } = useCart() as any;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (closeCart) closeCart();
    router.push('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 text-white h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-wider">
            Your Bag ({cart.reduce((acc: number, i: any) => acc + i.quantity, 0)})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-neutral-400 hover:text-white text-xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-4">
                Your cart is currently empty
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item: any, idx: number) => (
              <div
                key={`${item.id}-${item.size || idx}`}
                className="flex gap-4 border-b border-neutral-900 pb-6"
              >
                <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm uppercase">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart && removeFromCart(item.id, item.size)}
                        className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {item.size && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Size: <span className="text-white font-bold">{item.size}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-bold">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <div className="flex items-center border border-neutral-800 rounded-lg">
                      <button
                        onClick={() => updateQuantity && updateQuantity(item.id, item.size, -1)}
                        className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity && updateQuantity(item.id, item.size, 1)}
                        className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-900/30 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 uppercase tracking-wider text-xs font-bold">
                Subtotal
              </span>
              <span className="text-lg font-black">₦{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}