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

interface NewsGridProps {
  news: NewsItem[]
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化时间
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return '刚刚'
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}天前`
  }
}

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colors = {
    '热门': 'bg-red-100 text-red-700',
    '重要': 'bg-blue-100 text-blue-700',
    '创意': 'bg-green-100 text-green-700',
    '获奖': 'bg-yellow-100 text-yellow-700',
    '活动': 'bg-purple-100 text-purple-700',
    '指南': 'bg-orange-100 text-orange-700'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

export function NewsGrid({ news }: NewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <article
          key={item.id}
          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        >
          {/* 图片区域 */}
          <div className="relative h-48 overflow-hidden">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* 占位图 */}
              <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <div className="text-6xl">📰</div>
              </div>
            </div>
            
            {/* 分类标签 */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
            </div>
            
            {/* 时间 */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                <Calendar className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{formatTime(item.publishedAt)}</span>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4">
            {/* 标题 */}
            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
              <a href={item.url} className="hover:underline">
                {item.title}
              </a>
            </h3>
            
            {/* 描述 */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
            
            {/* 统计信息 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(item.viewCount)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(item.likeCount)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatNumber(item.commentCount)}</span>
                </span>
              </div>
              
              {/* 来源 */}
              <span className="text-purple-600 font-medium">
                {item.source}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
} 