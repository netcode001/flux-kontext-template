"use client"

import { AIGenerationCard } from './AIGenerationCard'
import { GalleryCard } from './GalleryCard'
import { WallpaperCard } from './WallpaperCard'

export function FeatureCards() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
   
        <div className="space-y-6">
          
          {/* 秀场卡片 */}
          <GalleryCard />
          
          {/* 壁纸卡片 */}
          <WallpaperCard />
        </div>
      </div>
    </section>
  )
} 