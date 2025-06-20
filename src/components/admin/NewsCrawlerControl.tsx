"use client"

// 📰 新闻爬虫控制面板
// 管理员可以手动触发新闻获取和查看状态

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RefreshCw, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface CrawlerStatus {
  status: string
  lastRun: string | null
  sources: string[]
  message: string
}

interface CrawlerResult {
  articlesCount: number
  message: string
  timestamp: string
}

export function NewsCrawlerControl() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<CrawlerStatus | null>(null)
  const [lastResult, setLastResult] = useState<CrawlerResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 🔍 获取爬虫状态
  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/news-crawler')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error || '获取状态失败')
      }
    } catch (error) {
      setError('网络请求失败')
      console.error('获取爬虫状态失败:', error)
    }
  }

  // 🚀 手动触发新闻获取
  const triggerCrawler = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/news-crawler', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLastResult(data.data)
        // 获取更新后的状态
        await fetchStatus()
      } else {
        setError(data.error || '获取新闻失败')
      }
    } catch (error) {
      setError('网络请求失败')
      console.error('触发爬虫失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 🎨 获取状态图标和颜色
  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    if (error) return <AlertCircle className="w-5 h-5 text-red-500" />
    if (lastResult) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <Clock className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      
      {/* 📊 控制面板标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📰 新闻爬虫控制台
          </h2>
          <p className="text-gray-600 mt-1">
            管理热点新闻和社交媒体内容获取
          </p>
        </div>
        <Button
          onClick={fetchStatus}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          刷新状态
        </Button>
      </div>

      {/* 🚀 主要控制区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 🎮 操作控制卡片 */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🎮 操作控制
              {getStatusIcon()}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 触发按钮 */}
            <Button
              onClick={triggerCrawler}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  正在获取新闻...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  手动获取新闻
                </>
              )}
            </Button>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">操作失败</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* 成功结果 */}
            {lastResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">获取成功</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  新增 {lastResult.articlesCount} 篇文章
                </p>
                <p className="text-green-500 text-xs mt-1">
                  {new Date(lastResult.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 📊 状态信息卡片 */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📊 系统状态
            </h3>
          </CardHeader>
          <CardContent>
            {status ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">服务状态</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {status.status === 'ready' ? '就绪' : status.status}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">数据源</span>
                  <div className="mt-2 space-y-1">
                    {status.sources.map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">{status.message}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">点击"刷新状态"获取系统信息</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📝 使用说明 */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📝 使用说明
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🌐 数据源说明</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• RSS新闻源：BBC、CNN、Reuters等</li>
                <li>• 娱乐资讯：Entertainment Weekly、Hypebeast</li>
                <li>• 社交媒体：模拟热门Labubu相关内容</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">⚡ 功能特性</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 自动内容分类和标签提取</li>
                <li>• 智能去重和质量筛选</li>
                <li>• 热度分数计算和排序</li>
                <li>• 热搜关键词自动更新</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 