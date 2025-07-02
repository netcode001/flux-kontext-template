"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Navigation } from "@/components/Navigation";
import { PostCard } from './PostCard'
import { PostPublisher } from './PostPublisher'
import { PostWithUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Labubu风格组件
import { LabubuCard, LabubuButton, LabubuInput, LabubuBadge, LabubuHeading, LabubuText, LabubuContainer, LabubuLoader } from '@/components/ui/labubu-ui'
import { Plus, Search, Filter, Sparkles, Star, Grid, List, Loader2 } from 'lucide-react'

type FilterType = 'all' | 'featured' | 'recent' | 'popular'

export function LabubuGalleryContent() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPublisher, setShowPublisher] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // 🔍 新增：搜索输入框的值
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all')
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

  // 筛选器配置（全部英文）
  const filters = [
    { key: 'all', label: 'All', icon: Grid },
    { key: 'featured', label: 'Featured', icon: Star },
    { key: 'recent', label: 'Recent', icon: Sparkles },
    { key: 'popular', label: 'Popular', icon: Sparkles }
  ] as const

  return (
    <div className="min-h-screen" data-page="labubu-gallery">
      {/* 统一的导航栏 */}
      <Navigation />
      
      {/* 搜索和筛选栏 */}
      <div className="container mx-auto px-4 py-6 pt-24">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* 搜索框 */}
          <div className="relative flex-1 w-full">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-400 w-4 h-4 cursor-pointer hover:text-labubu-600 transition-colors" 
              onClick={executeSearch}
            />
            <LabubuInput
              variant="search"
              placeholder="Search by title or content..."
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {filters.map(filter => (
                <LabubuButton
                  key={filter.key}
                  variant={currentFilter === filter.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilter(filter.key as FilterType)}
                  className="flex items-center gap-2"
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </LabubuButton>
              ))}
            </div>

            {/* 发布按钮 */}
            {session && (
              <LabubuButton
                variant="warm"
                size="lg"
                onClick={() => setShowPublisher(true)}
                className="flex items-center gap-2"
              >
                Post Labubu
              </LabubuButton>
            )}
          </div>
        </div>
      </div>

      {/* 作品发布器 */}
      {showPublisher && (
        <PostPublisher
          onCancel={() => setShowPublisher(false)}
          onPublish={handlePostPublish}
        />
      )}

      {/* 作品画廊 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* 🔍 搜索结果状态提示 */}
        {searchQuery && (
          <LabubuCard variant="interactive" className="mb-6 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-labubu-600" />
                <LabubuText className="text-labubu-700">
                  Search results for "<span className="font-semibold">{searchQuery}</span>"
                </LabubuText>
                {!isLoading && (
                  <LabubuBadge variant="primary">
                    {posts.length} results
                  </LabubuBadge>
                )}
              </div>
              <LabubuButton
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-labubu-600 hover:text-labubu-800"
              >
                Clear
              </LabubuButton>
            </div>
          </LabubuCard>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="text-center py-20">
            <LabubuLoader />
            <p className="mt-4 text-soft-500">Loading Labubu's creative ideas...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{searchQuery ? '🔍' : '🎭'}</div>
            <LabubuHeading level={3} className="text-xl font-bold text-soft-700 mb-2">
              {searchQuery ? 'No related posts found' : 'No posts yet'}
            </LabubuHeading>
            <LabubuText className="text-soft-500 mb-6">
              {searchQuery 
                ? `Try other keywords or browse all posts` 
                : 'Be the first to share your Labubu creation!'
              }
            </LabubuText>
            {searchQuery ? (
              <LabubuButton
                variant="secondary"
                onClick={clearSearch}
              >
                View all posts
              </LabubuButton>
            ) : session && (
              <LabubuButton
                variant="warm"
                onClick={() => setShowPublisher(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post the first creation
              </LabubuButton>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* 🔄 改为网格布局 - 避免瀑布流的叠加问题 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {posts.map(post => (
                <div key={post.id} className="w-full">
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 加载更多按钮 */}
        {hasMore && (
          <div className="text-center py-10">
            <LabubuButton
              variant="secondary"
              onClick={loadMore}
              disabled={isLoading}
              className="flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                'Discover more posts'
              )}
            </LabubuButton>
          </div>
        )}
      </main>
    </div>
  )
} 