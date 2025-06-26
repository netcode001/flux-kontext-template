"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Heart, Bookmark, Eye, MessageCircle, Share2, MoreHorizontal, X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { PostWithUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useModalManager } from '@/hooks/useModalManager'

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
  
  // 🎪 使用全局模态框管理器
  const { isOpen: showDetailModal, openModal, closeModal } = useModalManager(post.id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadError, setImageLoadError] = useState(false)

  // 🔧 简化调试信息 - 只在开发环境打印
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && showDetailModal) {
      console.log('🎪 弹窗状态变化:', { postId: post.id, title: post.title, showDetailModal })
    }
  }, [showDetailModal, post.id, post.title])

  // 处理点赞操作
  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation() // 防止触发卡片点击
    
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
  const handleBookmark = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation() // 防止触发卡片点击
    
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
  const handleShare = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation() // 防止触发卡片点击
    onShare?.(post.id)
  }

  // 🎪 打开详情弹窗 - 简化逻辑
  const handleCardClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log('🎪 点击卡片，打开弹窗:', { postId: post.id, title: post.title })
    openModal()
    setCurrentImageIndex(0)
  }

  // 🎪 关闭详情弹窗
  const handleCloseModal = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log('🎪 关闭弹窗:', { postId: post.id })
    closeModal()
    setCurrentImageIndex(0)
  }

  // 🎪 ESC键关闭弹窗
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailModal) {
        console.log('⌨️ ESC键关闭弹窗 - PostCard:', post.id)
        closeModal()
      }
    }

    if (showDetailModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showDetailModal, post.id, closeModal])

  // 🎪 切换图片
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    )
  }

  // 🕒 格式化时间 - 显示具体发布时间
  const formatTime = (date: Date | string) => {
    try {
      // 🔧 确保date是Date对象
      const dateObj = typeof date === 'string' ? new Date(date) : date
      
      // 🔧 验证日期有效性
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date)
        return '时间未知'
      }
      
      // 📅 格式化为具体时间：2024-12-21 14:30
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
      console.error('Time format error:', error)
      return '时间未知'
    }
  }

  // 弹窗的具体内容
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0"
      onClick={handleCloseModal}
    >
      <div 
        className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button 
          onClick={handleCloseModal}
          className="absolute top-3 right-3 z-20 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* 图片区域 */}
        <div className="relative w-full lg:w-3/5 bg-black flex items-center justify-center">
          <Image
            src={post.imageUrls[currentImageIndex]}
            alt={`${post.title} - 图片 ${currentImageIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* 图片切换控件 */}
          {post.imageUrls.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {post.imageUrls.length}
              </div>
            </>
          )}
        </div>

        {/* 内容区域 */}
        <div className="w-full lg:w-2/5 p-6 flex flex-col overflow-y-auto">
          {/* 用户信息 */}
          <div className="flex items-center mb-4">
            <Image
              src={post.user?.image || '/logo.png'}
              alt={post.user?.name || '用户头像'}
              width={40}
              height={40}
              className="rounded-full mr-3"
            />
            <div>
              <p className="font-semibold text-gray-800">{post.user?.name}</p>
              <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
            </div>
          </div>
          
          {/* 标题和内容 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
          <div className="prose prose-sm max-w-none text-gray-600 flex-grow mb-4">
            <p>{post.content}</p>
          </div>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center space-x-4 border-t pt-4 mt-auto">
            <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-pink-500">
              <Heart className={`w-4 h-4 ${isLiked ? 'text-pink-500 fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBookmark} className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-blue-500 fill-current' : ''}`} />
              <span>收藏</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-2 text-gray-600 hover:text-green-500">
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 主卡片 */}
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] bg-white border-gray-100 rounded-xl mb-3 break-inside-avoid cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* 🖼️ 只显示第一张图片 */}
          {post.imageUrls.length > 0 && (
            <div className="relative">
              <div className="relative w-full aspect-w-1 aspect-h-1">
                {!imageLoadError ? (
                  <Image
                    src={post.imageUrls[0]}
                    alt={post.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
                    onError={() => {
                      console.error('图片加载失败:', post.imageUrls[0])
                      setImageLoadError(true)
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center rounded-t-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-pink-200 rounded-full flex items-center justify-center">
                        <Images className="w-6 h-6 text-pink-400" />
                      </div>
                      <p className="text-sm text-gray-500">图片加载失败</p>
                      <p className="text-xs text-gray-400 mt-1">点击查看详情</p>
                    </div>
                  </div>
                )}
                
                {/* 🏷️ 图片数量标识 */}
                {post.imageUrls.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Images className="w-3 h-3" />
                    <span>{post.imageUrls.length}</span>
                  </div>
                )}
              </div>
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

      {/* 弹窗传送门 */}
      {showDetailModal && createPortal(modalContent, document.body)}
    </>
  )
} 