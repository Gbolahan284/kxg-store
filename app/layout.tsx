import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
  title: {
    default: 'KXG — ALWAYS STAY FLY, NEVER FOLLOW | Official Store',
    template: '%s | KXG',
  },
  description:
    'Shop KXG (Fit by KXG) — Official KXG Streetwear & Premium Legacy Jersey Collection. Exclusive streetwear drops, hoodies, tees, and limited releases. Always stay fly, never follow.',
  keywords: [
    'KXG',
    'Fit by KXG',
    'fitbykxg',
    'fitbykxg.com',
    'KXG streetwear',
    'KXG clothing',
    'KXG store',
    'KXG official',
    'KGX',
    'KXG jersey',
  ],
  verification: {
    google: 'x6HO0VUgG8ExP3ba25kNp-I6NifXlaUsfEl_B4T1bc0',
    other: {
      'msvalidate.01': 'E018CE3E7C2E2462F92E1BB6A864A499',
    },
  },
  alternates: {
    canonical: 'https://www.fitbykxg.com',
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
    description:
      'Official KXG online store. Shop exclusive streetwear drops and our Premium Legacy Jersey Collection.',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: 'KXG',
    alternateName: ['Fit By KXG', 'fitbykxg', 'KXG Streetwear', 'KGX'],
    url: 'https://www.fitbykxg.com',
    logo: LOGO_URL,
    sameAs: [
      'https://www.instagram.com/fitbykxg',
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

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1351505226986579');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1351505226986579&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <TimedPopupModal />
          <CartDrawer />
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}