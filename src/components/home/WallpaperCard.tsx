"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Download, Heart, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Wallpaper } from '@/types/wallpaper'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// 壁纸数据类型
interface WallpaperData {
  id: string
  title: string
  image_url?: string
  thumbnail_url?: string
  media_type: 'image' | 'video'
  download_count: number
  like_count: number
  is_liked?: boolean
  can_download?: boolean
  view_count?: number
  original_filename?: string
}

export function WallpaperCard() {
  const { data: session } = useSession()
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // 获取壁纸数据
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/wallpapers?limit=4&sort=popular')
        
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
      title: '梦幻星空',
      image_url: '/images/wallpapers/starry-night.jpg',
      thumbnail_url: '/images/wallpapers/starry-night.jpg',
      media_type: 'image',
      download_count: 1250,
      like_count: 456,
      is_liked: false,
      can_download: !!session
    },
    {
      id: '2',
      title: '樱花飘落',
      image_url: '/images/wallpapers/cherry-blossom.jpg',
      thumbnail_url: '/images/wallpapers/cherry-blossom.jpg',
      media_type: 'image',
      download_count: 980,
      like_count: 234,
      is_liked: false,
      can_download: !!session
    },
    {
      id: '3',
      title: '极光',
      image_url: '/images/wallpapers/aurora.jpg',
      thumbnail_url: '/images/wallpapers/aurora.jpg',
      media_type: 'image',
      download_count: 2100,
      like_count: 789,
      is_liked: false,
      can_download: !!session
    },
    {
      id: '4',
      title: '泳池派对',
      image_url: '/images/wallpapers/pool-party.jpg',
      thumbnail_url: '/images/wallpapers/pool-party.jpg',
      media_type: 'image',
      download_count: 500,
      like_count: 120,
      is_liked: false,
      can_download: !!session
    }
  ]

  // 处理点赞
  const handleLike = async (wallpaper: WallpaperData) => {
    if (!session) {
      setShowLoginDialog(true)
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
      setShowLoginDialog(true)
      return
    }
    setDownloadingId(wallpaper.id)
    try {
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '下载失败')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = wallpaper.original_filename || `wallpaper-${wallpaper.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setWallpapers(prev => prev.map(w =>
        w.id === wallpaper.id
          ? { ...w, download_count: w.download_count + 1 }
          : w
      ))
    } catch (error) {
      console.error('❌ 下载失败:', error)
      alert(error instanceof Error ? error.message : '下载失败，请重试')
    } finally {
      setDownloadingId(null)
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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl px-4 py-6 border border-purple-100 relative">
      <div className="flex items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl">🎨</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">精美壁纸</h3>
            <p className="text-sm text-gray-600">高清动态壁纸，让桌面更生动</p>
          </div>
        </div>
        {/* 查看更多按钮右上角绝对定位 */}
        <a
          href="/wallpapers"
          className="absolute top-6 right-8 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg z-10"
        >
          查看更多
        </a>
      </div>
      {/* 壁纸图片网格 */}
      <div className="grid grid-cols-4 gap-6 mb-2">
        {safeWallpapers.map((wallpaper) => (
          <div
            key={wallpaper.id}
            className="group relative w-full overflow-hidden rounded-lg transition-all duration-300 border-none bg-transparent p-0 aspect-[9/16] min-h-[420px] max-h-[520px]"
          >
            <img
              src={wallpaper.thumbnail_url || wallpaper.image_url || '/images/wallpapers/default.jpg'}
              alt={wallpaper.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              draggable={false}
              style={{ minHeight: '420px', maxHeight: '520px' }}
            />
            {/* 悬浮信息层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-semibold text-white text-base mb-2 line-clamp-2">
                {wallpaper.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-200">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title="浏览量">
                    <Eye className="w-5 h-5" />
                    {wallpaper.view_count || 0}
                  </span>
                  <button
                    className="flex items-center gap-1.5 cursor-pointer hover:text-white text-base"
                    title="点赞"
                    onClick={(e) => { e.stopPropagation(); handleLike(wallpaper) }}
                  >
                    <Heart className={cn('w-5 h-5 transition-colors', wallpaper.is_liked ? 'text-red-500 fill-current' : 'hover:text-red-400')} />
                    {wallpaper.like_count || 0}
                  </button>
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-base"
                  onClick={(e) => { e.stopPropagation(); session ? handleDownload(wallpaper) : setShowLoginDialog(true) }}
                  title="下载"
                  disabled={downloadingId === wallpaper.id}
                >
                  {downloadingId === wallpaper.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
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

      {/* 未登录下载弹窗 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>请登录后下载高清壁纸</DialogTitle>
            <DialogDescription>登录后可下载高清壁纸和享受更多功能</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>确定</Button>
            <Link href="/auth/signin">
              <Button variant="default">去登录</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 