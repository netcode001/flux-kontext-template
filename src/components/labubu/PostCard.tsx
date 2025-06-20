"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Heart, Bookmark, Eye, MessageCircle, Share2, MoreHorizontal, X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
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
  
  // 🎪 弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
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
    setShowDetailModal(true)
    setCurrentImageIndex(0)
  }

  // 🎪 关闭详情弹窗
  const handleCloseModal = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log('🎪 关闭弹窗:', { postId: post.id })
    setShowDetailModal(false)
    setCurrentImageIndex(0)
  }

  // 🔒 滚动锁定效果 - 防止背景滚动穿透
  useEffect(() => {
    if (showDetailModal) {
      // 保存当前滚动位置
      const scrollY = window.scrollY
      
      // 锁定body滚动
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // 恢复滚动
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        
        // 恢复滚动位置
        window.scrollTo(0, scrollY)
      }
    }
  }, [showDetailModal])

  // 🎪 ESC键关闭弹窗
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailModal) {
        handleCloseModal()
      }
    }

    if (showDetailModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showDetailModal])

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

  return (
    <>
      {/* 主卡片 */}
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white border-gray-100 rounded-xl mb-3 break-inside-avoid cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* 🖼️ 只显示第一张图片 */}
          {post.imageUrls.length > 0 && (
            <div className="relative">
              <div className="relative w-full">
                {!imageLoadError ? (
                  <Image
                    src={post.imageUrls[0]}
                    alt={post.title}
                    width={300}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
                    style={{ 
                      maxHeight: '400px',
                      minHeight: '200px'
                    }}
                    onError={() => {
                      console.error('图片加载失败:', post.imageUrls[0])
                      setImageLoadError(true)
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center rounded-t-xl">
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

      {/* 🎪 详情弹窗 - 小红书风格布局 */}
      {showDetailModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={handleCloseModal}
        >
          <div 
            className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 📸 左侧图片区域 */}
            <div className="flex-1 relative bg-gray-50 flex items-center justify-center">
              {post.imageUrls.length > 0 && (
                <>
                  <Image
                    src={post.imageUrls[currentImageIndex]}
                    alt={`${post.title} - ${currentImageIndex + 1}`}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                      console.error('弹窗图片加载失败:', post.imageUrls[currentImageIndex])
                    }}
                  />
                  
                  {/* 图片切换按钮 */}
                  {post.imageUrls.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                      
                      {/* 图片指示器 */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {post.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* 👤 右侧信息区域 */}
            <div className="w-96 border-l border-gray-100 flex flex-col">
              {/* 用户信息头部 */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                    {post.user?.name?.[0] || post.user?.email?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{post.user?.name || '匿名用户'}</h3>
                    <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  {/* 标题 */}
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">{post.title}</h2>
                  
                  {/* 描述内容 */}
                  {post.content && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed text-sm">{post.content}</p>
                    </div>
                  )}
                  
                  {/* 标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AI生成信息 */}
                  {post.prompt && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🤖 AI提示词</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{post.prompt}</p>
                      {post.model && (
                        <p className="text-xs text-gray-500 mt-2">模型: {post.model}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 底部互动区域 */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={isLoading}
                      className={`flex items-center space-x-2 hover:bg-red-50 ${
                        isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{likeCount}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      disabled={isLoading}
                      className={`flex items-center space-x-2 hover:bg-yellow-50 ${
                        isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">收藏</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 