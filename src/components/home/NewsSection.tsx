"use client"

import { useState, useEffect } from 'react'
import { Grid3X3, Clock, ChevronRight } from 'lucide-react'
import { NewsGrid } from './NewsGrid'
import { NewsTimeline } from './NewsTimeline'

// 新闻数据类型
interface NewsItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  source: string
  url: string
}

// 视图模式类型
type ViewMode = 'grid' | 'timeline'

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // 模拟新闻数据
  const getMockNews = (): NewsItem[] => [
    {
      id: '1',
      title: 'Labubu新系列即将发布，泡泡玛特官方预告',
      description: '泡泡玛特官方宣布，全新的Labubu梦境系列将于下周正式发布，包含多款限定版本...',
      image: '/images/news/labubu-new-series.jpg',
      category: '热门',
      publishedAt: '2024-01-21T15:30:00Z',
      viewCount: 103600,
      likeCount: 2300,
      commentCount: 156,
      source: 'labubu-official',
      url: '/news/1'
    },
    {
      id: '2',
      title: 'Lisa同款Labubu收藏指南：BLACKPINK成员最爱款式盘点',
      description: 'Lisa同款Labubu收藏全指南，粉丝必看收藏推荐，从经典款到限定版...',
      image: '/images/news/lisa-labubu-guide.jpg',
      category: '创意',
      publishedAt: '2024-01-21T14:20:00Z',
      viewCount: 98500,
      likeCount: 1800,
      commentCount: 89,
      source: 'kpop-collector',
      url: '/news/2'
    },
    {
      id: '3',
      title: '2024年度最受欢迎IP角色评选结果公布',
      description: 'Labubu在全球范围内获得巨大成功，荣获多项大奖，成为年度最受欢迎IP角色...',
      image: '/images/news/labubu-award.jpg',
      category: '获奖',
      publishedAt: '2024-01-20T20:45:00Z',
      viewCount: 91400,
      likeCount: 3100,
      commentCount: 234,
      source: 'ip-awards',
      url: '/news/3'
    },
    {
      id: '4',
      title: 'Labubu主题展览在上海K11开幕',
      description: '上海K11艺术购物中心举办的Labubu主题展览正式开幕，现场展示了数百款经典作品...',
      image: '/images/news/labubu-exhibition.jpg',
      category: '活动',
      publishedAt: '2024-01-20T09:15:00Z',
      viewCount: 87600,
      likeCount: 2100,
      commentCount: 167,
      source: 'art-exhibition',
      url: '/news/4'
    },
    {
      id: '5',
      title: 'DIY Labubu房间布置创意分享',
      description: '创意DIY达人分享如何用Labubu装饰房间，打造温馨可爱的个人空间...',
      image: '/images/news/labubu-diy-room.jpg',
      category: '创意',
      publishedAt: '2024-01-19T16:30:00Z',
      viewCount: 67200,
      likeCount: 1500,
      commentCount: 98,
      source: 'creative-diy',
      url: '/news/5'
    },
    {
      id: '6',
      title: 'Labubu购买指南2024：新手必看',
      description: '2024年最新Labubu购买指南，从入门款到收藏款，帮你找到最适合的款式...',
      image: '/images/news/labubu-buying-guide.jpg',
      category: '指南',
      publishedAt: '2024-01-19T12:00:00Z',
      viewCount: 156800,
      likeCount: 4200,
      commentCount: 312,
      source: 'buying-guide',
      url: '/news/6'
    }
  ]

  // 获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/labubu/news?limit=6')
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        
        // 确保数据是数组格式
        let newsData: NewsItem[] = []
        
        if (data && data.success && data.data && data.data.articles && Array.isArray(data.data.articles)) {
          // API返回的格式: { success: true, data: { articles: [...] } }
          const articles = data.data.articles
          newsData = articles.map((article: any) => ({
            id: article.id,
            title: article.title,
            description: article.summary || article.content?.substring(0, 100) + '...',
            image: article.image_urls?.[0] || '/images/news/default.jpg',
            category: article.category || '资讯',
            publishedAt: article.published_at,
            viewCount: article.view_count || 0,
            likeCount: article.like_count || 0,
            commentCount: article.comment_count || 0,
            source: article.source_name || 'labubu',
            url: `/labubu-news/${article.id}`
          }))
        } else if (data && Array.isArray(data)) {
          // 如果直接返回数组
          newsData = data
        } else if (data && data.data && Array.isArray(data.data)) {
          // 如果返回 { data: [...] } 格式
          newsData = data.data
        } else if (data && data.posts && Array.isArray(data.posts)) {
          // 如果返回 { posts: [...] } 格式
          newsData = data.posts
        } else {
          // 如果数据格式不符合预期，使用模拟数据
          console.warn('API返回的数据格式不符合预期，使用模拟数据')
          newsData = getMockNews()
        }
        
        setNews(newsData)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch news:', err)
        setError(err.message)
        // 使用模拟数据作为fallback
        setNews(getMockNews())
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading news...</p>
          </div>
        </div>
      </section>
    )
  }

  // 确保news是数组
  const safeNews = Array.isArray(news) ? news : getMockNews()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题和视图切换 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">📰 Labubu News</h2>
            <p className="text-gray-600">Get the latest Labubu updates and trending topics</p>
          </div>
          
          {/* 视图切换按钮 */}
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">Grid View</span>
            </button>
            
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                viewMode === 'timeline'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Timeline</span>
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">
              Error loading news: {error}, using mock data
            </p>
          </div>
        )}

        {/* 新闻内容 */}
        {viewMode === 'grid' ? (
          <NewsGrid news={safeNews} />
        ) : (
          <NewsTimeline news={safeNews} />
        )}

        {/* 查看更多按钮 */}
        <div className="text-center mt-8">
          <a
            href="/labubu-news"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
          >
            View More News
            <ChevronRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
} 