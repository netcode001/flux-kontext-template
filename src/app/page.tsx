import type { Metadata } from 'next'
import { HomeContent } from '@/components/HomeContent'
import { generateMultilingualMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateMultilingualMetadata({
  title: 'LabubuHub,News,WallPaper HD,Viedos,AI Image Generation',
  description: 'LabubuHub offers the latest news, HD wallpapers, videos, and AI image generation services. Explore the world of Labubu for exclusive content and creative inspiration.',
  keywords: [
    'labubu',
    'labubu news',
    'HD wallpapers',
    'labubu videos',
    'AI image generation',
    'labubu creativity',
    'labubu platform',
    'labubu content',
    'labubu images',
    'labubu generation',
    'labubu HD',
    'labubu inspiration'
  ],
  path: '/',
  images: ['/og-home.png'],
})

export default function Home() {
  return <HomeContent />
}
