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

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes}分钟前`
      }
      return `${hours}小时前`
    }
    
    if (days < 7) {
      return `${days}天前`
    }
    
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-pink-100">
      <CardHeader className="p-4">
        {/* 用户信息 */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {post.user?.name?.[0] || post.user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">
              {post.user?.name || '匿名用户'}
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(post.createdAt)}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* 标题 */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* 内容描述 */}
        {post.content && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {post.content}
          </p>
        )}

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-pink-100 text-pink-700 hover:bg-pink-200">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* 图片展示 */}
        {post.imageUrls.length > 0 && (
          <div className="relative">
            {post.imageUrls.length === 1 ? (
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={post.imageUrls[0]}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                    />
                    {index === 3 && post.imageUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
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

      <CardFooter className="p-4">
        {/* 互动按钮 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* 点赞按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>

            {/* 评论按钮 */}
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.commentCount}</span>
            </Button>

            {/* 浏览量 */}
            <div className="flex items-center space-x-1 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{post.viewCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 收藏按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isLoading}
              className={`${
                isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-500 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>

            {/* 分享按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-green-500"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 