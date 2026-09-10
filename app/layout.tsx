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

export const metadata: Metadata = {
  title: 'KXG — ALWAYS STAY FLY, NEVER FOLLOW',
  description: 'Official KXG Brand Releases',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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