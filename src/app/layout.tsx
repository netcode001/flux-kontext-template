import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { Analytics } from "@/components/Analytics";
import SessionProvider from "@/components/providers/SessionProvider";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { GoogleOneTapTrigger } from "@/components/GoogleOneTapTrigger";
import { StructuredData } from "@/components/StructuredData";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LabubuHub - AI Image Generation Platform | Professional AI Art Creator",
    template: "%s | LabubuHub"
  },
  description: "Professional AI image generation platform powered by LabubuHub. Create stunning images from text descriptions with advanced AI technology. Free AI art generator.",
  keywords: [
    "labubuhub",
    "ai image generator",
    "text to image ai",
    "ai art generator",
    "labubu ai",
    "image generation ai",
    "ai art creator",
    "labubu ai",
    "professional ai images",
    "ai image creation",
    "labubu pro",
    "labubu max"
  ],
  authors: [{ name: "LabubuHub Team" }],
  creator: "LabubuHub",
  publisher: "LabubuHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://labubuhub.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50`}>
        <SessionProvider>
          {/* 全局导航栏 */}
          <Navigation />
          <ClientBody>
            {children}
          </ClientBody>
          {/* 全局页脚 */}
          <Footer />
          <GoogleOneTap />
          <GoogleOneTapTrigger />
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}

