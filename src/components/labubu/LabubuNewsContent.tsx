"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Filter, TrendingUp, Clock, Heart, Share2, Bookmark, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { labubuStyles } from '@/lib/styles/labubu-theme'

// 📰 资讯文章接口定义
interface NewsArticle {
  id: string
  title: string
  content: string
  summary?: string
  author?: string
  sourceName: string
  sourceType: string
  originalUrl: string
  publishedAt: string
  imageUrls: string[]
  tags: string[]
  category: string
  viewCount: number
  likeCount: number
  shareCount: number
  hotScore: number
  isLiked?: boolean
  isBookmarked?: boolean
  createdAt: string
}

// 🔥 热搜关键词接口
interface TrendingKeyword {
  keyword: string
  category: string
  hotScore: number
  trendDirection: 'up' | 'down' | 'stable'
  searchCount: number
  rank: number
  heatLevel: 'low' | 'medium' | 'high' | 'extreme'
  trendIcon: string
}

// 🏷️ 分类配置（全部改为英文）
const categories = [
  { key: 'all', label: 'All', icon: '📰' },
  { key: 'product', label: 'New Release', icon: '🎁' },
  { key: 'event', label: 'Event', icon: '🎉' },
  { key: 'review', label: 'Review', icon: '📦' },
  { key: 'guide', label: 'Guide', icon: '📚' },
  { key: 'art', label: 'Art', icon: '🎨' },
  { key: 'trend', label: 'Trend', icon: '🔥' }
]

// 📊 排序选项（全部改为英文）
const sortOptions = [
  { key: 'hot_score', label: 'Sort by Hotness', icon: '🔥' },
  { key: 'published_at', label: 'Latest', icon: '🕐' },
  { key: 'view_count', label: 'Most Viewed', icon: '👁️' },
  { key: 'like_count', label: 'Most Liked', icon: '❤️' }
]

