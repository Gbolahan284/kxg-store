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
    <main className="min-h-screen bg-[#F5EED8] text-[#2C1509]">
      <Hero />

      <section id="drops" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-[#2C1509]">
            Current Drop
          </h2>
          <span className="text-[11px] sm:text-xs text-[#2C1509]/75 font-semibold uppercase tracking-wide">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2C1509]/25 rounded-2xl">
            <p className="text-[#2C1509]/70 text-xs font-mono">No products found in this drop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12">
            {products.map((product: any) => {
              const productUrl =
                product.id && product.id.length > 0
                  ? product.id
                  : product.category || 'hoody';

              const cardContent = (
                <div className="flex flex-col">
                  {/* Rounded Product Image Card */}
                  <div className="relative aspect-[4/5] w-full rounded-2xl bg-[#EDE2C4] border border-[#2C1509]/10 overflow-hidden flex items-center justify-center p-3">
                    {/* Sharp Rectangular SOLD OUT Tag (Top-Left) */}
                    {!product.inStock && (
                      <div className="absolute top-3 left-3 z-10 bg-[#2C1509] text-[#F5EED8] text-[9px] sm:text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-md">
                        Sold Out
                      </div>
                    )}

                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-500 ease-out ${
                          product.inStock
                            ? 'group-hover:scale-105'
                            : 'blur-[2px] opacity-55'
                        }`}
                      />
                    )}
                  </div>

                  {/* Left-Aligned Heavy Bold Uppercase Title */}
                  <div className="mt-3.5 text-left">
                    <h3
                      className={`text-sm sm:text-base md:text-lg font-black uppercase tracking-tight leading-snug transition-colors [text-shadow:0_0.5px_0_currentColor] ${
                        product.inStock
                          ? 'text-[#2C1509] group-hover:text-[#2C1509]/70'
                          : 'text-[#2C1509]/50'
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