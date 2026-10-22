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

const inter = Inter({ subsets: ['latin'] });

const LOGO_URL = 'https://res.cloudinary.com/rl3bynob/image/upload/v1792639178/photo_2026-08-04_12-46-34.jpg';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fitbykxg.com'),
  title: 'KXG — ALWAYS STAY FLY, NEVER FOLLOW',
  description: 'Official KXG Streetwear & Premium Legacy Jersey Collection.',
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
  return (
    <html lang="en">
      <head>
        {/* Explicit link tags for Google Search bot logo indexing */}
        <link rel="icon" href={LOGO_URL} />
        <link rel="apple-touch-icon" href={LOGO_URL} />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}