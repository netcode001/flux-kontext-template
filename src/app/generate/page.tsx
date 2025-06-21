import type { Metadata } from 'next'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import { Footer } from '@/components/Footer'
import { FluxKontextGenerator } from '@/components/FluxKontextGenerator'
import { generateMultilingualMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateMultilingualMetadata({
  title: 'AI Image Generator - Flux Kontext | Create Professional Images',
  description: 'Generate and edit professional images with Flux Kontext AI. Text-to-image generation, image editing, and multi-image processing with advanced AI technology.',
  keywords: [
    'AI image generator',
    'Flux Kontext',
    'text to image',
    'image editing',
    'AI art',
    'professional images',
    'image generation ai',
    'ai art creator',
    'flux ai generator',
    'ai image creation',
    'professional ai images',
    'ai powered imaging'
  ],
  path: '/generate',
  images: ['/og-generate.png'],
})

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-background">
      <DynamicNavigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <FluxKontextGenerator />
      </main>

      <Footer />
    </div>
  )
} 