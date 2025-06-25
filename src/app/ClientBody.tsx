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
  
  // 需要清爽背景的页面（不应用深色渐变）
  const cleanBackgroundPages = [
    '/labubu-gallery',
    '/dashboard', 
    '/wallpapers',
    '/秀场' // 秀场页面也可能有多图
  ];
  
  const shouldApplyHeroGradient = !cleanBackgroundPages.includes(pathname);

  const containerClasses = [
    geistSans.variable,
    geistMono.variable,
    'antialiased',
    shouldApplyHeroGradient ? 'hero-gradient' : 'bg-white',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}
