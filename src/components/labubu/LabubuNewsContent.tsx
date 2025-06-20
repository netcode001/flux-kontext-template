"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Filter, TrendingUp, Clock, Heart, Share2, Bookmark, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

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

// 🏷️ 分类配置
const categories = [
  { key: 'all', label: '全部', icon: '📰' },
  { key: 'product', label: '新品发布', icon: '🎁' },
  { key: 'event', label: '活动预告', icon: '🎉' },
  { key: 'review', label: '开箱评测', icon: '📦' },
  { key: 'guide', label: '收藏攻略', icon: '📚' },
  { key: 'art', label: '艺术创作', icon: '🎨' },
  { key: 'trend', label: '潮流趋势', icon: '🔥' }
]

// 📊 排序选项
const sortOptions = [
  { key: 'hot_score', label: '热度排序', icon: '🔥' },
  { key: 'published_at', label: '最新发布', icon: '🕐' },
  { key: 'view_count', label: '最多浏览', icon: '👁️' },
  { key: 'like_count', label: '最多点赞', icon: '❤️' }
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* 🔥 左侧边栏 - 热搜标签 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm">🔥</span>
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                    Labubu热搜
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {trendingKeywords.map((keyword, index) => (
                    <div
                      key={keyword.keyword}
                      onClick={() => handleTrendingClick(keyword.keyword)}
                      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-1 animate-fade-in-up ${
                        keyword.rank <= 3 
                          ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg hover:shadow-pink-300/50 hover:from-pink-500 hover:to-rose-500' 
                          : keyword.rank <= 6
                          ? 'bg-gradient-to-r from-violet-400 to-purple-400 text-white shadow-lg hover:shadow-violet-300/50 hover:from-violet-500 hover:to-purple-500'
                          : 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-lg hover:shadow-sky-300/50 hover:from-sky-500 hover:to-cyan-500'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="font-semibold group-hover:scale-105 transition-transform"># {keyword.keyword}</span>
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <span className="text-xs font-bold">
                          {(keyword.hotScore || 0).toFixed(0)}
                        </span>
                        <span className="text-xs animate-bounce">{keyword.trendIcon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 📰 主要内容区域 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 🔍 搜索和筛选栏 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
              <div className="flex flex-col gap-6">
                
                {/* 搜索框 */}
                <div className="relative group">
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 w-5 h-5 cursor-pointer hover:text-pink-500 transition-all duration-300 group-hover:scale-110" 
                    onClick={handleSearch}
                  />
                  <Input
                    placeholder="搜索Labubu资讯..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-12 pr-12 h-12 text-lg border-2 border-violet-200 focus:border-pink-400 rounded-2xl bg-gradient-to-r from-violet-50/50 to-pink-50/50 focus:bg-white transition-all duration-300 focus:shadow-lg focus:shadow-pink-200/50"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-violet-400 hover:text-pink-500 transition-all duration-300 hover:scale-110 hover:rotate-90"
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
                          ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg hover:shadow-pink-300/50 hover:from-pink-600 hover:to-violet-600'
                          : 'border-2 border-violet-200 text-violet-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 hover:border-pink-300'
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
                  <span className="text-violet-600 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full animate-pulse"></span>
                    排序方式
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
                            ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md hover:shadow-sky-300/50'
                            : 'text-violet-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-sky-600'
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
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700">
                      搜索 "<span className="font-semibold">{searchQuery}</span>" 的结果
                    </span>
                    {!isLoading && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {articles.length} 个结果
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

            {/* 📰 资讯列表 - 网格布局 */}
            <div>
              {isLoading && articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">暂无资讯</h3>
                  <p className="text-gray-500">
                    {searchQuery ? '没有找到相关资讯' : '资讯内容正在建设中...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* 🎯 一行2个卡片的网格布局 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                    <div 
                      key={article.id} 
                      className="group bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:bg-white/80 hover:scale-[1.02] animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => window.open(article.originalUrl, '_blank')}
                    >
                      {/* 📸 文章图片 */}
                      {article.imageUrls.length > 0 && (
                        <div className="relative overflow-hidden">
                          <img
                            src={article.imageUrls[0]}
                            alt={article.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* 热度标签 */}
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            🔥 {(article.hotScore || 0).toFixed(1)}
                          </div>
                        </div>
                      )}

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
                        {isLoading ? '加载中...' : '加载更多'}
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