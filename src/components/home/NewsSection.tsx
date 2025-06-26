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

  // 获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/labubu/news?limit=6')
        
        if (!response.ok) {
          throw new Error('获取新闻失败')
        }

        const data = await response.json()
        setNews(data.data || [])
        setError(null)
      } catch (err: any) {
        console.error('获取新闻失败:', err)
        setError(err.message)
        // 使用模拟数据作为fallback
        setNews(getMockNews())
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

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
    }
  ]

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">加载新闻中...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题和视图切换 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">📰 Labubu快报</h2>
            <p className="text-gray-600">获取最新的Labubu资讯和热门话题</p>
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
              <span className="text-sm font-medium">网格视图</span>
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
              <span className="text-sm font-medium">时间轴</span>
            </button>
          </div>
        </div>

        {/* 新闻内容 */}
        {viewMode === 'grid' ? (
          <NewsGrid news={news} />
        ) : (
          <NewsTimeline news={news} />
        )}

        {/* 查看更多按钮 */}
        <div className="text-center mt-8">
          <a
            href="/labubu-news"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
          >
            查看更多新闻
            <ChevronRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
} 