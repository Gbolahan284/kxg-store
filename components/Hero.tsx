import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative w-full bg-black border-b border-neutral-800 flex items-center justify-center h-[60vh] sm:h-screen overflow-hidden">
      {/* Background/Main Image */}
      <picture className="absolute inset-0 w-full h-full">
        {/* Mobile View: Adjust focal point to focus on models */}
        <source
          media="(max-width: 640px)"
          srcSet="https://res.cloudinary.com/rl3bynob/image/upload/v1792352721/WhatsApp_Image_2026-10-18_at_8.00.56_PM.jpg"
        />
        {/* Desktop View */}
        <img
          src="https://res.cloudinary.com/rl3bynob/image/upload/v1792352721/WhatsApp_Image_2026-10-18_at_8.00.56_PM.jpg"
          alt="KXG Brand Banner"
          className="w-full h-full object-cover object-[center_35%] sm:object-center block"
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