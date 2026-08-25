import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Focusly 🌿',
  description: 'Aplicație de productivitate blândă și calmare pentru neurodivergență și ADHD.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Focusly',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="h-full">
      <body className="h-full bg-[#FAF8F5] text-[#2D312E] antialiased">
        {children}
      </body>
    </html>
  );
}
