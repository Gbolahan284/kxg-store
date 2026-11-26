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
        className="fixed inset-0 bg-[#2C1509]/45 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#F5EED8] border-l border-[#2C1509]/15 text-[#2C1509] h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#2C1509]/15 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#2C1509]">
            Your Bag ({cart.reduce((acc: number, i: any) => acc + i.quantity, 0)})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-[#2C1509]/70 hover:text-[#2C1509] text-xl font-bold transition-colors cursor-pointer"
            aria-label="Close Cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-[#2C1509]/70 text-sm font-bold uppercase tracking-widest mb-4">
                Your cart is currently empty
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-[#2C1509] text-[#F5EED8] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#3E1F0E] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item: any, idx: number) => (
              <div
                key={`${item.id}-${item.size || idx}`}
                className="flex gap-4 border-b border-[#2C1509]/15 pb-6"
              >
                <div className="w-20 h-20 bg-[#EDE2C4] border border-[#2C1509]/15 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#2C1509]/60">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-sm uppercase text-[#2C1509]">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart && removeFromCart(item.id, item.size)}
                        className="text-xs font-semibold text-[#2C1509]/70 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    {item.size && (
                      <p className="text-xs text-[#2C1509]/75 mt-1">
                        Size: <span className="text-[#2C1509] font-black">{item.size}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-black text-[#2C1509]">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <div className="flex items-center bg-[#EDE2C4] border border-[#2C1509]/20 rounded-lg">
                      <button
                        onClick={() => updateQuantity && updateQuantity(item.id, item.size, -1)}
                        className="px-2.5 py-1 text-xs font-bold text-[#2C1509] hover:bg-[#2C1509]/10 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-black text-[#2C1509]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity && updateQuantity(item.id, item.size, 1)}
                        className="px-2.5 py-1 text-xs font-bold text-[#2C1509] hover:bg-[#2C1509]/10 transition-colors cursor-pointer"
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
          <div className="p-6 border-t border-[#2C1509]/15 bg-[#EDE2C4]/70 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#2C1509]/80 uppercase tracking-wider text-xs font-black">
                Subtotal
              </span>
              <span className="text-lg font-black text-[#2C1509]">₦{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] font-medium text-[#2C1509]/75">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#2C1509] text-[#F5EED8] font-black uppercase tracking-widest rounded-xl hover:bg-[#3E1F0E] transition-colors cursor-pointer"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}