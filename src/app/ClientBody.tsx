"use client";

import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGalleryPage = pathname === '/labubu-gallery';

  const containerClasses = [
    geistSans.variable,
    geistMono.variable,
    'antialiased',
    !isGalleryPage ? 'hero-gradient' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}
