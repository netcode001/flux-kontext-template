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
        const newArticles = data.data.articles || []
        
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
        setTrendingKeywords(data.data.keywords || [])
        console.log('🔥 热搜数据获取成功:', data.data.keywords?.length)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* 📰 主要内容区域 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 🔍 搜索和筛选栏 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex flex-col gap-4">
                
                {/* 搜索框 */}
                <div className="relative">
                  <Search 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-purple-600 transition-colors" 
                    onClick={handleSearch}
                  />
                  <Input
                    placeholder="搜索Labubu资讯..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-12 pr-10 border-purple-200 focus:border-purple-400 text-lg"
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

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      variant={currentCategory === category.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.key)}
                      className={`flex items-center gap-2 ${
                        currentCategory === category.key
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">排序：</span>
                  {sortOptions.map((option) => (
                    <Button
                      key={option.key}
                      variant={currentSort === option.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleSortChange(option.key)}
                      className={`flex items-center gap-1 ${
                        currentSort === option.key
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
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

            {/* 📰 资讯列表 */}
            <div className="space-y-6">
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
                  {articles.map((article) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          
                          {/* 📸 文章图片 */}
                          {article.imageUrls.length > 0 && (
                            <div className="flex-shrink-0">
                              <img
                                src={article.imageUrls[0]}
                                alt={article.title}
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* 📝 文章内容 */}
                          <div className="flex-1 space-y-3">
                            
                            {/* 标题和来源 */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-purple-600 cursor-pointer">
                                {article.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {article.sourceName}
                                </Badge>
                                <span className="text-gray-500 text-xs">
                                  {formatTime(article.publishedAt)}
                                </span>
                                {article.author && (
                                  <span className="text-gray-500 text-xs">
                                    by {article.author}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 摘要 */}
                            {article.summary && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {article.summary}
                              </p>
                            )}

                            {/* 标签 */}
                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {article.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* 互动数据 */}
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.viewCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className={`w-4 h-4 ${article.isLiked ? 'text-red-500 fill-current' : ''}`} />
                                {article.likeCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="w-4 h-4" />
                                {article.shareCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium">{article.hotScore.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* 📄 加载更多 */}
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
                </>
              )}
            </div>
          </div>

          {/* 🔥 侧边栏 - 热搜排行榜 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* 热搜排行榜 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    🔥 Labubu热搜
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingKeywords.map((keyword) => (
                    <div
                      key={keyword.keyword}
                      onClick={() => handleTrendingClick(keyword.keyword)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold w-6 text-center ${
                          keyword.rank <= 3 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {keyword.rank}
                        </span>
                        <span className="text-sm font-medium">{keyword.keyword}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{keyword.trendIcon}</span>
                        <Badge className={`text-xs ${getHeatColor(keyword.heatLevel)}`}>
                          {keyword.hotScore.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 快捷分类 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    📂 资讯分类
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <Button
                      key={category.key}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryChange(category.key)}
                      className="w-full justify-start"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 