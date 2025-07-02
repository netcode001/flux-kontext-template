"use client"

import { Eye, Heart, MessageCircle, Calendar } from 'lucide-react'

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

interface NewsTimelineProps {
  news: NewsItem[]
}

// 获取分类颜色
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    '热门': 'bg-red-100 text-red-700',
    '创意': 'bg-blue-100 text-blue-700',
    '获奖': 'bg-yellow-100 text-yellow-700',
    '活动': 'bg-green-100 text-green-700',
    '指南': 'bg-purple-100 text-purple-700',
    '资讯': 'bg-gray-100 text-gray-700'
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

// 按日期分组新闻
function groupNewsByDate(news: NewsItem[]): { [key: string]: NewsItem[] } {
  const grouped: { [key: string]: NewsItem[] } = {}
  
  news.forEach(item => {
    const date = new Date(item.publishedAt)
    const dateKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(item)
  })
  
  // 按日期排序
  return Object.fromEntries(
    Object.entries(grouped).sort((a, b) => {
      const dateA = new Date(a[1][0].publishedAt)
      const dateB = new Date(b[1][0].publishedAt)
      return dateB.getTime() - dateA.getTime()
    })
  )
}

export function NewsTimeline({ news }: NewsTimelineProps) {
  // 确保news是数组
  const safeNews = Array.isArray(news) ? news : []
  
  // 如果没有数据，显示空状态
  if (safeNews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-600">No news data available</p>
      </div>
    )
  }

  const groupedNews = groupNewsByDate(safeNews)

  return (
    <div className="relative">
      {/* 时间轴线 */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
      
      {/* 时间轴内容 */}
      <div className="space-y-8">
        {Object.entries(groupedNews).map(([dateKey, dateNews]) => (
          <div key={dateKey} className="relative">
            {/* 日期标题 */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                📅
              </div>
              <h3 className="text-xl font-bold text-gray-800">{dateKey}</h3>
            </div>
            
            {/* 该日期的新闻列表 */}
            <div className="space-y-4">
              {dateNews.map((item) => (
                <article
                  key={item.id}
                  className="relative flex items-start space-x-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* 时间点 */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl">
                    📰
                  </div>
                  
                  {/* 新闻内容 */}
                  <div className="flex-1">
                    {/* 头部信息 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-purple-600">
                          {formatTime(item.publishedAt)}
                        </span>
                        <span className={`px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* 标题 */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-purple-600 transition-colors">
                      <a href={item.url} className="hover:underline">
                        {item.title}
                      </a>
                    </h3>
                    
                    {/* 描述 */}
                    <p className="text-gray-600 text-sm mb-3">
                      {item.description}
                    </p>
                    
                    {/* 统计信息 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(item.viewCount)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{formatNumber(item.likeCount)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{formatNumber(item.commentCount)}</span>
                      </span>
                      <span className="text-purple-600 font-medium">
                        by {item.source}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 