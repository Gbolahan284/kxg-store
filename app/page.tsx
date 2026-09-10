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

      <section id="drops" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black tracking-wider uppercase text-white">
            Current Drop
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'} AVAILABLE
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-500">No products found in this drop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
                          <div className="absolute top-3 right-3 bg-neutral-200/90 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Sold Out
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {product.category || 'Drop 01'}
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-white">{product.name}</h3>
                      <p className="text-neutral-400 text-sm mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between mt-4">
                    <span className="text-lg font-black text-white">
                      ₦{Number(product.price).toLocaleString()}
                    </span>

                    {/* Action Button */}
                    {product.inStock ? (
                      <span className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg group-hover:bg-neutral-200 transition-colors">
                        View Item
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-neutral-800 text-neutral-500 text-xs font-bold uppercase tracking-wider rounded-lg cursor-not-allowed">
                        Sold Out
                      </span>
                    )}
                  </div>
                </>
              );

              const cardStyles =
                'border border-neutral-800/80 rounded-2xl overflow-hidden bg-neutral-900/40 transition-all duration-300 flex flex-col justify-between';

              // 2. If in stock, render standard Link. If sold out, render unclickable div.
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