'use client'

import { useState } from 'react'
import { Heart, Download, Eye, Crown, Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { VideoWallpaperPlayer } from './VideoWallpaperPlayer'
import type { WallpaperCardProps } from '@/types/wallpaper'
import { cn } from '@/lib/utils'

export function WallpaperCard({
  wallpaper,
  onLike,
  onDownload,
  onView,
  showActions = true,
}: WallpaperCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  const handleVideoPlay = () => {
    if (wallpaper.media_type === 'video') {
      setShowVideoPlayer(true)
      onView?.(wallpaper)
    }
  }

  const handleImageView = () => {
    if (wallpaper.media_type === 'image') {
      onView?.(wallpaper)
    }
  }

  return (
    <Card className="group relative w-full overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border-none bg-transparent p-0">
      <div 
        className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-lg"
        style={{ aspectRatio: wallpaper.dimensions ? `${wallpaper.dimensions.width} / ${wallpaper.dimensions.height}` : '9 / 16' }}
      >
        {/* 视频播放器 */}
        {showVideoPlayer && wallpaper.media_type === 'video' && wallpaper.video_url ? (
          <VideoWallpaperPlayer
            wallpaper={wallpaper}
            autoPlay={true}
            loop={true}
            muted={true}
            showControls={true}
            showDownloadButton={wallpaper.can_download}
            className="h-full"
            onDownload={() => onDownload?.(wallpaper)}
          />
        ) : (
          <>
            {/* 图片或视频封面 */}
            {!imageError ? (
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={wallpaper.media_type === 'video' ? handleVideoPlay : handleImageView}
              >
                <img
                  src={wallpaper.thumbnail_url || wallpaper.image_url}
                  alt={wallpaper.title}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    imageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                
                {wallpaper.media_type === 'video' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-800 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <p>无法加载</p>
              </div>
            )}
          </>
        )}

        {/* 悬浮信息层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-semibold text-white text-base mb-2 line-clamp-2 drop-shadow-md">
            {wallpaper.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5" title="浏览量">
                <Eye className="w-4 h-4" />
                {wallpaper.view_count || 0}
              </span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white" title="点赞" onClick={(e) => { e.stopPropagation(); onLike?.(wallpaper); }}>
                <Heart className={`w-4 h-4 transition-colors ${wallpaper.is_liked ? 'text-red-500 fill-current' : 'hover:text-red-400'}`} />
                {wallpaper.like_count || 0}
              </span>
            </div>
            {showActions && wallpaper.can_download && (
              <Button
                size="icon"
                className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full"
                onClick={(e) => { e.stopPropagation(); onDownload?.(wallpaper); }}
                title="下载"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 角标 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {wallpaper.is_featured && (
            <Badge className="bg-yellow-400/90 border-yellow-500 text-yellow-900 backdrop-blur-sm">⭐ 精选</Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          {wallpaper.is_premium && (
            <Badge className="bg-purple-400/90 border-purple-500 text-purple-900 backdrop-blur-sm">
              <Crown className="w-3 h-3 mr-1" />会员
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
} 