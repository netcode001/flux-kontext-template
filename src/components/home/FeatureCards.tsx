"use client"

import { AIGenerationCard } from './AIGenerationCard'
import { GalleryCard } from './GalleryCard'
import { WallpaperCard } from './WallpaperCard'

export function FeatureCards() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎨 功能中心</h2>
          <p className="text-gray-600">探索Labubu世界的各种精彩功能</p>
        </div>

        {/* 功能卡片列表 */}
        <div className="space-y-6">
          {/* 换装卡片 */}
          <AIGenerationCard />
          
          {/* 秀场卡片 */}
          <GalleryCard />
          
          {/* 壁纸卡片 */}
          <WallpaperCard />
        </div>
      </div>
    </section>
  )
} 