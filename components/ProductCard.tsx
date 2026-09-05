'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    mainImage: string;
    hoverImage?: string | null;
    isSoldOut?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasHoverImage = Boolean(product.hoverImage);

  return (
    <Link href={`/product/${product.slug}`} className="group block text-left">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 rounded-xl mb-3">
        {/* Main Image */}
        <Image
          src={product.mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-all duration-500 ease-in-out ${
            hasHoverImage 
              ? 'group-hover:opacity-0' 
              : 'group-hover:scale-105'
          }`}
        />

        {/* Hover Image (Only rendered if hoverImage exists) */}
        {hasHoverImage && (
          <Image
            src={product.hoverImage!}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105 absolute inset-0"
          />
        )}

        {/* Optional Sold Out Badge */}
        {product.isSoldOut && (
          <span className="absolute bottom-3 right-3 bg-neutral-200 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Sold out
          </span>
        )}
      </div>

      {/* Product Information */}
      <h3 className="text-xs font-black uppercase tracking-wider text-white">
        {product.name}
      </h3>
      <p className="text-xs font-semibold text-neutral-400 mt-1">
        ₦{product.price.toLocaleString()}
      </p>
    </Link>
  );
}