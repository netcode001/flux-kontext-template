import type { Metadata } from 'next'
import { WallpaperGalleryContent } from '@/components/wallpaper/WallpaperGalleryContent'

export const metadata: Metadata = {
  title: '壁纸画廊 - Flux Kontext',
  description: '精美的AI生成壁纸集合，支持多种分类和高清下载',
  keywords: ['壁纸', '高清壁纸', 'AI壁纸', '免费下载', '桌面壁纸', '手机壁纸'],
  openGraph: {
    title: '壁纸画廊 - Flux Kontext',
    description: '精美的AI生成壁纸集合，支持多种分类和高清下载',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Flux Kontext 壁纸画廊'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '壁纸画廊 - Flux Kontext',
    description: '精美的AI生成壁纸集合，支持多种分类和高清下载'
  }
}

export default function WallpapersPage() {
  return <WallpaperGalleryContent />
} 