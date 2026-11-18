import { db } from '@/lib/db';
import Hero from '@/components/Hero';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />

      <section id="drops" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        {/* Minimal Section Header */}
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <h2 className="text-sm sm:text-base font-black tracking-widest uppercase text-white">
            Current Drop
          </h2>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-900 rounded-2xl">
            <p className="text-neutral-500 text-xs font-mono">No products found in this drop.</p>
          </div>
        ) : (
          /* md:grid-cols-4 gives you the 4-column desktop layout */
          <div className="grid grid-cols-2 md:grid-cols-4 items-end gap-x-6 gap-y-16 sm:gap-x-10 sm:gap-y-24">
            {products.map((product: any) => {
              const productUrl =
                product.id && product.id.length > 0
                  ? product.id
                  : product.category || 'hoody';

              const cardContent = (
                <div className="relative pt-6 flex flex-col items-center">
                  {/* Sharp Rectangular SOLD OUT Tag (Top-Left) */}
                  {!product.inStock && (
                    <div className="absolute top-0 left-0 z-10 bg-white text-black text-[9px] sm:text-[10px] font-black px-2.5 py-1 uppercase tracking-widest">
                      Sold Out
                    </div>
                  )}

                  {/* Free-Form Floating Garment */}
                  <div className="w-full flex items-end justify-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full max-h-[300px] object-contain transition-transform duration-500 ease-out ${
                          product.inStock
                            ? 'group-hover:scale-105'
                            : 'blur-[2px] opacity-60'
                        }`}
                      />
                    )}
                  </div>

                  {/* Bold Centered Wide Uppercase Title */}
                  <div className="mt-5 px-2 text-center w-full">
                    <h3
                      className={`text-xs sm:text-sm font-black uppercase tracking-[0.14em] scale-x-110 leading-snug transition-colors ${
                        product.inStock
                          ? 'text-white group-hover:text-neutral-300'
                          : 'text-neutral-500'
                      }`}
                    >
                      {product.name}
                    </h3>
                  </div>
                </div>
              );

              if (product.inStock) {
                return (
                  <Link
                    key={productUrl}
                    href={`/product/${productUrl}`}
                    className="group block"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={productUrl}
                  aria-disabled="true"
                  className="block cursor-not-allowed select-none"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}