import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative w-full bg-black border-b border-neutral-800 flex items-center justify-center min-h-[55vh] sm:min-h-screen">
      {/* Background/Main Image */}
      <picture className="w-full h-full flex items-center justify-center">
        {/* Mobile: Use object-contain so all 4 models are fully visible */}
        <source
          media="(max-width: 640px)"
          srcSet="https://res.cloudinary.com/patkysps/image/upload/v1787616115/DSC_8160_htkhit.jpg"
        />
        {/* Desktop: Full-bleed cover */}
        <img
          src="https://res.cloudinary.com/patkysps/image/upload/v1787616115/DSC_8160_htkhit.jpg"
          alt="KXG Brand Banner"
          className="w-full h-auto max-h-[85vh] sm:max-h-none sm:h-full object-contain sm:object-cover object-center block"
        />
      </picture>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Centered Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-300 font-semibold mb-1">
          New Release
        </span>
        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase mb-2 bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent drop-shadow-md">
          KXG
        </h1>
        <p className="max-w-xs sm:max-w-xl mx-auto text-neutral-200 font-bold text-[10px] sm:text-lg uppercase tracking-widest mb-4 sm:mb-8 drop-shadow">
          ALWAYS STAY FLY, NEVER FOLLOW
        </p>
        <div>
          <Link
            href="#drops"
            className="px-5 py-2 sm:px-8 sm:py-3 bg-white text-black text-[11px] sm:text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Explore Drop
          </Link>
        </div>
      </div>
    </div>
  );
}