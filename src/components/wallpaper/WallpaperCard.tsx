'use client'

import { useState } from 'react'
import { Heart, Download, Eye, Crown, Tag, Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { VideoWallpaperPlayer } from './VideoWallpaperPlayer'
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
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // 🎬 处理视频播放
  const handleVideoPlay = () => {
    if (wallpaper.media_type === 'video') {
      setShowVideoPlayer(true)
      onView?.(wallpaper) // 记录浏览次数
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-64 overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* 🎬 视频播放器模式 */}
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
            {/* 🖼️ 缩略图显示 */}
            {!imageError ? (
              <div 
                className={`relative w-full h-full cursor-pointer ${wallpaper.media_type === 'video' ? 'group/video' : ''}`}
                onClick={wallpaper.media_type === 'video' ? handleVideoPlay : undefined}
              >
                <img
                  src={wallpaper.thumbnail_url || wallpaper.image_url}
                  alt={wallpaper.title}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                
                {/* 🎬 视频播放按钮覆盖层 */}
                {wallpaper.media_type === 'video' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3 group-hover/video:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-800 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {wallpaper.media_type === 'video' ? '🎬' : '🖼️'}
              </div>
            )}
          </>
        )}

        {/* 🏷️ 标签显示 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {wallpaper.is_featured && (
            <Badge className="bg-yellow-500">⭐ 精选</Badge>
          )}
          {wallpaper.media_type === 'video' && (
            <Badge className="bg-blue-500">
              <Play className="w-3 h-3 mr-1" />动态
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {wallpaper.is_premium && (
            <Badge className="bg-purple-500">
              <Crown className="w-3 h-3 mr-1" />会员
            </Badge>
          )}
          {wallpaper.media_type === 'video' && wallpaper.duration && (
            <Badge className="bg-gray-800 text-white">
              <Clock className="w-3 h-3 mr-1" />{wallpaper.duration}s
            </Badge>
          )}
        </div>

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