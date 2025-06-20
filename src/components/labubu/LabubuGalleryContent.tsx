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
  const [searchInput, setSearchInput] = useState('') // 🔍 新增：搜索输入框的值
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 获取帖子列表
  const fetchPosts = async (pageNum = 1, reset = false, searchTerm = '') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      })
      
      if (currentFilter === 'featured') {
        params.append('featured', 'true')
      }
      
      // 🔍 添加搜索参数
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
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
    fetchPosts(1, true, searchQuery)
  }, [currentFilter])

  // 🔍 执行搜索 - 只有在用户按回车或点击搜索时才执行
  const executeSearch = () => {
    setSearchQuery(searchInput.trim())
    setPage(1) // 重置页码
    fetchPosts(1, true, searchInput.trim())
  }

  // 🔍 处理搜索输入变化
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  // 🔍 处理回车键搜索
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch()
    }
  }

  // 🔍 清除搜索
  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
    fetchPosts(1, true, '')
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
      fetchPosts(nextPage, false, searchQuery) // 传递当前搜索词
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
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer hover:text-purple-600 transition-colors" 
                onClick={executeSearch}
              />
              <Input
                placeholder="搜索标题或内容..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-10 border-purple-200 focus:border-purple-400"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
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
        {/* 🔍 搜索结果状态提示 */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">
                  搜索 "<span className="font-semibold">{searchQuery}</span>" 的结果
                </span>
                {!isLoading && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {posts.length} 个结果
                  </Badge>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                清除搜索
              </button>
            </div>
          </div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">
              {searchQuery ? `搜索 "${searchQuery}" 中...` : '加载中...'}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{searchQuery ? '🔍' : '🎭'}</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchQuery ? '没有找到相关作品' : '还没有作品'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `尝试使用其他关键词搜索，或者浏览所有作品` 
                : '成为第一个分享Labubu创意的人吧！'
              }
            </p>
            {searchQuery ? (
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                查看所有作品
              </Button>
            ) : session && (
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
            {/* 作品网格 - 优化的瀑布流布局 */}
            <div className={`${
              viewMode === 'grid' 
                ? 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 masonry-container columns-masonry' 
                : 'grid grid-cols-1 max-w-2xl mx-auto gap-6'
            } search-transition ${isLoading ? 'searching' : ''}`}>
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={viewMode === 'grid' ? 'mb-3 masonry-item' : ''}
                  style={viewMode === 'grid' ? { 
                    // 添加轻微的延迟动画，减少布局跳动
                    animationDelay: `${(index % 5) * 50}ms`
                  } : {}}
                >
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                </div>
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