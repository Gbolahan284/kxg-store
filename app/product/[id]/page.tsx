import { db } from '@/lib/db';
import Link from 'next/link';
import AddToCartSection from '@/components/AddToCartSection';
import ProductImageZoom from '@/components/ProductImageZoom';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch product from DB
  let product = await db.product.findFirst({
    where: id && id !== 'test-id' && id !== 'hoody' 
      ? { OR: [{ id }, { name: id }, { category: id }] }
      : {},
  });

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white p-12 max-w-4xl mx-auto">
        <Link href="/" className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white mb-8 block">
          ← Back to Drops
        </Link>
        <div className="border border-neutral-800 p-8 rounded-2xl bg-neutral-900/40 text-center">
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <p className="text-neutral-400 text-sm">No products exist in your database table yet.</p>
        </div>
      </main>
    );
  }

  // Combines Main Image (Front) and Hover Image (Back) from your Prisma schema
  const productImages: string[] = [
    product.image,
    product.hoverImage || product.image,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Top Banner Announcement */}
      <div className="w-full bg-neutral-900 text-neutral-300 border-b border-neutral-800 text-[11px] font-bold tracking-wider text-center py-2 uppercase">
        PLEASE READ ALL POLICIES BEFORE PURCHASE
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Navigation / Back link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Side: Front & Back Interactive Zoom Gallery */}
          <div className="lg:col-span-7">
            {productImages.length > 0 ? (
              <ProductImageZoom images={productImages} productName={product.name} />
            ) : (
              <div className="aspect-square bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center text-neutral-500 font-medium text-sm">
                No Image Available
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Actions */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                {product.name}
              </h1>
              <p className="text-lg font-bold text-neutral-300 mt-2">
                ₦{product.price.toLocaleString()}.00
              </p>
            </div>

            {/* Size Guide Link */}
            <div>
              <button 
                type="button" 
                className="text-xs font-semibold text-neutral-400 hover:text-white hover:underline flex items-center gap-1 transition-colors"
              >
                SIZE GUIDE
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            {/* Interactive Add to Cart Component */}
            <AddToCartSection 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || undefined,
              }} 
            />

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Description
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}