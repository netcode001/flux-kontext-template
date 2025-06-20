"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Heart, Bookmark, Eye, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { PostWithUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PostCardProps {
  post: PostWithUser
  onLike?: (postId: string, liked: boolean) => void
  onBookmark?: (postId: string, bookmarked: boolean) => void
  onShare?: (postId: string) => void
}

export function PostCard({ post, onLike, onBookmark, onShare }: PostCardProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isLoading, setIsLoading] = useState(false)

  // 处理点赞操作
  const handleLike = async () => {
    if (!session) {
      // 这里可以触发登录弹窗
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/labubu/posts/${post.id}/like`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLiked(data.liked)
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
        onLike?.(post.id, data.liked)
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理收藏操作
  const handleBookmark = async () => {
    if (!session) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/labubu/posts/${post.id}/bookmark`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsBookmarked(data.bookmarked)
        onBookmark?.(post.id, data.bookmarked)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理分享操作
  const handleShare = () => {
    onShare?.(post.id)
  }

  // 格式化时间 - 修复日期类型问题
  const formatTime = (date: Date | string) => {
    // 🔧 确保date是Date对象
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // 🔧 验证日期有效性
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date)
      return '时间未知'
    }
    
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
      }
      return `${hours}小时前`
    }
    
    if (days < 7) {
      return `${days}天前`
    }
    
    return dateObj.toLocaleDateString('zh-CN')
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white border-gray-100 rounded-xl">
      <CardContent className="p-0">
        {/* 图片展示 - 小红书风格 */}
        {post.imageUrls.length > 0 && (
          <div className="relative">
            {post.imageUrls.length === 1 ? (
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={post.imageUrls[0]}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
                  onError={(e) => {
                    console.error('图片加载失败:', post.imageUrls[0])
                    // 显示占位符
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.image-placeholder')) {
                      const placeholder = document.createElement('div')
                      placeholder.className = 'image-placeholder absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center rounded-t-xl'
                      placeholder.innerHTML = `
                        <div class="text-center">
                          <div class="w-12 h-12 mx-auto mb-2 bg-pink-200 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p class="text-sm text-gray-500">图片加载失败</p>
                        </div>
                      `
                      parent.appendChild(placeholder)
                    }
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {post.imageUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden">
                    <Image
                      src={url}
                      alt={`${post.title} - ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('图片加载失败:', url)
                        // 显示占位符
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.image-placeholder')) {
                          const placeholder = document.createElement('div')
                          placeholder.className = 'image-placeholder absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center'
                          placeholder.innerHTML = `
                            <div class="text-center">
                              <div class="w-6 h-6 mx-auto mb-1 bg-pink-200 rounded-full flex items-center justify-center">
                                <svg class="w-3 h-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                              <p class="text-xs text-gray-400">加载失败</p>
                            </div>
                          `
                          parent.appendChild(placeholder)
                        }
                      }}
                    />
                    {index === 3 && post.imageUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          +{post.imageUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* 极简信息区域 */}
      <div className="p-2">
        {/* 标题 - 极简风格 */}
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">
          {post.title}
        </h3>

        {/* 用户信息和互动 - 极简风格 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {post.user?.name?.[0] || post.user?.email?.[0] || 'U'}
            </div>
            <span className="text-xs text-gray-700 font-medium">
              {post.user?.name || '匿名用户'}
            </span>
          </div>

          {/* 简化的互动按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`p-1 h-auto ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs ml-1">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isLoading}
              className={`p-1 h-auto ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 