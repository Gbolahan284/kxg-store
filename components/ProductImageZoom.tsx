'use client';

import React, { useState } from 'react';

interface ProductImageZoomProps {
  images: string[];
  productName: string;
}

export default function ProductImageZoom({ images, productName }: ProductImageZoomProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {images.map((imgSrc, idx) => (
        <ZoomableImage 
          key={idx} 
          src={imgSrc} 
          alt={`${productName} view ${idx === 0 ? 'Front' : idx === 1 ? 'Back' : idx + 1}`} 
        />
      ))}
    </div>
  );
}

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, show: false }));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center p-4 min-h-[380px] cursor-zoom-in group"
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto object-contain transition-opacity duration-200 ${
          zoomPos.show ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Magnifying Zoom Lens Layer */}
      {zoomPos.show && (
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            backgroundSize: '250%',
          }}
        />
      )}
    </div>
  );
}