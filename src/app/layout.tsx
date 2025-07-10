import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
// ✅ 恢复 Google One Tap - OAuth 凭据已更新
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { GoogleOneTapTrigger } from "@/components/GoogleOneTapTrigger";
import { Navigation } from "@/components/Navigation";
import { StructuredData } from "@/components/StructuredData";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import ClientBody from "./ClientBody";

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
    default:
      "LabubuHub - AI Image Generation Platform | Professional AI Art Creator",
    template: "%s | LabubuHub",
  },
  description:
    "Professional AI image generation platform powered by LabubuHub. Create stunning images from text descriptions with advanced AI technology. Free AI art generator.",
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
    "labubu max",
  ],
  authors: [{ name: "LabubuHub Team" }],
  creator: "LabubuHub",
  publisher: "LabubuHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://labubuhub.com",
  ),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <StructuredData />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50`}
        >
          {/* ================= Clerk 登录/注册/用户按钮集成 ================= */}
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {/* ================= 原有导航栏和内容区 ================= */}
          {/* <SessionProvider> */}
          <Navigation />
          <ClientBody>{children}</ClientBody>
          <Footer />
          {/* ✅ 恢复 Google One Tap - OAuth 凭据已更新 */}
          <GoogleOneTap />
          <GoogleOneTapTrigger />
          <Analytics />
          {/* </SessionProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
