import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import Vercel Analytics
import { Analytics } from '@vercel/analytics/next';

// Import Cart system
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

// Import Layout Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Import 5-Second Timed Popup Modal
import TimedPopupModal from '@/components/TimedPopupModal';

const inter = Inter({ subsets: ['latin'] });

const LOGO_URL = 'https://res.cloudinary.com/rl3bynob/image/upload/v1792639178/photo_2026-08-04_12-46-34.jpg';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fitbykxg.com'),
  title: 'KXG — ALWAYS STAY FLY, NEVER FOLLOW',
  description: 'Official KXG Streetwear & Premium Legacy Jersey Collection.',
  keywords: [
    'KXG',
    'Fit by KXG',
    'fitbykxg',
    'fitbykxg.com',
    'KXG streetwear',
    'KXG clothing',
    'KXG store',
    'KXG official',
    'KGX', // Common typo/misspelling
    'KXG jersey',
  ],
  verification: {
    google: 'x6HO0VUgG8ExP3ba25kNp-I6NifXlaUsfEl_B4T1bc0', // Google Search Console Verification
  },
  icons: {
    icon: [
      { url: LOGO_URL, type: 'image/jpeg' },
      { url: LOGO_URL, sizes: '192x192', type: 'image/jpeg' },
    ],
    shortcut: LOGO_URL,
    apple: [
      { url: LOGO_URL, sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  openGraph: {
    title: 'KXG — ALWAYS STAY FLY, NEVER FOLLOW',
    description: 'Official KXG Streetwear & Premium Legacy Jersey Collection.',
    url: 'https://www.fitbykxg.com',
    siteName: 'KXG',
    images: [
      {
        url: LOGO_URL,
        width: 1200,
        height: 630,
        alt: 'KXG Brand Logo',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD Structured Data to establish Google Brand Authority & handle search typos
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: 'KXG',
    alternateName: ['Fit By KXG', 'fitbykxg', 'KXG Streetwear', 'KGX'],
    url: 'https://www.fitbykxg.com',
    logo: LOGO_URL,
    sameAs: [
      'https://www.instagram.com/fitbykxg', // Update or add other social media links here
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Explicit link tags for Google Search bot logo indexing */}
        <link rel="icon" href={LOGO_URL} />
        <link rel="apple-touch-icon" href={LOGO_URL} />

        {/* Google Knowledge Graph / Brand Association Script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {/* 5-Second Timed Lead Capture Modal */}
          <TimedPopupModal />
          <CartDrawer />
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}