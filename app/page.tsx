import { db } from '@/lib/db';
import Hero from '@/components/Hero';
import Link from 'next/link';

export default async function Home() {
  const products = await db.product.findMany();

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
              // Fix: If product.id is empty (""), fallback to category ("hoody")
              const productUrl = product.id && product.id.length > 0 ? product.id : (product.category || 'hoody');

              return (
                <Link
                  key={productUrl}
                  href={`/product/${productUrl}`}
                  className="group border border-neutral-800/80 rounded-2xl overflow-hidden bg-neutral-900/40 hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {product.image && (
                      <div className="relative aspect-square w-full bg-neutral-800 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
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
                    <span className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg group-hover:bg-neutral-200 transition-colors">
                      View Item
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}