import { db } from '@/lib/db';
import Hero from '@/components/Hero';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch ALL products (including sold-out items)
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-black">
      <Hero />

      <section id="drops" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white">
            Current Drop
          </h2>
          <span className="text-[10px] sm:text-xs text-neutral-400 font-mono">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'} AVAILABLE
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-500">No products found in this drop.</p>
          </div>
        ) : (
          /* Updated grid-cols-2 for Mobile (2 items side-by-side) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
            {products.map((product: any) => {
              const productUrl =
                product.id && product.id.length > 0
                  ? product.id
                  : product.category || 'hoody';

              const cardContent = (
                <>
                  <div>
                    {product.image && (
                      <div className="relative aspect-square w-full bg-neutral-800 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            product.inStock ? 'group-hover:scale-105' : 'opacity-60'
                          }`}
                        />
                        {/* Sold Out Overlay Badge */}
                        {!product.inStock && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-neutral-200/90 text-black text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Sold Out
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3 sm:p-5">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {product.category || 'Drop 01'}
                      </span>
                      <h3 className="text-sm sm:text-xl font-bold mt-0.5 sm:mt-1 text-white line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mt-2 sm:mt-4">
                    <span className="text-sm sm:text-lg font-black text-white">
                      ₦{Number(product.price).toLocaleString()}
                    </span>

                    {/* Action Button */}
                    {product.inStock ? (
                      <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg group-hover:bg-neutral-200 transition-colors text-center">
                        View Item
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-800 text-neutral-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg cursor-not-allowed text-center">
                        Sold Out
                      </span>
                    )}
                  </div>
                </>
              );

              const cardStyles =
                'border border-neutral-800/80 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900/40 transition-all duration-300 flex flex-col justify-between';

              if (product.inStock) {
                return (
                  <Link
                    key={productUrl}
                    href={`/product/${productUrl}`}
                    className={`${cardStyles} group hover:border-neutral-700`}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={productUrl}
                  className={`${cardStyles} opacity-80 cursor-not-allowed`}
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