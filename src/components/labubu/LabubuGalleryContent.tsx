"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import { PostCard } from './PostCard'
import { PostPublisher } from './PostPublisher'
import { PostWithUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Labubu风格组件
import { LabubuCard, LabubuButton, LabubuInput, LabubuBadge, LabubuHeading, LabubuText, LabubuContainer } from '@/components/ui/labubu-ui'
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

  // 🔧 修复数据获取逻辑
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
      
      console.log('🔍 正在获取帖子数据:', { pageNum, reset, searchTerm, currentFilter })
      
      const response = await fetch(`/api/labubu/posts?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📄 API响应数据:', data)
      
      if (data.success) {
        if (reset) {
          setPosts(data.data || [])
          console.log('✅ 重置帖子列表，数量:', data.data?.length || 0)
        } else {
          setPosts(prev => [...prev, ...(data.data || [])])
          console.log('✅ 追加帖子到列表，新增数量:', data.data?.length || 0)
        }
        setHasMore(data.pagination?.hasMore || false)
      } else {
        console.error('❌ API返回错误:', data.error)
        // 如果API返回错误，设置空数组而不是保持loading状态
        if (reset) {
          setPosts([])
        }
      }
    } catch (error) {
      console.error('❌ 获取帖子失败:', error)
      // 出错时也要设置空数组，避免一直loading
      if (reset) {
        setPosts([])
      }
    } finally {
      setIsLoading(false)
      console.log('🔄 加载状态已重置为false')
    }
  }

  // 🔧 修复初始加载逻辑
  useEffect(() => {
    console.log('🚀 组件初始化，开始获取数据...')
    fetchPosts(1, true, searchQuery)
  }, [currentFilter]) // 只依赖currentFilter，避免无限循环

  // 🔧 单独处理搜索查询的变化
  useEffect(() => {
    if (searchQuery !== searchInput) {
      // 只有当搜索查询真正改变时才重新获取数据
      console.log('🔍 搜索查询变化，重新获取数据:', searchQuery)
      fetchPosts(1, true, searchQuery)
    }
  }, [searchQuery])

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
    <LabubuContainer className="min-h-screen">
      {/* 统一的导航栏 */}
      <DynamicNavigation />
      
      {/* 搜索和筛选栏 */}
      <div>
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 w-full max-w-md">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-400 w-4 h-4 cursor-pointer hover:text-labubu-600 transition-colors" 
                onClick={executeSearch}
              />
              <LabubuInput
                variant="search"
                placeholder="搜索标题或内容..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-10 w-full"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-400 hover:text-soft-600"
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
                  <LabubuButton
                    key={filter.key}
                    variant={currentFilter === filter.key ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleFilter(filter.key as FilterType)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </LabubuButton>
                )
              })}
            </div>

            {/* 视图切换和发布按钮 */}
            <div className="flex items-center gap-2">
              <div className="flex border border-labubu-200 rounded-2xl overflow-hidden">
                <LabubuButton
                  variant={viewMode === 'grid' ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </LabubuButton>
                <LabubuButton
                  variant={viewMode === 'list' ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </LabubuButton>
              </div>

              {session && (
                <LabubuButton
                  variant="warm"
                  onClick={() => setShowPublisher(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  发布作品
                </LabubuButton>
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
          <LabubuCard variant="interactive" className="mb-6 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-labubu-600" />
                <LabubuText className="text-labubu-700">
                  搜索 "<span className="font-semibold">{searchQuery}</span>" 的结果
                </LabubuText>
                {!isLoading && (
                  <LabubuBadge variant="primary">
                    {posts.length} 个结果
                  </LabubuBadge>
                )}
              </div>
              <LabubuButton
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-labubu-600 hover:text-labubu-800"
              >
                清除搜索
              </LabubuButton>
            </div>
          </LabubuCard>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-labubu-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <LabubuText className="text-soft-600">
              {searchQuery ? `搜索 "${searchQuery}" 中...` : '加载中...'}
            </LabubuText>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{searchQuery ? '🔍' : '🎭'}</div>
            <LabubuHeading level={3} className="text-xl font-bold text-soft-700 mb-2">
              {searchQuery ? '没有找到相关作品' : '还没有作品'}
            </LabubuHeading>
            <LabubuText className="text-soft-500 mb-6">
              {searchQuery 
                ? `尝试使用其他关键词搜索，或者浏览所有作品` 
                : '成为第一个分享Labubu创意的人吧！'
              }
            </LabubuText>
            {searchQuery ? (
              <LabubuButton
                variant="secondary"
                onClick={clearSearch}
              >
                查看所有作品
              </LabubuButton>
            ) : session && (
              <LabubuButton
                variant="warm"
                onClick={() => setShowPublisher(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                发布第一个作品
              </LabubuButton>
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
                <LabubuButton
                  variant="secondary"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </LabubuButton>
              </div>
            )}
          </div>
        )}
      </div>
    </LabubuContainer>
  )
} 