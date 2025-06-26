"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Download, Heart, Eye, Play, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Wallpaper } from '@/types/wallpaper'

// 壁纸数据类型
interface WallpaperData {
  id: string
  title: string
  description?: string
  image_url?: string
  video_url?: string
  thumbnail_url?: string
  preview_gif_url?: string
  media_type: 'image' | 'video'
  tags: string[]
  download_count: number
  view_count: number
  like_count: number
  is_liked?: boolean
  can_download?: boolean
}

export function WallpaperCard() {
  const { data: session, status } = useSession()
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取壁纸数据
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/wallpapers?limit=6&sort=popular')
        
        if (!response.ok) {
          throw new Error('获取壁纸失败')
        }

        const data = await response.json()
        
        if (data.success && data.data && data.data.wallpapers) {
          setWallpapers(data.data.wallpapers)
        } else {
          // 使用模拟数据作为fallback
          setWallpapers(getMockWallpapers())
        }
        setError(null)
      } catch (err: any) {
        console.error('获取壁纸失败:', err)
        setError(err.message)
        // 使用模拟数据作为fallback
        setWallpapers(getMockWallpapers())
      } finally {
        setLoading(false)
      }
    }

    fetchWallpapers()
  }, [])

  // 模拟壁纸数据
  const getMockWallpapers = (): WallpaperData[] => [
    {
      id: '1',
      title: '梦幻星空动态壁纸',
      description: '美丽的星空背景，适合夜晚使用',
      image_url: '/images/wallpapers/starry-night.jpg',
      media_type: 'image',
      tags: ['星空', '梦幻', '夜晚'],
      download_count: 1250,
      view_count: 8900,
      like_count: 456,
      is_liked: false,
      can_download: !!session
    },
    {
      id: '2',
      title: '樱花飘落动画壁纸',
      description: '粉色樱花飘落效果，春季主题',
      image_url: '/images/wallpapers/cherry-blossom.jpg',
      preview_gif_url: '/images/wallpapers/cherry-blossom-preview.gif',
      media_type: 'video',
      tags: ['樱花', '春季', '粉色'],
      download_count: 980,
      view_count: 6700,
      like_count: 234,
      is_liked: false,
      can_download: !!session
    },
    {
      id: '3',
      title: '极光动态壁纸',
      description: '北极光流动效果，神秘而美丽',
      image_url: '/images/wallpapers/aurora.jpg',
      preview_gif_url: '/images/wallpapers/aurora-preview.gif',
      media_type: 'video',
      tags: ['极光', '神秘', '蓝色'],
      download_count: 2100,
      view_count: 15600,
      like_count: 789,
      is_liked: false,
      can_download: !!session
    }
  ]

  // 处理点赞
  const handleLike = async (wallpaper: WallpaperData) => {
    if (!session) {
      alert('请先登录才能点赞')
      return
    }

    try {
      const method = wallpaper.is_liked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/like`, {
        method
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 更新本地状态
        setWallpapers(prev => prev.map(w => 
          w.id === wallpaper.id 
            ? { 
                ...w, 
                is_liked: result.data.is_liked,
                like_count: result.data.like_count 
              }
            : w
        ))
      } else {
        console.error('点赞失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('点赞错误:', error)
      alert('点赞失败，请重试')
    }
  }

  // 处理下载
  const handleDownload = async (wallpaper: WallpaperData) => {
    if (!session) {
      alert('请先登录才能下载壁纸')
      return
    }

    try {
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 直接下载图片
        const link = document.createElement('a')
        link.href = result.data.download_url
        link.download = result.data.wallpaper.original_filename || `wallpaper-${wallpaper.id}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 更新下载计数
        setWallpapers(prev => prev.map(w => 
          w.id === wallpaper.id 
            ? { ...w, download_count: w.download_count + 1 }
            : w
        ))
      } else {
        console.error('下载失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('下载错误:', error)
      alert('下载失败，请重试')
    }
  }

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 确保wallpapers是数组
  const safeWallpapers = Array.isArray(wallpapers) ? wallpapers : getMockWallpapers()

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">🎨 精美壁纸</h3>
            <p className="text-sm text-gray-600">高清动态壁纸，让桌面更生动</p>
          </div>
        </div>
        
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          {safeWallpapers.length} 张
        </Badge>
      </div>

      {/* 壁纸预览网格 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {safeWallpapers.slice(0, 4).map((wallpaper) => (
          <div
            key={wallpaper.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-200 aspect-video"
          >
            {/* 壁纸图片 */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${wallpaper.thumbnail_url || wallpaper.image_url || '/images/wallpapers/default.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* 占位图 */}
              <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <div className="text-2xl">
                  {wallpaper.media_type === 'video' ? '🎬' : '🖼️'}
                </div>
              </div>
            </div>
            
            {/* 视频播放图标 */}
            {wallpaper.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
            )}
            
            {/* 悬停操作 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 text-gray-800 hover:bg-white"
                onClick={() => handleLike(wallpaper)}
              >
                <Heart className={`w-3 h-3 ${wallpaper.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              
              {session ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={() => handleDownload(wallpaper)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={() => alert('请先登录才能下载')}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* 统计信息 */}
            <div className="absolute bottom-1 left-1 right-1">
              <div className="flex items-center justify-between text-xs text-white bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                <span className="flex items-center space-x-1">
                  <Download className="w-2 h-2" />
                  <span>{formatNumber(wallpaper.download_count)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-2 h-2" />
                  <span>{formatNumber(wallpaper.like_count)}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 卡片底部 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {session ? '登录用户可下载高清版本' : '登录后即可下载高清壁纸'}
        </div>
        
        <a
          href="/wallpapers"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
        >
          查看更多
        </a>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs">
            加载壁纸时出现错误: {error}，正在使用模拟数据
          </p>
        </div>
      )}
    </div>
  )
} 