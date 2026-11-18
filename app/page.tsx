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
          /* Borderless Dark Gallery Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16 sm:gap-x-12 sm:gap-y-24">
            {products.map((product: any) => {
              const productUrl =
                product.id && product.id.length > 0
                  ? product.id
                  : product.category || 'hoody';

              const cardContent = (
                <>
                  {/* Floating Product Image Container (Borderless) */}
                  <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-500 ease-out ${
                          product.inStock ? 'group-hover:scale-105' : 'opacity-40 grayscale'
                        }`}
                      />
                    )}

                    {/* Sold Out Badge Overlay */}
                    {!product.inStock && (
                      <div className="absolute top-3 right-3 bg-neutral-900/90 text-neutral-400 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-neutral-800">
                        Sold Out
                      </div>
                    )}
                  </div>

                  {/* Minimal Streetwear Typography & Price */}
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white line-clamp-1 group-hover:text-neutral-300 transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-xs sm:text-sm font-mono text-neutral-400 shrink-0">
                      ₦{Number(product.price).toLocaleString()}
                    </span>
                  </div>
                </>
              );

              const cardStyles = 'group block text-center';

              if (product.inStock) {
                return (
                  <Link
                    key={productUrl}
                    href={`/product/${productUrl}`}
                    className={cardStyles}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={productUrl}
                  className={`${cardStyles} opacity-60 cursor-not-allowed`}
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