export function LabubuNewsContent() {
  const { data: session } = useSession()
  
  // 📊 状态管理
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentCategory, setCurrentCategory] = useState('all')
  const [currentSort, setCurrentSort] = useState('hot_score')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 📰 获取资讯列表
  const fetchArticles = async (pageNum = 1, reset = false, search = '') => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy: currentSort
      })
      
      if (currentCategory !== 'all') {
        params.append('category', currentCategory)
      }
      
      if (search.trim()) {
        params.append('search', search.trim())
      }
      
      console.log('📰 获取资讯数据:', { pageNum, reset, search, category: currentCategory, sortBy: currentSort })
      
      const response = await fetch(`/api/labubu/news?${params}`)
      const data = await response.json()
      
      if (data.success) {
        // 🔄 数据格式转换：下划线转驼峰命名
        const rawArticles = data.data.articles || []
        const newArticles = rawArticles.map((article: any) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          author: article.author,
          sourceName: article.source_name,
          sourceType: article.source_type,
          originalUrl: article.original_url,
          publishedAt: article.published_at,
          imageUrls: article.image_urls || [],
          tags: article.tags || [],
          category: article.category,
          viewCount: article.view_count || 0,
          likeCount: article.like_count || 0,
          shareCount: article.share_count || 0,
          hotScore: article.hot_score || 0, // 确保hotScore有默认值
          isLiked: article.isLiked || false,
          isBookmarked: article.isBookmarked || false,
          createdAt: article.created_at
        }))
        
        if (reset) {
          setArticles(newArticles)
        } else {
          setArticles(prev => [...prev, ...newArticles])
        }
        
        setHasMore(data.data.pagination.hasMore)
        setPage(pageNum)
        
        console.log('✅ 资讯数据获取成功:', { count: newArticles.length, hasMore: data.data.pagination.hasMore })
      } else {
        console.error('❌ 资讯数据获取失败:', data.error)
      }
    } catch (error) {
      console.error('🚨 获取资讯数据异常:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔥 获取热搜关键词
  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch('/api/labubu/trending?limit=10')
      const data = await response.json()
      
      if (data.success) {
        // 🔄 数据格式转换：下划线转驼峰命名
        const formattedKeywords = (data.data.keywords || []).map((keyword: any) => ({
          ...keyword,
          hotScore: keyword.hot_score || 0, // 确保hotScore有默认值
          trendDirection: keyword.trend_direction || 'stable',
          searchCount: keyword.search_count || 0,
          heatLevel: keyword.heatLevel || 'low'
        }))
        setTrendingKeywords(formattedKeywords)
        console.log('🔥 热搜数据获取成功:', formattedKeywords.length)
      }
    } catch (error) {
      console.error('🚨 获取热搜数据异常:', error)
    }
  }

  // 🔍 搜索处理
  const handleSearch = () => {
    if (searchInput !== searchQuery) {
      setSearchQuery(searchInput)
      setPage(1)
      fetchArticles(1, true, searchInput)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
    fetchArticles(1, true, '')
  }

  // 🏷️ 分类筛选
  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category)
    setPage(1)
    fetchArticles(1, true, searchQuery)
  }

  // 📊 排序切换
  const handleSortChange = (sort: string) => {
    setCurrentSort(sort)
    setPage(1)
    fetchArticles(1, true, searchQuery)
  }

  // 📄 加载更多
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchArticles(page + 1, false, searchQuery)
    }
  }

  // 🔥 热搜关键词点击
  const handleTrendingClick = (keyword: string) => {
    setSearchInput(keyword)
    setSearchQuery(keyword)
    setPage(1)
    fetchArticles(1, true, keyword)
  }

  // 📱 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 🎨 获取热度颜色
  const getHeatColor = (level: string) => {
    switch (level) {
      case 'extreme': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  // 🚀 初始化数据
  useEffect(() => {
    fetchArticles(1, true)
    fetchTrendingKeywords()
  }, [])

  // 🔄 分类和排序变化时重新获取
  useEffect(() => {
    fetchArticles(1, true, searchQuery)
  }, [currentCategory, currentSort])

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 🔥 左侧边栏 - 热搜标签（已删除） */}
          {/* <div className="lg:col-span-1">...</div> */}

          {/* 📰 主要内容区域，直接占据全部宽度 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 🔍 搜索和筛选栏 */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6  border border-labubu-200/30 hover: transition-all duration-300">
              <div className="flex flex-col gap-6">
                {/* 搜索框 */}
                <div className="relative group">
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-labubu-400 w-5 h-5 cursor-pointer hover:text-labubu-600 transition-all duration-300 group-hover:scale-110" 
                    onClick={handleSearch}
                  />
                  <Input
                    placeholder="Search Labubu news..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-12 pr-12 h-12 text-lg border-2 border-labubu-200/50 focus:border-labubu-400 focus:ring-labubu-400/20 rounded-2xl bg-gradient-to-r from-labubu-50/50 to-warm-50/50 focus:bg-white transition-all duration-300 focus:"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-labubu-400 hover:text-labubu-600 transition-all duration-300 hover:scale-110 hover:rotate-90"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <Button
                      key={category.key}
                      variant={currentCategory === category.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                        currentCategory === category.key
                          ? 'bg-gradient-to-r from-labubu-500 to-labubu-600 text-white  hover: hover:from-labubu-600 hover:to-labubu-700'
                          : 'border-2 border-labubu-200/50 text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 hover:border-labubu-400'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-base">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </Button>
                  ))}
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-4">
                  <span className="text-labubu-600 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-labubu-400 to-warm-400 rounded-full animate-pulse"></span>
                    Sort
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option, index) => (
                      <Button
                        key={option.key}
                        variant={currentSort === option.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSortChange(option.key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                          currentSort === option.key
                            ? 'bg-gradient-to-r from-warm-400 to-warm-500 text-white  hover:'
                            : 'text-labubu-600 hover:bg-gradient-to-r hover:from-warm-50 hover:to-labubu-50 hover:text-warm-600'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="text-sm">{option.icon}</span>
                        <span className="font-medium text-sm">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 📊 搜索结果提示 */}
            {searchQuery && (
              <div className="bg-labubu-50 border border-labubu-200/50 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-labubu-600" />
                    <span className="text-labubu-700">
                      Search results for "<span className="font-semibold">{searchQuery}</span>"
                    </span>
                    {!isLoading && (
                      <Badge variant="secondary" className="bg-labubu-100 text-labubu-700 rounded-full">
                        {articles.length} results
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-labubu-600 hover:text-labubu-800 text-sm hover:scale-105 transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* 📰 资讯列表 - 网格布局 */}
            <div>
              {isLoading && articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-labubu-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-soft-600">Loading...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-bold text-labubu-700 mb-2">No News</h3>
                  <p className="text-soft-500">
                    {searchQuery ? 'No related news found' : 'News content is under construction...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* 🎯 一行2个卡片的网格布局 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                    <div 
                      key={article.id} 
                      className="group bg-white/95 backdrop-blur-lg rounded-3xl overflow-hidden  border border-labubu-200/30 hover: transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => window.open(article.originalUrl, '_blank')}
                    >
                      {/* 📸 文章图片 - 确保每个卡片都有图片 */}
                      <div className="relative overflow-hidden">
                        <img
                          src={article.imageUrls && article.imageUrls.length > 0 
                            ? article.imageUrls[0] 
                            : `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`
                          }
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // 图片加载失败时使用备用图片
                            e.currentTarget.src = `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* 热度标签 */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-3 py-1 rounded-full text-xs font-bold ">
                          🔥 {(article.hotScore || 0).toFixed(1)}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* 📝 文章内容 */}
                        <div className="space-y-4">
                          
                          {/* 标题和来源 */}
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 hover:bg-gradient-to-r hover:from-pink-600 hover:to-violet-600 hover:bg-clip-text hover:text-transparent cursor-pointer transition-all duration-300 group-hover:scale-[1.02]">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="px-3 py-1 bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
                                {article.sourceName}
                              </div>
                              <span className="text-violet-500 text-xs font-medium">
                                {formatTime(article.publishedAt)}
                              </span>
                              {article.author && (
                                <span className="text-sky-500 text-xs font-medium">
                                  by {article.author}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 摘要 */}
                          {article.summary && (
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                              {article.summary}
                            </p>
                          )}

                          {/* 标签 */}
                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                <div 
                                  key={tagIndex} 
                                  className="px-2 py-1 bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 rounded-xl text-xs font-medium border border-sky-200 hover:scale-105 transition-transform duration-200"
                                >
                                  #{tag}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 互动数据 */}
                          <div className="flex items-center gap-4 text-slate-500 text-sm">
                            <div className="flex items-center gap-1 hover:text-violet-500 transition-colors duration-200">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium">{article.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-pink-500 transition-colors duration-200">
                              <Heart className={`w-4 h-4 ${article.isLiked ? 'text-pink-500 fill-current' : ''}`} />
                              <span className="font-medium">{article.likeCount}</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-sky-500 transition-colors duration-200">
                              <Share2 className="w-4 h-4" />
                              <span className="font-medium">{article.shareCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>

                  {/* 📄 加载更多 */}
                  {hasMore && (
                    <div className="text-center mt-6">
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        variant="outline"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        {isLoading ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 