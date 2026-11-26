import { db } from '@/lib/db';
import Link from 'next/link';
import AddToCartSection from '@/components/AddToCartSection';
import ProductImageZoom from '@/components/ProductImageZoom';
import { parseSizesToMap } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch product from DB
  const product = await db.product.findFirst({
    where:
      id && id !== 'test-id' && id !== 'hoody'
        ? { OR: [{ id }, { name: id }, { category: id }] }
        : {},
  });

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F5EED8] text-[#2C1509] p-12 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-wider text-[#2C1509]/75 hover:text-[#2C1509] mb-8 block"
        >
          ← Back to Drops
        </Link>
        <div className="border border-[#2C1509]/20 p-8 rounded-2xl bg-[#EDE2C4] text-center">
          <h2 className="text-xl font-black uppercase mb-2 text-[#2C1509]">Product Not Found</h2>
          <p className="text-[#2C1509]/75 text-sm font-medium">
            No products exist in your database table yet.
          </p>
        </div>
      </main>
    );
  }

  // Combines Main Image (Front) and Hover Image (Back) from your Prisma schema
  const productImages: string[] = [
    product.image,
    product.hoverImage || product.image,
  ].filter(Boolean) as string[];

  const parsedSizes = parseSizesToMap(product.sizes);

  return (
    <div className="min-h-screen bg-[#F5EED8] text-[#2C1509] font-sans">
      {/* Top Banner Announcement */}
      <div className="w-full bg-[#EDE2C4] text-[#2C1509] border-b border-[#2C1509]/15 text-[11px] font-black tracking-wider text-center py-2 uppercase">
        PLEASE READ ALL POLICIES BEFORE PURCHASE
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Navigation / Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-black uppercase tracking-wider text-[#2C1509]/80 hover:text-[#2C1509] transition-colors"
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
              <div className="aspect-square bg-[#EDE2C4] border border-[#2C1509]/15 rounded-2xl flex items-center justify-center text-[#2C1509]/60 font-bold text-sm">
                No Image Available
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Actions */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#2C1509]">
                {product.name}
              </h1>
              <p className="text-lg font-black text-[#2C1509] mt-2">
                ₦{product.price.toLocaleString()}.00
              </p>
            </div>

            {/* Interactive Add to Cart Component */}
            <AddToCartSection
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || undefined,
                sizes: Object.entries(parsedSizes).map(([size, stock]) => ({ size, stock })),
                inStock: product.inStock,
              }}
            />

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-[#2C1509]/25">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#2C1509] mb-3 [text-shadow:0_0.5px_0_currentColor]">
                  Description
                </h3>
                <p className="text-[#2C1509] font-extrabold text-base sm:text-lg leading-relaxed [text-shadow:0_0.3px_0_currentColor]">
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