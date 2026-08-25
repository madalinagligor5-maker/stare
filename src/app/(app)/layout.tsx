import React from 'react';
import { Navigation } from '../../components/Navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen">
      {/* Sidebar / Bottom Navigation */}
      <Navigation />
      
      {/* Main app content wrapper */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-6 min-h-screen">
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
