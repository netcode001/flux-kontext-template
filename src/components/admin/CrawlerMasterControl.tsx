// 🕷️ 爬虫总控制面板 (临时版本)
// 不依赖数据库表的爬虫开关管理

"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CrawlerStatus {
  name: string
  displayName: string
  isEnabled: boolean
  description: string
  icon: string
}

export function CrawlerMasterControl() {
  const [crawlers, setCrawlers] = useState<CrawlerStatus[]>([
    {
      name: 'x_api_crawler',
      displayName: 'X API爬虫',
      isEnabled: false,
      description: '抓取X平台Labubu相关推文',
      icon: '🐦'
    },
    {
      name: 'news_crawler',
      displayName: '新闻爬虫',
      isEnabled: false,
      description: '抓取新闻网站Labubu相关文章',
      icon: '📰'
    },
    {
      name: 'advanced_content_crawler',
      displayName: '高级内容爬虫',
      isEnabled: false,
      description: '抓取微博、小红书等平台内容',
      icon: '🔍'
    },
    {
      name: 'python_crawler',
      displayName: 'Python爬虫',
      isEnabled: false,
      description: '使用Python抓取Reddit等平台',
      icon: '🐍'
    },
    {
      name: 'youtube_crawler',
      displayName: 'YouTube爬虫',
      isEnabled: false,
      description: '抓取YouTube Labubu相关视频',
      icon: '📺'
    }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 从localStorage加载状态
  useEffect(() => {
    const savedStates = localStorage.getItem('crawler_states')
    if (savedStates) {
      try {
        const states = JSON.parse(savedStates)
        setCrawlers(prev => prev.map(crawler => ({
          ...crawler,
          isEnabled: states[crawler.name] || false
        })))
      } catch (error) {
        console.error('加载爬虫状态失败:', error)
      }
    }
  }, [])

  // 保存状态到localStorage
  const saveStates = (newCrawlers: CrawlerStatus[]) => {
    const states = newCrawlers.reduce((acc, crawler) => {
      acc[crawler.name] = crawler.isEnabled
      return acc
    }, {} as Record<string, boolean>)
    
    localStorage.setItem('crawler_states', JSON.stringify(states))
  }

  // 切换单个爬虫状态
  const toggleCrawler = (crawlerName: string) => {
    const newCrawlers = crawlers.map(crawler => 
      crawler.name === crawlerName 
        ? { ...crawler, isEnabled: !crawler.isEnabled }
        : crawler
    )
    
    setCrawlers(newCrawlers)
    saveStates(newCrawlers)
    
    const crawler = newCrawlers.find(c => c.name === crawlerName)
    setMessage(`✅ ${crawler?.displayName} ${crawler?.isEnabled ? '已启用' : '已关闭'}`)
    
    // 3秒后清除消息
    setTimeout(() => setMessage(''), 3000)
  }

  // 全部启用
  const enableAll = () => {
    const newCrawlers = crawlers.map(crawler => ({ ...crawler, isEnabled: true }))
    setCrawlers(newCrawlers)
    saveStates(newCrawlers)
    setMessage('✅ 所有爬虫已启用')
    setTimeout(() => setMessage(''), 3000)
  }

  // 全部关闭
  const disableAll = () => {
    const newCrawlers = crawlers.map(crawler => ({ ...crawler, isEnabled: false }))
    setCrawlers(newCrawlers)
    saveStates(newCrawlers)
    setMessage('🔴 所有爬虫已关闭')
    setTimeout(() => setMessage(''), 3000)
  }

  // 获取爬虫状态 (供其他组件调用)
  const getCrawlerStatus = (crawlerName: string): boolean => {
    const crawler = crawlers.find(c => c.name === crawlerName)
    return crawler?.isEnabled || false
  }

  // 将状态暴露到全局 (临时方案)
  useEffect(() => {
    ;(window as any).getCrawlerStatus = getCrawlerStatus
  }, [crawlers])

  const enabledCount = crawlers.filter(c => c.isEnabled).length
  const totalCount = crawlers.length

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* 标题和总控制 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🕷️ 爬虫总控制面板</h2>
            <p className="text-gray-600">
              统一管理所有爬虫的开关状态 ({enabledCount}/{totalCount} 启用)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={enableAll}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              🟢 全部启用
            </Button>
            
            <Button
              onClick={disableAll}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              🔴 全部关闭
            </Button>
          </div>
        </div>

        {/* 爬虫列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crawlers.map((crawler) => (
            <Card key={crawler.name} className="p-4">
              <div className="space-y-3">
                {/* 爬虫信息 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{crawler.icon}</span>
                    <div>
                      <h3 className="font-semibold">{crawler.displayName}</h3>
                      <p className="text-xs text-gray-500">{crawler.description}</p>
                    </div>
                  </div>
                  
                  <Badge variant={crawler.isEnabled ? "default" : "secondary"}>
                    {crawler.isEnabled ? '🟢 启用' : '🔴 关闭'}
                  </Badge>
                </div>

                {/* 控制按钮 */}
                <Button
                  onClick={() => toggleCrawler(crawler.name)}
                  disabled={isLoading}
                  variant={crawler.isEnabled ? "destructive" : "default"}
                  size="sm"
                  className="w-full"
                >
                  {crawler.isEnabled ? '🔴 关闭' : '🟢 启用'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* 状态消息 */}
        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}

        {/* 使用说明 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">💡 使用说明</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• <strong>总开关:</strong> 关闭的爬虫无法执行数据抓取任务</p>
            <p>• <strong>状态保存:</strong> 开关状态会自动保存到浏览器本地存储</p>
            <p>• <strong>批量操作:</strong> 可以一键启用或关闭所有爬虫</p>
            <p>• <strong>独立控制:</strong> 每个爬虫都可以单独启用或关闭</p>
            <p>• <strong>实时生效:</strong> 开关状态立即生效，无需重启服务</p>
          </div>
        </Card>
      </div>
    </Card>
  )
} 