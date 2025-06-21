'use client'

import { useState } from 'react'
import { Heart, Download, Eye, Crown, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { WallpaperCardProps } from '@/types/wallpaper'

export function WallpaperCard({
  wallpaper,
  onLike,
  onDownload,
  onView,
  showActions = true,
  size = 'medium'
}: WallpaperCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-64 overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {!imageError ? (
          <img
            src={wallpaper.thumbnail_url || wallpaper.image_url}
            alt={wallpaper.title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🖼️
          </div>
        )}

        {wallpaper.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">⭐ 精选</Badge>
        )}
        
        {wallpaper.is_premium && (
          <Badge className="absolute top-2 right-2 bg-purple-500">
            <Crown className="w-3 h-3 mr-1" />会员
          </Badge>
        )}

        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={wallpaper.is_liked ? "default" : "secondary"}
                onClick={() => onLike?.(wallpaper)}
              >
                <Heart className={`w-4 h-4 ${wallpaper.is_liked ? 'fill-current' : ''}`} />
              </Button>
              {wallpaper.can_download && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDownload?.(wallpaper)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {wallpaper.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {wallpaper.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {wallpaper.like_count}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {wallpaper.download_count}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 