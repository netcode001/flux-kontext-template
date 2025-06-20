"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/Navigation'
import { PostCard } from './PostCard'
import { PostPublisher } from './PostPublisher'
import { PostWithUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Sparkles, Star, Grid, List } from 'lucide-react'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'featured' | 'recent' | 'popular'

export function LabubuGalleryContent() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPublisher, setShowPublisher] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 获取帖子列表
  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      })
      
      if (currentFilter === 'featured') {
        params.append('featured', 'true')
      }
      
      const response = await fetch(`/api/labubu/posts?${params}`)
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setPosts(data.data)
        } else {
          setPosts(prev => [...prev, ...data.data])
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchPosts(1, true)
  }, [currentFilter])

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // 这里可以实现搜索逻辑
  }

  // 处理筛选
  const handleFilter = (filter: FilterType) => {
    setCurrentFilter(filter)
    setPage(1)
  }

  // 加载更多
  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }

  // 处理作品发布
  const handlePostPublish = (newPost: any) => {
    // 发布成功后自动关闭弹窗并刷新列表
    setShowPublisher(false)
    // 重新获取最新的帖子列表，确保包含完整的用户信息
    fetchPosts(1, true)
  }

  // 处理点赞
  const handleLike = (postId: string, liked: boolean) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: liked, likeCount: post.likeCount + (liked ? 1 : -1) }
          : post
      )
    )
  }

  // 处理收藏
  const handleBookmark = (postId: string, bookmarked: boolean) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: bookmarked }
          : post
      )
    )
  }

  // 处理分享
  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      const shareText = `看看这个超棒的Labubu作品：${post.title}`
      const shareUrl = `${window.location.origin}/labubu-gallery/${postId}`
      
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl
        })
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        alert('链接已复制到剪贴板')
      }
    }
  }

  // 筛选器配置
  const filters = [
    { key: 'all', label: '全部', icon: Grid },
    { key: 'featured', label: '精选', icon: Star },
    { key: 'recent', label: '最新', icon: Sparkles },
    { key: 'popular', label: '热门', icon: Sparkles }
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 统一的导航栏 */}
      <Navigation />
      
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              🎨 创意秀场
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              展示Labubu收藏爱好者的原创作品，发现无限创意可能
            </p>
          </div>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索创意作品..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-purple-200 focus:border-purple-400"
              />
            </div>

            {/* 筛选器 */}
            <div className="flex items-center gap-2">
              {filters.map((filter) => {
                const Icon = filter.icon
                return (
                  <Button
                    key={filter.key}
                    variant={currentFilter === filter.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilter(filter.key as FilterType)}
                    className={`flex items-center gap-2 ${
                      currentFilter === filter.key
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </Button>
                )
              })}
            </div>

            {/* 视图切换和发布按钮 */}
            <div className="flex items-center gap-2">
              <div className="flex border border-purple-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-purple-500' : 'hover:bg-purple-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-purple-500' : 'hover:bg-purple-50'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {session && (
                <Button
                  onClick={() => setShowPublisher(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  发布作品
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 发布作品弹窗 */}
      {showPublisher && (
        <PostPublisher
          onPublish={handlePostPublish}
          onCancel={() => setShowPublisher(false)}
        />
      )}

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">还没有作品</h3>
            <p className="text-gray-500 mb-6">成为第一个分享Labubu创意的人吧！</p>
            {session && (
              <Button
                onClick={() => setShowPublisher(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                发布第一个作品
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* 作品网格 - 小红书瀑布流布局 */}
            <div className={`${
              viewMode === 'grid' 
                ? 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3' 
                : 'grid grid-cols-1 max-w-2xl mx-auto gap-6'
            }`}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 