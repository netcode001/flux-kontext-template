import type { Metadata } from 'next'
import { WallpaperGalleryContent } from '@/components/wallpaper/WallpaperGalleryContent'

export const metadata: Metadata = {
  title: "LabubuHub - Wallpapers | HD AI Wallpapers Free Download",
  description: "Download free HD Labubu wallpapers, AI-generated backgrounds for desktop and mobile.",
  keywords: ["Labubu", "wallpapers", "HD", "AI wallpapers", "free download"],
  openGraph: {
    title: "LabubuHub - Wallpapers | HD AI Wallpapers Free Download",
    description: "Download free HD Labubu wallpapers, AI-generated backgrounds for desktop and mobile.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "LabubuHub Wallpapers Gallery"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LabubuHub - Wallpapers | HD AI Wallpapers Free Download",
    description: "Download free HD Labubu wallpapers, AI-generated backgrounds for desktop and mobile.",
    images: ["/logo.png"]
  }
}

export default function WallpapersPage() {
  return (
    <div className="min-h-screen" data-page="wallpapers">
      <WallpaperGalleryContent />
    </div>
  )
} 